"use server";

import { and, count, desc, eq, ilike, isNotNull, isNull, or, sql } from "drizzle-orm";
import { logActivity } from "@/lib/admin/log";
import { requireGateAccess } from "@/lib/auth";
import { requireDb, schema as s } from "@/lib/db";
import { TEAM_COUNT_CATEGORIES, type PassCategory } from "@/lib/passCategories";

export type GatePass = {
  id: number;
  code: string | null;
  name: string;
  category: string;
  detail: string | null;
  institution: string | null;
  checkedInAt: string | null;
  cancelled: boolean;
  /** Team members who came in with the holder. */
  companions: number;
  /** True for team leads whose members have no passes: the gate asks how many came with them. */
  askTeam: boolean;
  /** Team size given on the registration form, when known (startups). */
  registeredTeam: number | null;
};
export type GateResult = { result: "checked_in" | "already" | "cancelled" | "not_found"; pass?: GatePass };
export type GateStats = {
  total: number;
  checkedIn: number;
  companions: number;
  /** Pass holders checked in during the last 15 minutes. */
  recent: number;
  lastAt: string | null;
  byCategory: { category: string; total: number; checkedIn: number }[];
};

type Row = typeof s.passes.$inferSelect;
const view = (p: Row, registeredTeam: number | null = null): GatePass => ({
  id: p.id,
  code: p.code,
  name: p.name,
  category: p.category,
  detail: p.detail,
  institution: p.institution,
  checkedInAt: p.checkedInAt?.toISOString() ?? null,
  cancelled: Boolean(p.revokedAt),
  companions: p.companions,
  askTeam: TEAM_COUNT_CATEGORIES.includes(p.category as PassCategory),
  registeredTeam,
});

/** Team size from a startup registration, to remind gate staff how many to expect. */
async function registeredTeam(p: Row) {
  if (!p.submissionId || p.category !== "startup") return null;
  const [row] = await requireDb().select({ team: sql<string | null>`${s.submissions.data}->>'team'` }).from(s.submissions).where(eq(s.submissions.id, p.submissionId)).limit(1);
  const n = Number(row?.team);
  return Number.isInteger(n) && n > 0 ? n : null;
}

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
    return { result: "checked_in", pass: view(done, await registeredTeam(done)) };
  }
  const [pass] = await db.select().from(s.passes).where(match).limit(1);
  if (!pass) return { result: "not_found" };
  return { result: pass.revokedAt ? "cancelled" : "already", pass: view(pass) };
}

/** Undo a check-in made by mistake. */
export async function gateUndo(id: number): Promise<GateStats> {
  const me = await requireGateAccess();
  const [pass] = await requireDb().update(s.passes).set({ checkedInAt: null, companions: 0 }).where(and(eq(s.passes.id, id), isNotNull(s.passes.checkedInAt))).returning();
  if (pass) await logActivity(me, "Undid check-in", `${pass.code} ${pass.name}`);
  return gateStats();
}

/** Records how many team members came in with a checked-in team lead. */
export async function gateSetCompanions(id: number, people: number): Promise<GateStats> {
  const me = await requireGateAccess();
  const n = Math.max(0, Math.min(100, Math.trunc(Number(people) || 0)));
  const [pass] = await requireDb()
    .update(s.passes)
    .set({ companions: n })
    .where(and(eq(s.passes.id, id), isNotNull(s.passes.checkedInAt), isNull(s.passes.revokedAt)))
    .returning();
  if (pass) await logActivity(me, "Team at gate", `${pass.code} ${pass.name}`, `${n} team member${n === 1 ? "" : "s"} came in with them`);
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
      companions: sql<number>`coalesce(sum(${s.passes.companions}) filter (where ${s.passes.checkedInAt} is not null), 0)::int`,
      recent: sql<number>`count(*) filter (where ${s.passes.checkedInAt} > now() - interval '15 minutes')::int`,
      lastAt: sql<string | null>`max(${s.passes.checkedInAt})`,
    })
    .from(s.passes)
    .where(isNull(s.passes.revokedAt))
    .groupBy(s.passes.category);
  return {
    total: rows.reduce((n, r) => n + r.total, 0),
    checkedIn: rows.reduce((n, r) => n + r.checkedIn, 0),
    companions: rows.reduce((n, r) => n + r.companions, 0),
    recent: rows.reduce((n, r) => n + r.recent, 0),
    lastAt: rows.reduce<string | null>((max, r) => {
      const at = r.lastAt ? new Date(r.lastAt).toISOString() : null;
      return at && (!max || at > max) ? at : max;
    }, null),
    byCategory: rows.map(({ category, total, checkedIn }) => ({ category, total, checkedIn })),
  };
}
