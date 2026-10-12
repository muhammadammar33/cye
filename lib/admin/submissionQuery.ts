import "server-only";
import { and, asc, eq, ilike, inArray, isNull, or, sql, type SQL } from "drizzle-orm";
import { requireDb, schema as s } from "@/lib/db";
import { SUBMISSION_STATUSES, SUBMISSION_TYPES, type SubmissionStatus, type SubmissionType } from "@/lib/db/schema";
import { GENDERS } from "@/data/event";
import { PAYMENT_STATUSES } from "@/lib/admin/labels";

export const GENDER_FILTERS = [...GENDERS, "none"] as const;
export type GenderFilter = (typeof GENDER_FILTERS)[number];

export const PAYMENT_FILTERS = [...PAYMENT_STATUSES, "none"] as const;
export type PaymentFilter = (typeof PAYMENT_FILTERS)[number];

export type SubmissionFilters = { type?: SubmissionType; status?: SubmissionStatus; gender?: GenderFilter; payment?: PaymentFilter; q?: string; uni?: string[] };

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
  const q = one(params.q)?.trim();
  const uni = [...new Set(many(params.uni).map((u) => u.trim().toLowerCase()).filter(Boolean))].slice(0, 200);
  return {
    type: SUBMISSION_TYPES.includes(type as SubmissionType) ? (type as SubmissionType) : undefined,
    status: SUBMISSION_STATUSES.includes(status as SubmissionStatus) ? (status as SubmissionStatus) : undefined,
    gender: GENDER_FILTERS.includes(gender as GenderFilter) ? (gender as GenderFilter) : undefined,
    payment: PAYMENT_FILTERS.includes(payment as PaymentFilter) ? (payment as PaymentFilter) : undefined,
    q: q || undefined,
    uni: uni.length ? uni : undefined,
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
  if (f.uni?.length) parts.push(inArray(institutionKey, f.uni));
  if (f.q) {
    const like = `%${f.q.replace(/[%_]/g, "\\$&")}%`;
    parts.push(or(ilike(s.submissions.name, like), ilike(s.submissions.email, like), ilike(s.submissions.subject, like), ilike(s.submissions.institution, like), ilike(s.submissions.phone, like))!);
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
