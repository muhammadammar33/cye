import "server-only";
import { randomBytes } from "node:crypto";
import { and, eq, inArray, isNull } from "drizzle-orm";
import { headers } from "next/headers";
import { getSettings } from "@/lib/content";
import { requireDb, schema as s } from "@/lib/db";
import { passEmail, sendEmailBatch } from "@/lib/email";
import { PASS_CATEGORIES, PASS_FOR_TYPE, passCode, type PassCategory } from "@/lib/passCategories";

export type Pass = typeof s.passes.$inferSelect;
type Submission = typeof s.submissions.$inferSelect;
type Holder = { name: string; email: string; detail: string | null; institution: string | null };

const str = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : null);

/** Site address for pass links: SITE_URL when set, otherwise the address this request came in on. */
export async function passOrigin() {
  if (process.env.SITE_URL) return process.env.SITE_URL.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "www.capitalyouthexpo.com";
  // Any address of the live site (with or without www) gives links on the main www address.
  if (/(^|\.)capitalyouthexpo\.com$/.test(host.split(":")[0])) return "https://www.capitalyouthexpo.com";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

/** Who gets a pass for an approved submission. Every competition team member gets their own. */
export function holdersFor(sub: Submission): Holder[] {
  const d = (sub.data ?? {}) as Record<string, unknown>;
  const one = (detail: string | null): Holder[] => [{ name: sub.name, email: sub.email, detail, institution: sub.institution }];
  switch (sub.type) {
    case "competition": {
      const members = Array.isArray(d.members) ? (d.members as Record<string, unknown>[]) : [];
      const detail = [sub.subject, str(d.language), str(d.artCategory), str(d.team) ? `Team ${str(d.team)}` : null].filter(Boolean).join(" · ") || null;
      const seen = new Set<string>();
      return members
        .map((m) => ({ name: str(m.name) ?? "", email: str(m.email) ?? "", detail, institution: str(m.institution) }))
        .filter((m) => m.name && m.email && !seen.has(`${m.email.toLowerCase()}|${m.name.toLowerCase()}`) && seen.add(`${m.email.toLowerCase()}|${m.name.toLowerCase()}`));
    }
    case "project":
      return one(sub.subject ? `Project: ${sub.subject}` : null);
    case "startup":
      return one(sub.subject);
    case "talent":
      return one(str(d.level));
    case "volunteer":
      return one(sub.subject ? `Volunteer: ${sub.subject}` : null);
    case "ambassador":
    case "visitor":
      return one(null);
    default:
      return [];
  }
}

/** 128-bit random token in lowercase hex (public URLs are lowercased by proxy.ts, so no mixed case). */
const newToken = () => randomBytes(16).toString("hex");

/** Inserts passes and gives each its readable code. */
async function createPasses(rows: { category: PassCategory; submissionId: number | null; name: string; email: string; detail: string | null; institution: string | null; issuedBy: string }[]) {
  if (!rows.length) return [];
  const db = requireDb();
  const inserted = await db
    .insert(s.passes)
    .values(rows.map((r) => ({ ...r, token: newToken() })))
    .returning();
  return Promise.all(
    inserted.map(async (p) => {
      const code = passCode(p.category as PassCategory, p.id);
      await db.update(s.passes).set({ code }).where(eq(s.passes.id, p.id));
      return { ...p, code };
    }),
  );
}

/** Creates the missing passes for approved submissions. Holders who already have a valid pass are skipped. */
export async function issueForSubmissions(ids: number[], issuedBy: string) {
  if (!ids.length) return [];
  const db = requireDb();
  const subs = await db.select().from(s.submissions).where(and(inArray(s.submissions.id, ids), eq(s.submissions.status, "approved")));
  const eligible = subs.filter((sub) => PASS_FOR_TYPE[sub.type]);
  if (!eligible.length) return [];
  const existing = await db
    .select({ submissionId: s.passes.submissionId, name: s.passes.name, email: s.passes.email })
    .from(s.passes)
    .where(and(inArray(s.passes.submissionId, eligible.map((x) => x.id)), isNull(s.passes.revokedAt)));
  const have = new Set(existing.map((e) => `${e.submissionId}|${e.email.toLowerCase()}|${e.name.toLowerCase()}`));
  const rows = eligible.flatMap((sub) =>
    holdersFor(sub)
      .filter((h) => !have.has(`${sub.id}|${h.email.toLowerCase()}|${h.name.toLowerCase()}`))
      .map((h) => ({ ...h, category: PASS_FOR_TYPE[sub.type]!, submissionId: sub.id, issuedBy })),
  );
  return createPasses(rows);
}

/** Cancels every valid pass of these submissions (e.g. when an approval is withdrawn). Returns how many. */
export async function revokeForSubmissions(ids: number[]) {
  if (!ids.length) return 0;
  const rows = await requireDb()
    .update(s.passes)
    .set({ revokedAt: new Date() })
    .where(and(inArray(s.passes.submissionId, ids), isNull(s.passes.revokedAt)))
    .returning({ id: s.passes.id });
  return rows.length;
}

/** A pass issued by hand (focal persons, event team). */
export async function issueManualPass(input: { category: PassCategory; name: string; email: string; detail: string | null; institution: string | null }, issuedBy: string) {
  const [pass] = await createPasses([{ ...input, submissionId: null, issuedBy }]);
  return pass;
}

/** Emails each pass to its holder and records which were sent. Sends in batches to stay within Resend's limits. */
export async function emailPasses(list: Pass[], origin: string) {
  if (!list.length) return 0;
  const settings = await getSettings();
  const ctx = { origin, social: settings.social_links };
  let sent = 0;
  for (let i = 0; i < list.length; i += 100) {
    const chunk = list.slice(i, i + 100);
    const ok = await sendEmailBatch(
      chunk.map((p) => ({
        to: p.email,
        subject: `Your ${PASS_CATEGORIES[p.category as PassCategory]?.label ?? "event"} pass | Capital Youth Expo 2026`,
        html: passEmail(ctx, p),
        replyTo: settings.inboxes.info,
      })),
    );
    if (ok) {
      await requireDb().update(s.passes).set({ emailedAt: new Date() }).where(inArray(s.passes.id, chunk.map((p) => p.id)));
      sent += chunk.length;
    }
    if (i + 100 < list.length) await new Promise((r) => setTimeout(r, 1000));
  }
  return sent;
}

export async function passByToken(token: string) {
  if (!/^[0-9a-f]{32}$/.test(token)) return null;
  const [pass] = await requireDb().select().from(s.passes).where(eq(s.passes.token, token)).limit(1);
  return pass ?? null;
}
