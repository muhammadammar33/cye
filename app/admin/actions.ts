"use server";

import bcrypt from "bcryptjs";
import { count, eq, inArray } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { endSession, requireAdmin, startSession } from "@/lib/auth";
import { uploadImage } from "@/lib/blob";
import { CONTENT_TAG } from "@/lib/content";
import { db, requireDb, schema as s } from "@/lib/db";
import { SUBMISSION_STATUSES, type SubmissionStatus } from "@/lib/db/schema";
import { DEFAULT_SETTINGS } from "@/lib/defaults";
import { ENTITIES, isEntity, type FieldDef } from "@/lib/admin/entities";
import { STATUS_LABELS, TYPE_NAMES } from "@/lib/admin/labels";
import { GENDERS } from "@/data/event";
import { logActivity } from "@/lib/admin/log";

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
  const database = requireDb();
  const [before] = await database.select().from(s.submissions).where(eq(s.submissions.id, id)).limit(1);
  if (!before) return { error: "This submission no longer exists." };
  await database.update(s.submissions).set({ status, notes: notes || null, gender }).where(eq(s.submissions.id, id));
  const changes = [
    (before.gender ?? null) !== gender ? `Gender: ${before.gender ?? "not set"} to ${gender ?? "not set"}` : "",
    before.status !== status ? `Status: ${STATUS_LABELS[before.status]} to ${STATUS_LABELS[status]}` : "",
    (before.notes ?? "") !== notes ? "Notes updated" : "",
  ].filter(Boolean);
  if (changes.length) await logActivity(me, "Updated submission", `#${id} ${before.name} (${TYPE_NAMES[before.type]})`, changes.join("; "));
  revalidatePath("/admin", "layout");
  return { ok: "Saved." };
}

/** Inline gender picker in the submissions table. */
export async function setSubmissionGender(id: number, value: string): Promise<ActionState> {
  const me = await requireAdmin();
  const gender = (GENDERS as readonly string[]).includes(value) ? value : null;
  const database = requireDb();
  const [before] = await database.select().from(s.submissions).where(eq(s.submissions.id, id)).limit(1);
  if (!before) return { error: "This submission no longer exists." };
  if ((before.gender ?? null) === gender) return { ok: "Saved." };
  await database.update(s.submissions).set({ gender }).where(eq(s.submissions.id, id));
  await logActivity(me, "Updated submission", `#${id} ${before.name} (${TYPE_NAMES[before.type]})`, `Gender: ${before.gender ?? "not set"} to ${gender ?? "not set"}`);
  revalidatePath("/admin", "layout");
  return { ok: "Saved." };
}

export async function bulkSetStatus(form: FormData) {
  const me = await requireAdmin();
  const status = String(form.get("bulkStatus")) as SubmissionStatus;
  const ids = form.getAll("ids").map(Number).filter(Number.isInteger);
  if (!SUBMISSION_STATUSES.includes(status) || ids.length === 0) return;
  await requireDb().update(s.submissions).set({ status }).where(inArray(s.submissions.id, ids));
  await logActivity(
    me,
    "Bulk status change",
    `${ids.length} submission${ids.length === 1 ? "" : "s"}: ${ids.map((n) => `#${n}`).join(", ")}`,
    `Marked as ${STATUS_LABELS[status]}`,
  );
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
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Enter a name and a valid email." };
  if (password.length < 10) return { error: "Password must be at least 10 characters." };
  const database = requireDb();
  const [existing] = await database.select({ id: s.admins.id }).from(s.admins).where(eq(s.admins.email, email)).limit(1);
  if (existing) return { error: "An admin with that email already exists." };
  await database.insert(s.admins).values({ name, email, passwordHash: await bcrypt.hash(password, 12) });
  await logActivity(me, "Added admin", `${name} (${email})`);
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
