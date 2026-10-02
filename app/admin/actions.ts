"use server";

import { put } from "@vercel/blob";
import bcrypt from "bcryptjs";
import { count, eq, inArray } from "drizzle-orm";
import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { endSession, requireAdmin, startSession } from "@/lib/auth";
import { CONTENT_TAG } from "@/lib/content";
import { db, requireDb, schema as s } from "@/lib/db";
import { SUBMISSION_STATUSES, type SubmissionStatus } from "@/lib/db/schema";
import { DEFAULT_SETTINGS } from "@/lib/defaults";
import { ENTITIES, isEntity, type FieldDef } from "@/lib/admin/entities";

export type ActionState = { error?: string; ok?: string } | undefined;

// Compared against when the email is unknown, so failed logins take the same time either way.
const DUMMY_HASH = "$2b$12$EWGzmlVP52KFwBHFVeUbM.EagAw/tc2O.K1WXn1L8JHtvt7tBSkie";

/** Expire cached content and every prerendered public page. */
function refreshContent() {
  updateTag(CONTENT_TAG);
  revalidatePath("/", "layout");
}

/* ----------------------------- auth ----------------------------- */

export async function login(_prev: ActionState, form: FormData): Promise<ActionState> {
  if (!db) return { error: "The database is not configured (DATABASE_URL)." };
  if (!process.env.AUTH_SECRET || process.env.AUTH_SECRET.length < 32) return { error: "AUTH_SECRET is not configured." };
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  const [admin] = await db.select().from(s.admins).where(eq(s.admins.email, email)).limit(1);
  const ok = await bcrypt.compare(password, admin?.passwordHash ?? DUMMY_HASH);
  if (!admin || !ok) return { error: "Incorrect email or password." };
  await db.update(s.admins).set({ lastLoginAt: new Date() }).where(eq(s.admins.id, admin.id));
  await startSession(admin);
  const next = String(form.get("next") ?? "");
  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function logout() {
  await endSession();
  redirect("/admin/login");
}

/* -------------------------- submissions -------------------------- */

export async function updateSubmission(id: number, _prev: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const status = String(form.get("status")) as SubmissionStatus;
  if (!SUBMISSION_STATUSES.includes(status)) return { error: "Invalid status." };
  const notes = String(form.get("notes") ?? "").slice(0, 10_000);
  await requireDb().update(s.submissions).set({ status, notes: notes || null }).where(eq(s.submissions.id, id));
  revalidatePath("/admin", "layout");
  return { ok: "Saved." };
}

export async function bulkSetStatus(form: FormData) {
  await requireAdmin();
  const status = String(form.get("bulkStatus")) as SubmissionStatus;
  const ids = form.getAll("ids").map(Number).filter(Number.isInteger);
  if (!SUBMISSION_STATUSES.includes(status) || ids.length === 0) return;
  await requireDb().update(s.submissions).set({ status }).where(inArray(s.submissions.id, ids));
  revalidatePath("/admin", "layout");
}

export async function deleteSubmission(id: number) {
  await requireAdmin();
  await requireDb().delete(s.submissions).where(eq(s.submissions.id, id));
  revalidatePath("/admin", "layout");
  redirect("/admin/submissions");
}

/* ---------------------------- content ---------------------------- */

async function uploadImage(file: File, folder: string): Promise<string> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("Photo uploads are not set up yet (add a Vercel Blob store to the project). You can use a site image path meanwhile.");
  }
  if (!file.type.startsWith("image/")) throw new Error("Please upload an image file.");
  if (file.size > 3 * 1024 * 1024) throw new Error("Images must be 3 MB or smaller.");
  const safe = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-");
  const blob = await put(`cye/${folder}/${Date.now()}-${safe}`, file, { access: "public" });
  return blob.url;
}

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
    default: {
      const value = String(raw ?? "").trim();
      if (field.required && !value) throw new Error(`${field.label} is required.`);
      if (field.kind === "select" && field.options && value && !field.options.includes(value)) throw new Error(`Choose a valid ${field.label.toLowerCase()}.`);
      return value;
    }
  }
}

export async function saveEntity(entity: string, id: number | null, _prev: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
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
  if (id) await database.update(table).set(values).where(eq(table.id, id));
  else await database.insert(table).values(values as typeof table.$inferInsert);
  refreshContent();
  redirect(`/admin/content/${entity}?saved=1`);
}

export async function deleteEntity(entity: string, id: number) {
  await requireAdmin();
  if (!isEntity(entity)) return;
  const table = ENTITIES[entity].table as typeof s.guests;
  await requireDb().delete(table).where(eq(table.id, id));
  refreshContent();
  redirect(`/admin/content/${entity}?deleted=1`);
}

export async function toggleEntityActive(entity: string, id: number, active: boolean) {
  await requireAdmin();
  if (!isEntity(entity)) return;
  const table = ENTITIES[entity].table as typeof s.guests;
  await requireDb().update(table).set({ active }).where(eq(table.id, id));
  refreshContent();
}

/* ---------------------------- settings ---------------------------- */

export async function saveSettings(_prev: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
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
  for (const [key, value] of Object.entries({ registration_open, inboxes, social_links })) {
    await database.insert(s.settings).values({ key, value }).onConflictDoUpdate({ target: s.settings.key, set: { value } });
  }
  refreshContent();
  return { ok: "Settings saved. The website updates within a few seconds." };
}

/* ----------------------------- admins ----------------------------- */

export async function createAdmin(_prev: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const name = String(form.get("name") ?? "").trim();
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Enter a name and a valid email." };
  if (password.length < 10) return { error: "Password must be at least 10 characters." };
  const database = requireDb();
  const [existing] = await database.select({ id: s.admins.id }).from(s.admins).where(eq(s.admins.email, email)).limit(1);
  if (existing) return { error: "An admin with that email already exists." };
  await database.insert(s.admins).values({ name, email, passwordHash: await bcrypt.hash(password, 12) });
  revalidatePath("/admin/admins");
  return { ok: `Added ${email}.` };
}

export async function deleteAdmin(id: number) {
  const me = await requireAdmin();
  if (me.id === id) return;
  const database = requireDb();
  const [{ n }] = await database.select({ n: count() }).from(s.admins);
  if (n <= 1) return;
  await database.delete(s.admins).where(eq(s.admins.id, id));
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
  return { ok: "Password updated." };
}
