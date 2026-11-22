import "server-only";
import { and, asc, eq, ilike, inArray, isNull, or, sql, type SQL } from "drizzle-orm";
import { requireDb, schema as s } from "@/lib/db";
import { SUBMISSION_STATUSES, SUBMISSION_TYPES, type SubmissionStatus, type SubmissionType } from "@/lib/db/schema";
import { GENDERS } from "@/data/event";
import { PAYMENT_STATUSES, PRE_EVENT_RESULTS } from "@/lib/admin/labels";

export const GENDER_FILTERS = [...GENDERS, "none"] as const;
export type GenderFilter = (typeof GENDER_FILTERS)[number];

export const PAYMENT_FILTERS = [...PAYMENT_STATUSES, "none"] as const;
export type PaymentFilter = (typeof PAYMENT_FILTERS)[number];

export const PRE_EVENT_FILTERS = [...PRE_EVENT_RESULTS, "pending", "has_absent"] as const;
export type PreEventFilter = (typeof PRE_EVENT_FILTERS)[number];

export type SubmissionFilters = { type?: SubmissionType; status?: SubmissionStatus; gender?: GenderFilter; payment?: PaymentFilter; pre?: PreEventFilter; q?: string; uni?: string[]; comp?: string; coupon?: string };

/**
 * Institution names as typed by applicants, folded so "COMSATS", " comsats " and "Comsats." count as one.
 * Different wordings ("COMSATS University Wah") stay separate options.
 */
export const institutionKey = sql<string>`lower(regexp_replace(regexp_replace(btrim(${s.submissions.institution}), '\\s+', ' ', 'g'), '[\\s.,]+$', ''))`;

export function parseFilters(params: Record<string, string | string[] | undefined>): SubmissionFilters {
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const many = (v: string | string[] | undefined) => (Array.isArray(v) ? v : v ? [v] : []);
  const type = one(params.type);
  const status = one(params.status);
  const gender = one(params.gender);
  const payment = one(params.payment);
  const pre = one(params.pre);
  const q = one(params.q)?.trim();
  const comp = one(params.comp)?.trim();
  const coupon = one(params.coupon)?.trim().toUpperCase().slice(0, 40);
  const uni = [...new Set(many(params.uni).map((u) => u.trim().toLowerCase()).filter(Boolean))].slice(0, 200);
  return {
    type: SUBMISSION_TYPES.includes(type as SubmissionType) ? (type as SubmissionType) : undefined,
    status: SUBMISSION_STATUSES.includes(status as SubmissionStatus) ? (status as SubmissionStatus) : undefined,
    gender: GENDER_FILTERS.includes(gender as GenderFilter) ? (gender as GenderFilter) : undefined,
    payment: PAYMENT_FILTERS.includes(payment as PaymentFilter) ? (payment as PaymentFilter) : undefined,
    pre: PRE_EVENT_FILTERS.includes(pre as PreEventFilter) ? (pre as PreEventFilter) : undefined,
    q: q || undefined,
    uni: uni.length ? uni : undefined,
    comp: comp || undefined,
    coupon: coupon ? (coupon === "ANY" ? "any" : coupon) : undefined,
  };
}

/** Reads every value of repeated query parameters (?uni=a&uni=b). */
export function paramsFrom(search: URLSearchParams) {
  const out: Record<string, string | string[]> = {};
  for (const key of new Set(search.keys())) {
    const all = search.getAll(key);
    out[key] = all.length > 1 ? all : all[0];
  }
  return out;
}

export function whereFor(f: SubmissionFilters): SQL | undefined {
  const parts: SQL[] = [];
  if (f.type) parts.push(eq(s.submissions.type, f.type));
  if (f.status) parts.push(eq(s.submissions.status, f.status));
  if (f.gender) parts.push(f.gender === "none" ? isNull(s.submissions.gender) : eq(s.submissions.gender, f.gender));
  if (f.payment) {
    // Payment only applies to competition registrations.
    parts.push(eq(s.submissions.type, "competition"));
    parts.push(f.payment === "none" ? isNull(s.submissions.paymentStatus) : eq(s.submissions.paymentStatus, f.payment));
  }
  if (f.pre) {
    // Pre-event results only exist on competition registrations.
    parts.push(eq(s.submissions.type, "competition"));
    if (f.pre === "pending") parts.push(isNull(s.submissions.preEventResult));
    else if (f.pre === "has_absent") parts.push(sql`jsonb_array_length(coalesce(${s.submissions.preEventAbsent}, '[]'::jsonb)) > 0`);
    else parts.push(eq(s.submissions.preEventResult, f.pre));
  }
  if (f.comp) {
    // A competition registration stores the competition's name as its subject.
    parts.push(eq(s.submissions.type, "competition"));
    parts.push(eq(s.submissions.subject, f.comp));
  }
  if (f.coupon) {
    // Coupons only apply to competition registrations; "any" means a coupon was used at all.
    const code = sql<string>`${s.submissions.data}->>'coupon'`;
    parts.push(eq(s.submissions.type, "competition"));
    parts.push(f.coupon === "any" ? sql`${code} is not null` : sql`upper(${code}) = ${f.coupon}`);
  }
  if (f.uni?.length) parts.push(inArray(institutionKey, f.uni));
  if (f.q) {
    const like = `%${f.q.replace(/[%_]/g, "\\$&")}%`;
    parts.push(or(ilike(s.submissions.name, like), ilike(s.submissions.email, like), ilike(s.submissions.subject, like), ilike(s.submissions.institution, like), ilike(s.submissions.phone, like), ilike(sql`${s.submissions.data}->>'coupon'`, like), ilike(sql`${s.submissions.data}->>'mergedFrom'`, like))!);
  }
  return parts.length ? and(...parts) : undefined;
}

export function filterQuery(f: SubmissionFilters, extra: Record<string, string | number> = {}) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries({ ...f, ...extra })) {
    if (Array.isArray(v)) v.forEach((item) => params.append(k, item));
    else if (v !== undefined && v !== "") params.set(k, String(v));
  }
  const str = params.toString();
  return str ? `?${str}` : "";
}

export type InstitutionOption = { key: string; label: string; count: number };

/** Every distinct institution (folded as above), labelled with its most common spelling. */
export async function institutionOptions(type?: SubmissionType): Promise<InstitutionOption[]> {
  const conditions = [sql`nullif(btrim(${s.submissions.institution}), '') is not null`];
  if (type) conditions.push(eq(s.submissions.type, type));
  const rows = await requireDb()
    .select({
      key: institutionKey,
      label: sql<string>`mode() within group (order by btrim(${s.submissions.institution}))`,
      count: sql<number>`count(*)::int`,
    })
    .from(s.submissions)
    .where(and(...conditions))
    .groupBy(institutionKey)
    .orderBy(asc(institutionKey));
  return rows;
}

/** Competitions that have registrations, with how many each has. */
export async function competitionOptions() {
  return requireDb()
    .select({ name: sql<string>`${s.submissions.subject}`, count: sql<number>`count(*)::int` })
    .from(s.submissions)
    .where(and(eq(s.submissions.type, "competition"), sql`nullif(btrim(${s.submissions.subject}), '') is not null`))
    .groupBy(s.submissions.subject)
    .orderBy(asc(s.submissions.subject));
}

/** Coupon codes used on competition registrations, most used first, with the head ambassador they belong to. */
export async function couponOptions() {
  const code = sql<string>`upper(${s.submissions.data}->>'coupon')`;
  const used = await requireDb()
    .select({ code, count: sql<number>`count(*)::int` })
    .from(s.submissions)
    .where(and(eq(s.submissions.type, "competition"), sql`${s.submissions.data}->>'coupon' is not null`))
    .groupBy(code);
  const owners = await requireDb().select({ code: s.ambassadors.coupon, name: s.ambassadors.name }).from(s.ambassadors).where(sql`${s.ambassadors.coupon} is not null`);
  const who = new Map(owners.map((o) => [String(o.code).toUpperCase(), o.name]));
  return used.map((u) => ({ ...u, name: who.get(u.code) ?? null })).sort((a, b) => b.count - a.count || a.code.localeCompare(b.code));
}
