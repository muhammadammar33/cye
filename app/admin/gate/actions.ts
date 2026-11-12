"use server";

import { and, count, desc, eq, ilike, isNotNull, isNull, or, sql } from "drizzle-orm";
import { logActivity } from "@/lib/admin/log";
import { requireGateAccess } from "@/lib/auth";
import { requireDb, schema as s } from "@/lib/db";

export type GatePass = { id: number; code: string | null; name: string; category: string; detail: string | null; institution: string | null; checkedInAt: string | null; cancelled: boolean };
export type GateResult = { result: "checked_in" | "already" | "cancelled" | "not_found"; pass?: GatePass };
export type GateStats = { total: number; checkedIn: number; byCategory: { category: string; total: number; checkedIn: number }[] };

type Row = typeof s.passes.$inferSelect;
const view = (p: Row): GatePass => ({
  id: p.id,
  code: p.code,
  name: p.name,
  category: p.category,
  detail: p.detail,
  institution: p.institution,
  checkedInAt: p.checkedInAt?.toISOString() ?? null,
  cancelled: Boolean(p.revokedAt),
});

/** Checks a pass in by its QR token or id. One atomic update, so two scanners can't admit the same pass twice. */
export async function gateCheckIn(input: { token?: string; id?: number }): Promise<GateResult> {
  const me = await requireGateAccess();
  const db = requireDb();
  const match = input.token ? (/^[0-9a-f]{32}$/.test(input.token) ? eq(s.passes.token, input.token) : null) : Number.isInteger(input.id) ? eq(s.passes.id, input.id!) : null;
  if (!match) return { result: "not_found" };
  const [done] = await db
    .update(s.passes)
    .set({ checkedInAt: new Date() })
    .where(and(match, isNull(s.passes.revokedAt), isNull(s.passes.checkedInAt)))
    .returning();
  if (done) {
    await logActivity(me, "Checked in", `${done.code} ${done.name}`);
    return { result: "checked_in", pass: view(done) };
  }
  const [pass] = await db.select().from(s.passes).where(match).limit(1);
  if (!pass) return { result: "not_found" };
  return { result: pass.revokedAt ? "cancelled" : "already", pass: view(pass) };
}

/** Undo a check-in made by mistake. */
export async function gateUndo(id: number): Promise<GateStats> {
  const me = await requireGateAccess();
  const [pass] = await requireDb().update(s.passes).set({ checkedInAt: null }).where(and(eq(s.passes.id, id), isNotNull(s.passes.checkedInAt))).returning();
  if (pass) await logActivity(me, "Undid check-in", `${pass.code} ${pass.name}`);
  return gateStats();
}

/** Find passes by pass number, name, email or phone, for people without their QR code. */
export async function gateSearch(query: string): Promise<GatePass[]> {
  await requireGateAccess();
  const q = query.trim().slice(0, 100);
  if (q.length < 2) return [];
  const like = `%${q.replace(/[%_\\]/g, "\\$&")}%`;
  const digits = q.replace(/\D/g, "");
  const conditions = [ilike(s.passes.code, like), ilike(s.passes.name, like), ilike(s.passes.email, like)];
  if (digits.length >= 4) {
    // The phone on the submission (team lead or applicant), compared on digits only; 03xx and +923xx both match.
    const tail = digits.replace(/^(92|0)/, "");
    conditions.push(sql`regexp_replace(coalesce(${s.submissions.phone}, ''), '\\D', '', 'g') like ${`%${tail}%`}`);
  }
  const rows = await requireDb()
    .select({ pass: s.passes })
    .from(s.passes)
    .leftJoin(s.submissions, eq(s.submissions.id, s.passes.submissionId))
    .where(or(...conditions))
    .orderBy(desc(s.passes.id))
    .limit(15);
  return rows.map((r) => view(r.pass));
}

export async function gateStats(): Promise<GateStats> {
  await requireGateAccess();
  const rows = await requireDb()
    .select({
      category: s.passes.category,
      total: count(),
      checkedIn: sql<number>`count(${s.passes.checkedInAt})::int`,
    })
    .from(s.passes)
    .where(isNull(s.passes.revokedAt))
    .groupBy(s.passes.category);
  return {
    total: rows.reduce((n, r) => n + r.total, 0),
    checkedIn: rows.reduce((n, r) => n + r.checkedIn, 0),
    byCategory: rows,
  };
}
