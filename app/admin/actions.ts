"use server";

import bcrypt from "bcryptjs";
import { and, count, eq, inArray, isNull } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { endSession, requireAdmin, requireGateAccess, startSession } from "@/lib/auth";
import { uploadImage } from "@/lib/blob";
import { CONTENT_TAG, getSettings } from "@/lib/content";
import { db, requireDb, schema as s } from "@/lib/db";
import { SUBMISSION_STATUSES, type SubmissionStatus } from "@/lib/db/schema";
import { DEFAULT_SETTINGS } from "@/lib/defaults";
import { discountedFee, normalizeCoupon } from "@/lib/coupons";
import { CHOICE_FIELDS, choiceFor } from "@/lib/competitionOptions";
import { ENTITIES, isEntity, type FieldDef } from "@/lib/admin/entities";
import { PAYMENT_STATUSES, PRE_EVENT_LABELS, PRE_EVENT_RESULTS, STATUS_LABELS, TYPE_NAMES, type PreEventResult } from "@/lib/admin/labels";
import { applyPreEventResults, matchResults, saveResults, type CsvMatch, type CsvProblem } from "@/lib/preEvents";
import { member as memberSchema } from "@/lib/submissions";
import { parseFilters, whereFor } from "@/lib/admin/submissionQuery";
import { GENDERS } from "@/data/event";
import { logActivity } from "@/lib/admin/log";
import { judgeEmail, sendEmail } from "@/lib/email";
import { sendConfirmation } from "@/lib/confirmation";
import { focalsOf } from "@/lib/focals";
import { fillJudgeTemplate, splitEmails } from "@/lib/judgeEmail";
import { emailPasses, holdersFor, issueForSubmissions, issueManualPass, passByToken, passOrigin, revokeForSubmissions } from "@/lib/passes";
import { MANUAL_PASS_CATEGORIES, PASS_CATEGORIES, PASS_FOR_TYPE, type PassCategory } from "@/lib/passCategories";

export type ActionState = { error?: string; ok?: string } | undefined;

/** Number of payment account rows in Admin → Settings. */
const PAYMENT_SLOTS = 4;

// Compared against when the email is unknown, so failed logins take the same time either way.
const DUMMY_HASH = "$2b$12$EWGzmlVP52KFwBHFVeUbM.EagAw/tc2O.K1WXn1L8JHtvt7tBSkie";

/** Expire cached content and every prerendered public page. */
function refreshContent() {
  updateTag(CONTENT_TAG);
  revalidatePath("/", "layout");
}

/** JSON with object keys sorted, so stored and submitted values compare equal regardless of key order. */
function stable(value: unknown): string {
  return JSON.stringify(value ?? null, (_key, v) =>
    v && typeof v === "object" && !Array.isArray(v) && !(v instanceof Date) ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => a.localeCompare(b))) : v,
  );
}

/** A readable name for a content row: its name, or a contact's label. */
function rowName(row: Record<string, unknown> | undefined) {
  return String(row?.name ?? row?.label ?? "");
}

/* ----------------------------- auth ----------------------------- */

export async function login(_prev: ActionState, form: FormData): Promise<ActionState> {
  if (!db) return { error: "The database is not configured (DATABASE_URL)." };
  if (!process.env.AUTH_SECRET || process.env.AUTH_SECRET.length < 32) return { error: "AUTH_SECRET is not configured." };
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  const [admin] = await db.select().from(s.admins).where(eq(s.admins.email, email)).limit(1);
  const ok = await bcrypt.compare(password, admin?.passwordHash ?? DUMMY_HASH);
  if (!admin || !ok) {
    await logActivity(admin ?? { id: null, name: "Unknown", email: email.slice(0, 200) }, "Failed sign-in");
    return { error: "Incorrect email or password." };
  }
  await logActivity(admin, "Signed in");
  await db.update(s.admins).set({ lastLoginAt: new Date() }).where(eq(s.admins.id, admin.id));
  await startSession(admin);
  const next = String(form.get("next") ?? "");
  if (admin.role === "gate") redirect("/admin/gate");
  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function logout() {
  await logActivity(await requireAdmin(), "Signed out");
  await endSession();
  redirect("/admin/login");
}

/* -------------------------- submissions -------------------------- */

export async function updateSubmission(id: number, _prev: ActionState, form: FormData): Promise<ActionState> {
  const me = await requireAdmin();
  const status = String(form.get("status")) as SubmissionStatus;
  if (!SUBMISSION_STATUSES.includes(status)) return { error: "Invalid status." };
  const notes = String(form.get("notes") ?? "").slice(0, 10_000);
  const genderRaw = String(form.get("gender") ?? "");
  const gender = (GENDERS as readonly string[]).includes(genderRaw) ? genderRaw : null;
  const paymentRaw = form.get("payment");
  const database = requireDb();
  const [before] = await database.select().from(s.submissions).where(eq(s.submissions.id, id)).limit(1);
  if (!before) return { error: "This submission no longer exists." };
  const paymentStatus =
    before.type === "competition" && paymentRaw !== null
      ? ((PAYMENT_STATUSES as readonly string[]).includes(String(paymentRaw)) ? String(paymentRaw) : null)
      : before.paymentStatus;
  await database.update(s.submissions).set({ status, notes: notes || null, gender, paymentStatus }).where(eq(s.submissions.id, id));
  const changes = [
    (before.paymentStatus ?? null) !== (paymentStatus ?? null) ? `Payment: ${before.paymentStatus ?? "not checked"} to ${paymentStatus ?? "not checked"}` : "",
    (before.gender ?? null) !== gender ? `Gender: ${before.gender ?? "not set"} to ${gender ?? "not set"}` : "",
    before.status !== status ? `Status: ${STATUS_LABELS[before.status]} to ${STATUS_LABELS[status]}` : "",
    (before.notes ?? "") !== notes ? "Notes updated" : "",
  ].filter(Boolean);
  if (changes.length) await logActivity(me, "Updated submission", `#${id} ${before.name} (${TYPE_NAMES[before.type]})`, changes.join("; "));
  const passNote = before.status !== status ? await syncPasses(me, [id], status) : "";
  const restored = await confirmRestored(me, [before], status);
  revalidatePath("/admin", "layout");
  return { ok: `Saved.${passNote}${restored ? " The confirmation email was sent to the applicant." : ""}` };
}

/**
 * Archived submissions moved back to New get the applicant's confirmation email, unless they already had it
 * (data.confirmationSentAt). Returns how many were emailed.
 */
async function confirmRestored(me: { id: number; name: string; email: string }, before: (typeof s.submissions.$inferSelect)[], status: SubmissionStatus) {
  if (status !== "new") return 0;
  const due = before.filter((b) => b.status === "archived" && !(b.data as Record<string, unknown>).confirmationSentAt);
  if (!due.length) return 0;
  const origin = await passOrigin();
  let sent = 0;
  for (const b of due) if (await sendConfirmation({ ...b, status }, origin)) sent++;
  await logActivity(me, "Sent confirmation emails", `${sent} of ${due.length} restored from Archived`, due.map((b) => `#${b.id} ${b.email}`).join(", ").slice(0, 2000));
  return sent;
}

/**
 * Keeps passes in step with a status change: approving issues and emails the missing passes,
 * any other status cancels the valid ones. Returns a short note for the admin.
 */
async function syncPasses(me: { id: number; name: string; email: string }, ids: number[], status: SubmissionStatus) {
  if (status !== "approved") {
    const revoked = await revokeForSubmissions(ids);
    if (revoked) await logActivity(me, "Cancelled passes", `${revoked} pass${revoked === 1 ? "" : "es"}`, `Submissions ${ids.map((n) => `#${n}`).join(", ")} no longer approved`);
    return revoked ? ` ${revoked} pass${revoked === 1 ? "" : "es"} cancelled.` : "";
  }
  const created = await issueForSubmissions(ids, me.name);
  if (!created.length) return "";
  const origin = await passOrigin();
  await logActivity(me, "Issued passes", `${created.length} pass${created.length === 1 ? "" : "es"}`, created.map((p) => `${p.code} ${p.name}`).join(", ").slice(0, 2000));
  after(() => emailPasses(created, origin));
  return ` ${created.length} pass${created.length === 1 ? "" : "es"} issued and being emailed.`;
}

const INLINE_FIELDS = {
  gender: { column: "gender", label: "Gender", empty: "not set", allowed: GENDERS as readonly string[], competitionOnly: false },
  payment: { column: "paymentStatus", label: "Payment", empty: "not checked", allowed: PAYMENT_STATUSES as readonly string[], competitionOnly: true },
  preEvent: { column: "preEventResult", label: "Pre-event", empty: "pending", allowed: PRE_EVENT_RESULTS as readonly string[], competitionOnly: true },
} as const;
export type InlineField = keyof typeof INLINE_FIELDS;

/** Inline pickers in the submissions table (gender, payment verification); saves immediately. */
export async function setSubmissionField(id: number, field: InlineField, value: string): Promise<ActionState> {
  const me = await requireAdmin();
  const def = INLINE_FIELDS[field];
  if (!def) return { error: "Unknown field." };
  const next = def.allowed.includes(value) ? value : null;
  const database = requireDb();
  const [before] = await database.select().from(s.submissions).where(eq(s.submissions.id, id)).limit(1);
  if (!before) return { error: "This submission no longer exists." };
  if (def.competitionOnly && before.type !== "competition") return { error: `${def.label} only applies to competition registrations.` };
  const prev = (before[def.column] as string | null) ?? null;
  if (prev === next) return { ok: "Saved." };
  await database.update(s.submissions).set({ [def.column]: next }).where(eq(s.submissions.id, id));
  await logActivity(me, "Updated submission", `#${id} ${before.name} (${TYPE_NAMES[before.type]})`, `${def.label}: ${prev ?? def.empty} to ${next ?? def.empty}`);
  // A team marked Qualified on an approved registration now gets its Competitor passes.
  const note = field === "preEvent" && next === "qualified" && before.status === "approved" ? await syncPasses(me, [id], "approved") : "";
  revalidatePath("/admin", "layout");
  return { ok: `Saved.${note}` };
}

/**
 * Rows a bulk action applies to: the ticked rows, or with allMatching=1 every submission matching the list's
 * filter (re-run here from the filter the page sent, so nothing outside it is touched).
 */
async function bulkIds(form: FormData) {
  if (form.get("allMatching") === "1") {
    const params = new URLSearchParams(String(form.get("filters") ?? "").replace(/^\?/, ""));
    const record: Record<string, string | string[]> = {};
    for (const key of new Set(params.keys())) record[key] = params.getAll(key).length > 1 ? params.getAll(key) : (params.get(key) ?? "");
    const rows = await requireDb().select({ id: s.submissions.id }).from(s.submissions).where(whereFor(parseFilters(record)));
    return rows.map((r) => r.id);
  }
  return form.getAll("ids").map(Number).filter(Number.isInteger);
}

/** Short list of ids for the activity log. */
const idList = (ids: number[]) => (ids.length > 30 ? `${ids.slice(0, 30).map((n) => `#${n}`).join(", ")} and ${ids.length - 30} more` : ids.map((n) => `#${n}`).join(", "));

export async function bulkSetStatus(form: FormData) {
  const me = await requireAdmin();
  const status = String(form.get("bulkStatus")) as SubmissionStatus;
  const ids = await bulkIds(form);
  if (!SUBMISSION_STATUSES.includes(status) || ids.length === 0) return;
  const before = status === "new" ? await requireDb().select().from(s.submissions).where(inArray(s.submissions.id, ids)) : [];
  await requireDb().update(s.submissions).set({ status }).where(inArray(s.submissions.id, ids));
  await logActivity(
    me,
    "Bulk status change",
    `${ids.length} submission${ids.length === 1 ? "" : "s"}: ${idList(ids)}`,
    `Marked as ${STATUS_LABELS[status]}`,
  );
  await syncPasses(me, ids, status);
  await confirmRestored(me, before, status);
  revalidatePath("/admin", "layout");
}

export async function deleteSubmission(id: number) {
  const me = await requireAdmin();
  const database = requireDb();
  const [row] = await database.select().from(s.submissions).where(eq(s.submissions.id, id)).limit(1);
  await database.delete(s.submissions).where(eq(s.submissions.id, id));
  if (row) await logActivity(me, "Deleted submission", `#${id} ${row.name} (${TYPE_NAMES[row.type]})`, `${row.email}${row.subject ? `, ${row.subject}` : ""}`);
  revalidatePath("/admin", "layout");
  redirect("/admin/submissions");
}

/* ---------------------------- content ---------------------------- */

async function readField(field: FieldDef, form: FormData, folder: string): Promise<unknown> {
  const raw = form.get(field.name);
  switch (field.kind) {
    case "checkbox":
      return raw === "on";
    case "number": {
      const n = Number(raw);
      if (raw === null || raw === "" || !Number.isFinite(n)) {
        if (field.required) throw new Error(`${field.label} is required.`);
        return 0;
      }
      return Math.trunc(n);
    }
    case "list": {
      const items = String(raw ?? "").split("\n").map((line) => line.trim()).filter(Boolean);
      if (field.required && items.length === 0) throw new Error(`${field.label} is required.`);
      return items;
    }
    case "image": {
      if (form.get(`${field.name}_remove`) === "on") return null;
      const file = form.get(`${field.name}_file`);
      if (file instanceof File && file.size > 0) return uploadImage(file, folder);
      const value = String(raw ?? "").trim();
      // next/image only serves site files and Vercel Blob uploads (see images.remotePatterns).
      const allowed = value.startsWith("/") || /^https:\/\/[a-z0-9-]+\.public\.blob\.vercel-storage\.com\//i.test(value);
      if (value && !allowed) throw new Error(`${field.label}: upload the photo here, or use a site path such as /guests/name.webp.`);
      return value || null;
    }
    case "link": {
      const value = String(raw ?? "").trim();
      if (value && !value.startsWith("/") && !value.startsWith("https://")) throw new Error(`${field.label} must start with / or https://`);
      return value || null;
    }
    default: {
      const value = String(raw ?? "").trim();
      if (field.required && !value) throw new Error(`${field.label} is required.`);
      if (field.kind === "select" && field.options && value && !field.options.includes(value)) throw new Error(`Choose a valid ${field.label.toLowerCase()}.`);
      return value;
    }
  }
}

export async function saveEntity(entity: string, id: number | null, _prev: ActionState, form: FormData): Promise<ActionState> {
  const me = await requireAdmin();
  if (!isEntity(entity)) return { error: "Unknown content type." };
  const def = ENTITIES[entity];
  const values: Record<string, unknown> = {};
  try {
    for (const field of def.fields) values[field.name] = await readField(field, form, "folder" in def ? def.folder : entity);
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not save." };
  }
  if ("teamMin" in values && Number(values.teamMin) > Number(values.teamMax)) return { error: "Min team size cannot be larger than max." };
  // Coupon codes are unique and stored in capitals; no code is stored as empty, not "".
  if ("coupon" in values) values.coupon = normalizeCoupon(String(values.coupon ?? "")) || null;
  if (values.coupon) {
    const [taken] = await requireDb().select({ id: s.ambassadors.id }).from(s.ambassadors).where(eq(s.ambassadors.coupon, String(values.coupon))).limit(1);
    if (taken && taken.id !== id) return { error: `The coupon code ${values.coupon} already belongs to another ambassador.` };
  }

  const table = def.table as typeof s.guests; // every content table has an id plus the fields above
  const database = requireDb();
  if (id) {
    const [before] = (await database.select().from(table).where(eq(table.id, id)).limit(1)) as Record<string, unknown>[];
    await database.update(table).set(values).where(eq(table.id, id));
    const changed = def.fields.filter((f) => stable(before?.[f.name]) !== stable(values[f.name])).map((f) => f.label);
    if (changed.length) await logActivity(me, `Edited ${def.singular}`, rowName(values), `Changed: ${changed.join(", ")}`);
  } else {
    await database.insert(table).values(values as typeof table.$inferInsert);
    await logActivity(me, `Added ${def.singular}`, rowName(values));
  }
  refreshContent();
  redirect(`/admin/content/${entity}?saved=1`);
}

export async function deleteEntity(entity: string, id: number) {
  const me = await requireAdmin();
  if (!isEntity(entity)) return;
  const table = ENTITIES[entity].table as typeof s.guests;
  const database = requireDb();
  const [row] = (await database.select().from(table).where(eq(table.id, id)).limit(1)) as Record<string, unknown>[];
  await database.delete(table).where(eq(table.id, id));
  if (row) await logActivity(me, `Deleted ${ENTITIES[entity].singular}`, rowName(row));
  refreshContent();
  redirect(`/admin/content/${entity}?deleted=1`);
}

export async function toggleEntityActive(entity: string, id: number, active: boolean) {
  const me = await requireAdmin();
  if (!isEntity(entity)) return;
  const table = ENTITIES[entity].table as typeof s.guests;
  const [row] = (await requireDb().update(table).set({ active }).where(eq(table.id, id)).returning()) as Record<string, unknown>[];
  if (row) await logActivity(me, `${active ? "Showed" : "Hid"} ${ENTITIES[entity].singular}`, rowName(row), active ? "Now visible on the website" : "Hidden from the website");
  refreshContent();
}

/* ---------------------------- settings ---------------------------- */

export async function saveSettings(_prev: ActionState, form: FormData): Promise<ActionState> {
  const me = await requireAdmin();
  const database = requireDb();
  const registration_open = Object.fromEntries(Object.keys(DEFAULT_SETTINGS.registration_open).map((k) => [k, form.get(`registration_open.${k}`) === "on"]));
  const inboxes: Record<string, string> = {};
  for (const k of Object.keys(DEFAULT_SETTINGS.inboxes)) {
    const v = String(form.get(`inboxes.${k}`) ?? "").trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return { error: `Enter a valid email for the ${k} inbox.` };
    inboxes[k] = v;
  }
  const social_links: Record<string, string> = {};
  for (const k of Object.keys(DEFAULT_SETTINGS.social_links)) {
    const v = String(form.get(`social_links.${k}`) ?? "").trim();
    if (v && !v.startsWith("https://")) return { error: `The ${k} link must start with https://` };
    social_links[k] = v;
  }
  const accounts = [];
  for (let i = 0; i < PAYMENT_SLOTS; i++) {
    const method = String(form.get(`payment.accounts.${i}.method`) ?? "").trim();
    const title = String(form.get(`payment.accounts.${i}.title`) ?? "").trim();
    const number = String(form.get(`payment.accounts.${i}.number`) ?? "").trim();
    if (!method && !title && !number) continue;
    if (!method || !number) return { error: `Payment account ${i + 1}: enter at least the method and the account number.` };
    accounts.push({ method: method.slice(0, 80), title: title.slice(0, 120), number: number.slice(0, 80) });
  }
  const payment = {
    slipRequired: form.get("payment.slipRequired") === "on",
    instructions: String(form.get("payment.instructions") ?? "").trim().slice(0, 2000),
    accounts,
  };
  const next = { registration_open, inboxes, social_links, payment };
  const current = new Map((await database.select().from(s.settings)).map((row) => [row.key, row.value]));
  const changed: string[] = [];
  for (const [key, value] of Object.entries(next)) {
    if (stable(current.get(key)) !== stable(value)) changed.push(SETTING_LABELS[key] ?? key);
    await database.insert(s.settings).values({ key, value }).onConflictDoUpdate({ target: s.settings.key, set: { value } });
  }
  if (changed.length) await logActivity(me, "Updated settings", changed.join(", "), describeRegistrationChanges(current.get("registration_open"), registration_open));
  refreshContent();
  return { ok: "Settings saved. The website updates within a few seconds." };
}

const SETTING_LABELS: Record<string, string> = {
  registration_open: "Registrations",
  inboxes: "Notification inboxes",
  social_links: "Social links",
  payment: "Competition payments",
};

/** e.g. "Opened: visitor. Closed: ambassador" so the log shows which forms were switched. */
function describeRegistrationChanges(before: unknown, after: Record<string, boolean>) {
  const prev = (before ?? DEFAULT_SETTINGS.registration_open) as Record<string, boolean>;
  const opened = Object.keys(after).filter((k) => after[k] && !prev[k]);
  const closed = Object.keys(after).filter((k) => !after[k] && prev[k]);
  return [opened.length ? `Opened: ${opened.join(", ")}` : "", closed.length ? `Closed: ${closed.join(", ")}` : ""].filter(Boolean).join(". ") || null;
}

/* ----------------------------- admins ----------------------------- */

export async function createAdmin(_prev: ActionState, form: FormData): Promise<ActionState> {
  const me = await requireAdmin();
  const name = String(form.get("name") ?? "").trim();
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  const role = form.get("role") === "gate" ? "gate" : "admin";
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Enter a name and a valid email." };
  if (password.length < 10) return { error: "Password must be at least 10 characters." };
  const database = requireDb();
  const [existing] = await database.select({ id: s.admins.id }).from(s.admins).where(eq(s.admins.email, email)).limit(1);
  if (existing) return { error: "An admin with that email already exists." };
  await database.insert(s.admins).values({ name, email, role, passwordHash: await bcrypt.hash(password, 12) });
  await logActivity(me, role === "gate" ? "Added gate staff" : "Added admin", `${name} (${email})`);
  revalidatePath("/admin/admins");
  return { ok: `Added ${email}.` };
}

export async function deleteAdmin(id: number) {
  const me = await requireAdmin();
  if (me.id === id) return;
  const database = requireDb();
  const [{ n }] = await database.select({ n: count() }).from(s.admins);
  if (n <= 1) return;
  const [removed] = await database.delete(s.admins).where(eq(s.admins.id, id)).returning();
  if (removed) await logActivity(me, "Removed admin", `${removed.name} (${removed.email})`);
  revalidatePath("/admin/admins");
}

export async function changePassword(_prev: ActionState, form: FormData): Promise<ActionState> {
  const me = await requireAdmin();
  const current = String(form.get("current") ?? "");
  const next = String(form.get("next") ?? "");
  if (next.length < 10) return { error: "New password must be at least 10 characters." };
  const database = requireDb();
  const [admin] = await database.select().from(s.admins).where(eq(s.admins.id, me.id)).limit(1);
  if (!admin || !(await bcrypt.compare(current, admin.passwordHash))) return { error: "Current password is incorrect." };
  await database.update(s.admins).set({ passwordHash: await bcrypt.hash(next, 12) }).where(eq(s.admins.id, me.id));
  await logActivity(me, "Changed own password");
  return { ok: "Password updated." };
}

/* ----------------------------- passes ----------------------------- */

/** A pass for someone without a form submission: focal persons and the event team. */
export async function createManualPass(_prev: ActionState, form: FormData): Promise<ActionState> {
  const me = await requireAdmin();
  const category = String(form.get("category")) as PassCategory;
  const name = String(form.get("name") ?? "").trim().slice(0, 120);
  const email = String(form.get("email") ?? "").trim().toLowerCase().slice(0, 200);
  const detail = String(form.get("detail") ?? "").trim().slice(0, 200) || null;
  const institution = String(form.get("institution") ?? "").trim().slice(0, 200) || null;
  if (!(MANUAL_PASS_CATEGORIES as readonly string[]).includes(category)) return { error: "Choose Focal Person or Event Team." };
  if (!name) return { error: "Name is required." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Enter a valid email address." };
  const pass = await issueManualPass({ category, name, email, detail, institution }, me.name);
  const sent = await emailPasses([pass], await passOrigin());
  await logActivity(me, "Issued pass", `${pass.code} ${name} (${PASS_CATEGORIES[category].label})`, sent ? `Emailed to ${email}` : `Not emailed (${email})`);
  revalidatePath("/admin/passes");
  return sent ? { ok: `Pass ${pass.code} emailed to ${email}.` } : { error: `Pass ${pass.code} created, but the email could not be sent. Use Resend from the list.` };
}

/** Emails a pass again (lost email, changed address is not supported: cancel and issue a new one). */
export async function resendPass(id: number) {
  const me = await requireAdmin();
  const [pass] = await requireDb().select().from(s.passes).where(eq(s.passes.id, id)).limit(1);
  if (!pass || pass.revokedAt) return;
  const sent = await emailPasses([pass], await passOrigin());
  await logActivity(me, "Resent pass", `${pass.code} ${pass.name}`, sent ? `Emailed to ${pass.email}` : "Email failed");
  revalidatePath("/admin", "layout");
}

export async function revokePass(id: number) {
  const me = await requireAdmin();
  const [pass] = await requireDb().update(s.passes).set({ revokedAt: new Date() }).where(and(eq(s.passes.id, id), isNull(s.passes.revokedAt))).returning();
  if (pass) await logActivity(me, "Cancelled pass", `${pass.code} ${pass.name}`);
  revalidatePath("/admin", "layout");
}

/** Issues and emails passes for approved submissions that don't have one yet (e.g. approved before passes existed). */
export async function sendMissingPasses() {
  const me = await requireAdmin();
  const types = Object.keys(PASS_FOR_TYPE) as (keyof typeof PASS_FOR_TYPE)[];
  const approved = await requireDb()
    .select({ id: s.submissions.id })
    .from(s.submissions)
    .where(and(eq(s.submissions.status, "approved"), inArray(s.submissions.type, types)));
  const created = await issueForSubmissions(approved.map((r) => r.id), me.name);
  if (created.length) {
    const origin = await passOrigin();
    await logActivity(me, "Issued passes", `${created.length} missing pass${created.length === 1 ? "" : "es"}`, created.map((p) => `${p.code} ${p.name}`).join(", ").slice(0, 2000));
    after(() => emailPasses(created, origin));
  }
  revalidatePath("/admin", "layout");
}

/** Gate check-in from the pass page (admins only). */
export async function checkInPass(token: string) {
  const me = await requireGateAccess();
  const pass = await passByToken(token);
  if (!pass || pass.revokedAt || pass.checkedInAt) return;
  await requireDb().update(s.passes).set({ checkedInAt: new Date() }).where(eq(s.passes.id, pass.id));
  await logActivity(me, "Checked in", `${pass.code} ${pass.name}`);
  revalidatePath(`/pass/${token}`);
}

/* ---------------------------- pre-events ---------------------------- */

const preEventValue = (raw: unknown) => ((PRE_EVENT_RESULTS as readonly string[]).includes(String(raw)) ? (String(raw) as PreEventResult) : null);

/** Marks the pre-event result of the selected registrations (Submissions table, bulk). */
export async function bulkSetPreEvent(form: FormData) {
  const me = await requireAdmin();
  const result = preEventValue(form.get("bulkPreEvent"));
  const ids = await bulkIds(form);
  if (!ids.length) return;
  await requireDb()
    .update(s.submissions)
    .set({ preEventResult: result })
    .where(and(inArray(s.submissions.id, ids), eq(s.submissions.type, "competition")));
  await logActivity(me, "Pre-event results", `${ids.length} registration${ids.length === 1 ? "" : "s"}: ${idList(ids)}`, `Marked ${PRE_EVENT_LABELS[result ?? ""]}`);
  if (result === "qualified") await syncPasses(me, ids, "approved");
  revalidatePath("/admin", "layout");
}

/** Pre-event panel on a registration: team result and which members were absent. */
export async function savePreEvent(id: number, _prev: ActionState, form: FormData): Promise<ActionState> {
  const me = await requireAdmin();
  const result = preEventValue(form.get("result"));
  const absent = [...new Set(form.getAll("absent").map((e) => String(e).trim().toLowerCase()).filter(Boolean))];
  const database = requireDb();
  const [before] = await database.select().from(s.submissions).where(eq(s.submissions.id, id)).limit(1);
  if (!before || before.type !== "competition") return { error: "Not a competition registration." };
  await database.update(s.submissions).set({ preEventResult: result, preEventAbsent: absent.length ? absent : null }).where(eq(s.submissions.id, id));
  await logActivity(me, "Pre-event result", `#${id} ${before.name} (${before.subject})`, `${PRE_EVENT_LABELS[result ?? ""]}${absent.length ? `; absent: ${absent.join(", ")}` : ""}`);
  const note = result === "qualified" && before.status === "approved" ? await syncPasses(me, [id], "approved") : "";
  revalidatePath("/admin", "layout");
  return { ok: `Saved.${note}` };
}

export type ResultsListState = { error?: string; ok?: string; matches?: CsvMatch[]; problems?: CsvProblem[]; saved?: boolean } | undefined;

/** Results list from a campus (CSV or pasted WhatsApp lines): preview first, then save. */
export async function importPreEventResults(_prev: ResultsListState, form: FormData): Promise<ResultsListState> {
  const me = await requireAdmin();
  const file = form.get("file");
  const pasted = String(form.get("text") ?? "");
  const text = file instanceof File && file.size > 0 ? (file.size > 2_000_000 ? "" : await file.text()) : pasted;
  if (!text.trim()) return { error: "Upload a CSV file or paste the results first." };
  const { matches, problems } = await matchResults(text.slice(0, 500_000));
  if (form.get("mode") !== "save") return { matches, problems };
  const changed = await saveResults(matches);
  await logActivity(me, "Pre-event results imported", `${matches.length} line${matches.length === 1 ? "" : "s"}, ${changed.length} registration${changed.length === 1 ? "" : "s"}`, problems.length ? `${problems.length} line(s) not matched` : null);
  const approvedQualified = await requireDb()
    .select({ id: s.submissions.id })
    .from(s.submissions)
    .where(and(inArray(s.submissions.id, changed.length ? changed : [-1]), eq(s.submissions.status, "approved"), eq(s.submissions.preEventResult, "qualified")));
  const note = approvedQualified.length ? await syncPasses(me, approvedQualified.map((r) => r.id), "approved") : "";
  revalidatePath("/admin", "layout");
  return { ok: `Saved results for ${changed.length} registration${changed.length === 1 ? "" : "s"}.${note}`, problems, saved: true };
}

/** Moves everyone marked Not qualified or Absent to visitors and emails them (with an apology where needed). */
export async function sendPreEventResults() {
  const me = await requireAdmin();
  const r = await applyPreEventResults(me.name);
  if (r.moved) {
    await logActivity(
      me,
      "Sent pre-event results",
      `${r.moved} people moved to visitors`,
      `${r.cancelled} Competitor passes cancelled; ${r.emailed} emails sent (${r.apologies} with apology)`,
    );
  }
  revalidatePath("/admin", "layout");
}

/* --------------------------- team members --------------------------- */

type Member = { name: string; email: string; phone?: string; institution?: string; gender?: string };

/** Team size limits of the competition a registration is for. */
async function teamLimits(subject: string | null) {
  const [c] = await requireDb()
    .select({ teamMin: s.competitions.teamMin, teamMax: s.competitions.teamMax })
    .from(s.competitions)
    .where(eq(s.competitions.name, subject ?? ""))
    .limit(1);
  return c ?? null;
}

/**
 * Adds a member to a registered team (the fee is per team, so nothing else changes). Same checks as the
 * registration form; stays within the competition's team limit. An approved team's new member gets their pass.
 */
export async function addTeamMember(id: number, _prev: ActionState, form: FormData): Promise<ActionState> {
  const me = await requireAdmin();
  const database = requireDb();
  const [sub] = await database.select().from(s.submissions).where(eq(s.submissions.id, id)).limit(1);
  if (!sub || sub.type !== "competition") return { error: "Not a competition registration." };
  const parsed = memberSchema.safeParse(Object.fromEntries(["name", "email", "phone", "institution", "gender"].map((k) => [k, String(form.get(k) ?? "")])));
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { error: `${issue.path.join(".") || "Member"}: ${issue.message}` };
  }
  const members = Array.isArray(sub.data.members) ? (sub.data.members as Member[]) : [];
  const limits = await teamLimits(sub.subject);
  if (limits && members.length >= limits.teamMax) return { error: `${sub.subject} allows at most ${limits.teamMax} members; this team is full.` };
  if (members.some((m) => m.email?.toLowerCase() === parsed.data.email)) return { error: "That email is already on this team." };
  const next = [...members, parsed.data];
  await database.update(s.submissions).set({ data: { ...sub.data, members: next, size: next.length } }).where(eq(s.submissions.id, id));
  await logActivity(me, "Added team member", `#${id} ${sub.subject}, team ${String(sub.data.team || sub.name)}`, `${parsed.data.name} (${parsed.data.email})`);
  const note = sub.status === "approved" ? await syncPasses(me, [id], "approved") : "";
  revalidatePath("/admin", "layout");
  return { ok: `Added ${parsed.data.name}.${note || (sub.status === "approved" ? "" : " Their pass is sent when the team is approved.")}` };
}

/**
 * Edits a member's details (same checks as the registration form). Editing the lead also updates the
 * registration's contact details. The member's pass keeps its link and takes the new details; if the email
 * changed, the pass is emailed to the new address.
 */
export async function editTeamMember(id: number, index: number, originalEmail: string, _prev: ActionState, form: FormData): Promise<ActionState> {
  const me = await requireAdmin();
  const database = requireDb();
  const [sub] = await database.select().from(s.submissions).where(eq(s.submissions.id, id)).limit(1);
  if (!sub || sub.type !== "competition") return { error: "Not a competition registration." };
  const members = Array.isArray(sub.data.members) ? (sub.data.members as Member[]) : [];
  const old = members[index];
  if (!old || (old.email ?? "").toLowerCase() !== originalEmail.toLowerCase()) return { error: "The team changed meanwhile. Reload the page and try again." };
  const parsed = memberSchema.safeParse(Object.fromEntries(["name", "email", "phone", "institution", "gender"].map((k) => [k, String(form.get(k) ?? "")])));
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { error: `${issue.path.join(".") || "Member"}: ${issue.message}` };
  }
  const next = parsed.data;
  if (members.some((m, i) => i !== index && m.email?.toLowerCase() === next.email.toLowerCase())) return { error: "That email is already on this team." };
  const changed = (["name", "email", "phone", "institution", "gender"] as const).filter((k) => String(old[k] ?? "") !== String(next[k] ?? ""));
  if (!changed.length) return { error: "Nothing changed." };

  const list = members.map((m, i) => (i === index ? { ...m, ...next } : m));
  const update: Partial<typeof s.submissions.$inferInsert> = { data: { ...sub.data, members: list } };
  // The lead's details are also the registration's contact details.
  if (index === 0) Object.assign(update, { name: next.name, email: next.email, phone: next.phone, institution: next.institution, gender: next.gender });
  const oldEmail = (old.email ?? "").toLowerCase();
  if (oldEmail !== next.email.toLowerCase() && sub.preEventAbsent?.includes(oldEmail)) {
    update.preEventAbsent = sub.preEventAbsent.map((e) => (e === oldEmail ? next.email.toLowerCase() : e));
  }
  await database.update(s.submissions).set(update).where(eq(s.submissions.id, id));

  // The member's valid pass keeps its QR link and takes the new details.
  const [pass] = await database
    .update(s.passes)
    .set({ name: next.name, email: next.email, institution: next.institution })
    .where(and(eq(s.passes.submissionId, id), eq(s.passes.category, "competition"), eq(s.passes.email, old.email), eq(s.passes.name, old.name), isNull(s.passes.revokedAt)))
    .returning();
  let note = "";
  if (pass && oldEmail !== next.email.toLowerCase()) {
    const sent = await emailPasses([pass], await passOrigin());
    note = sent ? ` Pass ${pass.code} emailed to ${next.email}.` : ` Pass ${pass.code} updated, but the email to ${next.email} failed; use Resend.`;
  } else if (pass) {
    note = ` Pass ${pass.code} updated.`;
  }
  await logActivity(
    me,
    "Edited team member",
    `#${id} ${sub.subject}, team ${String(sub.data.team || sub.name)}`,
    changed.map((k) => `${k}: ${String(old[k] ?? "") || "(empty)"} → ${String(next[k] ?? "")}`).join("; "),
  );
  revalidatePath("/admin", "layout");
  return { ok: `Saved ${next.name}.${note}` };
}

/**
 * Makes a member the team lead: they move to the top of the team and their details become the registration's
 * contact details; the old lead stays on as a member. Passes and their links are unchanged and nothing is emailed.
 */
export async function makeTeamLead(id: number, index: number, email: string) {
  const me = await requireAdmin();
  const database = requireDb();
  const [sub] = await database.select().from(s.submissions).where(eq(s.submissions.id, id)).limit(1);
  if (!sub || sub.type !== "competition" || index < 1) return;
  const members = Array.isArray(sub.data.members) ? (sub.data.members as Member[]) : [];
  const lead = members[index];
  if (!lead || (lead.email ?? "").toLowerCase() !== email.toLowerCase()) return; // list changed meanwhile
  const list = [lead, ...members.filter((_, i) => i !== index)];
  await database
    .update(s.submissions)
    .set({
      data: { ...sub.data, members: list },
      name: lead.name,
      email: lead.email,
      phone: lead.phone ?? sub.phone,
      institution: lead.institution ?? sub.institution,
      gender: lead.gender ?? sub.gender,
    })
    .where(eq(s.submissions.id, id));
  await logActivity(me, "Changed team lead", `#${id} ${sub.subject}, team ${String(sub.data.team || sub.name)}`, `${members[0]?.name ?? sub.name} → ${lead.name} (${lead.email})`);
  revalidatePath("/admin", "layout");
}

/** Removes a member (not the team lead) and cancels their pass. */
export async function removeTeamMember(id: number, index: number, email: string) {
  const me = await requireAdmin();
  const database = requireDb();
  const [sub] = await database.select().from(s.submissions).where(eq(s.submissions.id, id)).limit(1);
  if (!sub || sub.type !== "competition" || index < 1) return;
  const members = Array.isArray(sub.data.members) ? (sub.data.members as Member[]) : [];
  const gone = members[index];
  if (!gone || gone.email?.toLowerCase() !== email.toLowerCase()) return; // list changed meanwhile
  const limits = await teamLimits(sub.subject);
  if (limits && members.length - 1 < limits.teamMin) return;
  const next = members.filter((_, i) => i !== index);
  const absent = (sub.preEventAbsent ?? []).filter((e) => e !== email.toLowerCase());
  await database
    .update(s.submissions)
    .set({ data: { ...sub.data, members: next, size: next.length }, preEventAbsent: absent.length ? absent : null })
    .where(eq(s.submissions.id, id));
  const cancelled = await database
    .update(s.passes)
    .set({ revokedAt: new Date() })
    .where(and(eq(s.passes.submissionId, id), eq(s.passes.email, gone.email), eq(s.passes.name, gone.name), isNull(s.passes.revokedAt)))
    .returning({ code: s.passes.code });
  await logActivity(
    me,
    "Removed team member",
    `#${id} ${sub.subject}, team ${String(sub.data.team || sub.name)}`,
    `${gone.name} (${gone.email})${cancelled.length ? `; cancelled ${cancelled.map((c) => c.code).join(", ")}` : ""}`,
  );
  revalidatePath("/admin", "layout");
}

/* ------------------------ change competition ------------------------ */

/** Relabels a team's valid Competitor passes after its details change; the QR links stay the same. Returns them. */
async function relabelPasses(sub: typeof s.submissions.$inferSelect) {
  const database = requireDb();
  const details = new Map(holdersFor(sub).map((h) => [`${h.email.toLowerCase()}|${h.name.toLowerCase()}`, h.detail]));
  const passes = await database
    .select({ id: s.passes.id, name: s.passes.name, email: s.passes.email })
    .from(s.passes)
    .where(and(eq(s.passes.submissionId, sub.id), eq(s.passes.category, "competition"), isNull(s.passes.revokedAt)));
  for (const p of passes) {
    const detail = details.get(`${p.email.toLowerCase()}|${p.name.toLowerCase()}`);
    if (detail !== undefined) await database.update(s.passes).set({ detail }).where(eq(s.passes.id, p.id));
  }
  return passes;
}

/** Renames a competition team. Its passes keep their links and are relabelled with the new name; nothing is emailed. */
export async function renameTeam(id: number, _prev: ActionState, form: FormData): Promise<ActionState> {
  const me = await requireAdmin();
  const database = requireDb();
  const [sub] = await database.select().from(s.submissions).where(eq(s.submissions.id, id)).limit(1);
  if (!sub || sub.type !== "competition") return { error: "Not a competition registration." };
  const name = String(form.get("team") ?? "").replace(/\s+/g, " ").trim();
  const before = typeof sub.data.team === "string" ? sub.data.team : "";
  const members = Array.isArray(sub.data.members) ? sub.data.members.length : 0;
  if (!name && members > 1) return { error: "A team of more than one needs a team name." };
  if (name.length > 120) return { error: "Keep the team name under 120 characters." };
  if (name === before) return { error: "That is already the team name." };

  const data: Record<string, unknown> = { ...sub.data, team: name };
  if (!name) delete data.team;
  await database.update(s.submissions).set({ data }).where(eq(s.submissions.id, id));
  const passes = await relabelPasses({ ...sub, data });
  await logActivity(me, "Renamed team", `#${id} ${sub.subject}`, `${before || "(no name)"} → ${name || "(no name)"}`);
  revalidatePath("/admin", "layout");
  return { ok: `Team renamed to ${name || "(no name)"}.${passes.length ? ` ${passes.length} pass${passes.length === 1 ? "" : "es"} updated.` : ""}` };
}

/**
 * Moves a registration to another competition (e.g. a team that applied to the wrong one). The team must fit
 * the new competition's size limits, and a competition with a required choice (Speech language, Arts category)
 * needs it picked. The fee becomes the new competition's, keeping any coupon discount. The pre-event result is
 * cleared, as it belonged to the old competition. Approved teams keep their passes (same links, nothing
 * emailed), relabelled with the new competition; members without a pass yet get one.
 */
export async function changeCompetition(id: number, _prev: ActionState, form: FormData): Promise<ActionState> {
  const me = await requireAdmin();
  const database = requireDb();
  const [sub] = await database.select().from(s.submissions).where(eq(s.submissions.id, id)).limit(1);
  if (!sub || sub.type !== "competition") return { error: "Not a competition registration." };
  const target = String(form.get("competition") ?? "");
  if (!target || target === sub.subject) return { error: "Choose a different competition." };
  const [comp] = await database.select().from(s.competitions).where(eq(s.competitions.name, target)).limit(1);
  if (!comp) return { error: "That competition no longer exists." };

  const members = Array.isArray(sub.data.members) ? (sub.data.members as Member[]) : [];
  const size = members.length || Number(sub.data.size) || 1;
  if (size < comp.teamMin || size > comp.teamMax) {
    const allowed = comp.teamMin === comp.teamMax ? `${comp.teamMin}` : `${comp.teamMin} to ${comp.teamMax}`;
    return { error: `${comp.name} allows ${allowed} member${comp.teamMax === 1 ? "" : "s"}; this team has ${size}. Add or remove members first.` };
  }
  const data: Record<string, unknown> = { ...sub.data };
  const choice = choiceFor(comp.name);
  for (const field of CHOICE_FIELDS) if (field !== choice?.field) delete data[field];
  if (choice) {
    const picked = String(form.get("choice") ?? "");
    if (!choice.options.includes(picked)) return { error: `${comp.name}: ${choice.prompt}.` };
    data[choice.field] = picked;
  }

  // The new fee, with the coupon (if any) applied again.
  const before = String(sub.data.fee ?? "");
  if (data.coupon) {
    const after = discountedFee(comp.fee);
    data.feeBeforeCoupon = comp.fee;
    data.fee = after ?? comp.fee;
  } else {
    data.fee = comp.fee;
  }
  data.competition = comp.name;

  const moved = { ...sub, subject: comp.name, data };
  await database
    .update(s.submissions)
    .set({ subject: comp.name, data, preEventResult: null, preEventAbsent: null })
    .where(eq(s.submissions.id, id));

  const passes = await relabelPasses(moved);

  const feeNote = before === String(data.fee) ? `fee unchanged (${String(data.fee)})` : `fee ${before || "not set"} → ${String(data.fee)}`;
  await logActivity(me, "Changed competition", `#${id} team ${String(sub.data.team || sub.name)}`, `${sub.subject} → ${comp.name}; ${feeNote}`);
  const note = sub.status === "approved" ? await syncPasses(me, [id], "approved") : "";
  revalidatePath("/admin", "layout");
  return {
    ok: `Moved to ${comp.name}; ${feeNote}.${passes.length ? ` ${passes.length} pass${passes.length === 1 ? "" : "es"} updated.` : ""}${note}`,
  };
}

/* --------------------------- judge emails --------------------------- */

const emailAddress = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Emails a judge an invitation for a competition. The subject and message come from the template on the page
 * (editable); placeholders are filled here with the judge's name and the competition's focal person(s).
 */
export async function sendJudgeEmail(_prev: ActionState, form: FormData): Promise<ActionState> {
  const me = await requireAdmin();
  const name = String(form.get("competition") ?? "");
  const judge = String(form.get("judge") ?? "").replace(/\s+/g, " ").trim();
  const to = String(form.get("email") ?? "").trim().toLowerCase();
  const subjectTpl = String(form.get("subject") ?? "").trim();
  const messageTpl = String(form.get("message") ?? "").trim();
  if (!judge) return { error: "Enter the judge's name." };
  if (!emailAddress.test(to)) return { error: "Enter a valid email address for the judge." };
  const cc = splitEmails(String(form.get("cc") ?? "")).filter((e) => e !== to);
  const badCc = cc.find((e) => !emailAddress.test(e));
  if (badCc) return { error: `CC: "${badCc}" is not a valid email address.` };
  if (cc.length > 10) return { error: "CC up to 10 addresses." };
  if (!subjectTpl || subjectTpl.length > 200) return { error: "The subject must be 1 to 200 characters." };
  if (!messageTpl || messageTpl.length > 6000) return { error: "The message must be 1 to 6,000 characters." };
  const [comp] = await requireDb().select().from(s.competitions).where(eq(s.competitions.name, name)).limit(1);
  if (!comp) return { error: "Choose a competition." };

  const focals = focalsOf(comp);
  const vars = { judge, competition: comp.name, focals };
  const subject = fillJudgeTemplate(subjectTpl, vars);
  const settings = await getSettings();
  const html = judgeEmail(
    { origin: await passOrigin(), social: settings.social_links },
    { subject, message: fillJudgeTemplate(messageTpl, vars, true), competition: comp.name, rulebook: comp.rulebook, focals },
  );
  const sent = await sendEmail({ to, cc, subject, html, replyTo: settings.inboxes.competitions });
  await logActivity(me, sent ? "Emailed judge" : "Judge email failed", comp.name, `${judge} <${to}>: ${subject}${cc.length ? ` (cc ${cc.join(", ")})` : ""}`);
  revalidatePath("/admin/judges");
  return sent ? { ok: `Sent to ${judge} (${to})${cc.length ? `, cc ${cc.join(", ")}` : ""}.` } : { error: `The email to ${to} could not be sent. Check the address and try again.` };
}
