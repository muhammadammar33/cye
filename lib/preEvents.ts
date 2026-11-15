import "server-only";
import { randomBytes } from "node:crypto";
import { and, eq, inArray, isNull } from "drizzle-orm";
import { getSettings } from "@/lib/content";
import { requireDb, schema as s } from "@/lib/db";
import { preEventEmail, sendEmailBatch } from "@/lib/email";
import { passCode } from "@/lib/passCategories";
import { holdersFor, passOrigin } from "@/lib/passes";

type Submission = typeof s.submissions.$inferSelect;
type Pass = typeof s.passes.$inferSelect;

const key = (email: string, name: string) => `${email.trim().toLowerCase()}|${name.trim().toLowerCase()}`;

/** Names of competitions that shortlist teams at campus pre-events. Read fresh, not from the content cache. */
export async function preEventCompetitions() {
  const rows = await requireDb().select({ name: s.competitions.name }).from(s.competitions).where(eq(s.competitions.preEvent, true));
  return new Set(rows.map((r) => r.name));
}

/**
 * Members of a registration who should go to CYE as visitors after the pre-event, and why:
 * the whole team when it did not qualify or was absent, otherwise only members marked absent.
 */
type Visitor = { name: string; email: string; institution: string | null; reason: "not_qualified" | "absent" };

export function visitorsFrom(sub: Submission): Visitor[] {
  const absent = new Set((sub.preEventAbsent ?? []).map((e) => e.toLowerCase()));
  return holdersFor(sub).flatMap((h): Visitor[] => {
    const memberAbsent = absent.has(h.email.toLowerCase());
    if (sub.preEventResult === "absent" || memberAbsent) return [{ ...h, reason: "absent" as const }];
    if (sub.preEventResult === "not_qualified") return [{ ...h, reason: "not_qualified" as const }];
    return [];
  });
}

export type PlannedVisitor = {
  submissionId: number;
  competition: string;
  name: string;
  email: string;
  institution: string | null;
  reason: "not_qualified" | "absent";
  /** They were emailed a Competitor pass (still valid or not): their email opens with the apology. */
  apology: boolean;
  /** Valid Competitor passes to cancel. */
  cancel: number[];
};

/**
 * Everyone who still has to be moved to visitors: marked Not qualified or Absent and without a Visitor pass for
 * that registration yet. Running it twice never repeats anyone.
 */
export async function planPreEventResults(): Promise<PlannedVisitor[]> {
  const db = requireDb();
  const names = [...(await preEventCompetitions())];
  if (!names.length) return [];
  const subs = await db.select().from(s.submissions).where(and(eq(s.submissions.type, "competition"), inArray(s.submissions.subject, names)));
  const candidates = subs.flatMap((sub) => visitorsFrom(sub).map((v) => ({ sub, v })));
  if (!candidates.length) return [];
  const passes = await db.select().from(s.passes).where(inArray(s.passes.submissionId, [...new Set(candidates.map((c) => c.sub.id))]));
  const bySubject = new Map<string, Pass[]>();
  for (const p of passes) {
    const k = `${p.submissionId}|${key(p.email, p.name)}`;
    bySubject.set(k, [...(bySubject.get(k) ?? []), p]);
  }
  return candidates.flatMap(({ sub, v }) => {
    const own = bySubject.get(`${sub.id}|${key(v.email, v.name)}`) ?? [];
    if (own.some((p) => p.category === "visitor" && !p.revokedAt)) return []; // already moved
    const competitor = own.filter((p) => p.category === "competition");
    return [
      {
        submissionId: sub.id,
        competition: sub.subject ?? "your competition",
        name: v.name,
        email: v.email,
        institution: v.institution,
        reason: v.reason,
        apology: competitor.some((p) => p.emailedAt),
        cancel: competitor.filter((p) => !p.revokedAt).map((p) => p.id),
      },
    ];
  });
}

/**
 * Moves the planned people to visitors: cancels their Competitor passes, issues Visitor passes and emails each
 * person the right notice (not qualified or absent, with the apology if they had been sent a Competitor pass).
 */
export async function applyPreEventResults(issuedBy: string) {
  const db = requireDb();
  const plan = await planPreEventResults();
  if (!plan.length) return { moved: 0, cancelled: 0, emailed: 0, apologies: 0 };

  const cancelIds = plan.flatMap((p) => p.cancel);
  if (cancelIds.length) await db.update(s.passes).set({ revokedAt: new Date() }).where(and(inArray(s.passes.id, cancelIds), isNull(s.passes.revokedAt)));

  const inserted = await db
    .insert(s.passes)
    .values(
      plan.map((p) => ({
        token: randomBytes(16).toString("hex"),
        category: "visitor",
        submissionId: p.submissionId,
        name: p.name,
        email: p.email,
        detail: `Visitor · ${p.competition} pre-event`,
        institution: p.institution,
        issuedBy,
      })),
    )
    .returning();
  const visitorPasses = await Promise.all(
    inserted.map(async (p) => {
      const code = passCode("visitor", p.id);
      await db.update(s.passes).set({ code }).where(eq(s.passes.id, p.id));
      return { ...p, code };
    }),
  );

  const origin = await passOrigin();
  const settings = await getSettings();
  const ctx = { origin, social: settings.social_links };
  let emailed = 0;
  for (let i = 0; i < plan.length; i += 100) {
    const chunk = plan.slice(i, i + 100).map((p, j) => ({ p, pass: visitorPasses[i + j] }));
    const ok = await sendEmailBatch(
      chunk.map(({ p, pass }) => ({
        to: p.email,
        subject: p.apology ? "An apology and your Visitor pass | Capital Youth Expo 2026" : "Your pre-event result and Visitor pass | Capital Youth Expo 2026",
        html: preEventEmail(ctx, { name: p.name, competition: p.competition, reason: p.reason, apology: p.apology, pass: pass }),
        replyTo: settings.inboxes.competitions,
      })),
    );
    if (ok) {
      await db.update(s.passes).set({ emailedAt: new Date() }).where(inArray(s.passes.id, chunk.map((c) => c.pass.id)));
      emailed += chunk.length;
    }
    if (i + 100 < plan.length) await new Promise((r) => setTimeout(r, 1000));
  }
  return { moved: plan.length, cancelled: cancelIds.length, emailed, apologies: plan.filter((p) => p.apology).length };
}

/** A result anywhere in a free-text line (WhatsApp style), checking "not qualified" before "qualified". */
export function resultInText(text: string): "qualified" | "not_qualified" | "absent" | null {
  const t = ` ${text.toLowerCase().replace(/[^a-z]+/g, " ")} `;
  if (/ (not qualified|not selected|did not qualify|didnt qualify|nq|failed|fail|eliminated|rejected|lost) /.test(t)) return "not_qualified";
  if (/ (absent|did not attend|didnt attend|not attended|no show|noshow|missing) /.test(t)) return "absent";
  if (/ (qualified|selected|passed|through|winner|won) /.test(t)) return "qualified";
  return null;
}

/** Accepted spellings of results in uploaded lists and pasted WhatsApp messages. */
export function parseResult(text: string): "qualified" | "not_qualified" | "absent" | null {
  const t = text.trim().toLowerCase().replace(/[^a-z ]/g, " ").replace(/\s+/g, " ");
  if (!t) return null;
  if (/^(absent|a|did not attend|didnt attend|not attended|no show|noshow|missing)$/.test(t)) return "absent";
  if (/^(not qualified|nq|not selected|failed|fail|eliminated|out|rejected|no|lost)$/.test(t)) return "not_qualified";
  if (/^(qualified|q|selected|pass|passed|yes|through|winner|won)$/.test(t)) return "qualified";
  return null;
}

export type CsvMatch = { line: number; email: string | null; result: "qualified" | "not_qualified" | "absent"; submissionId: number; competition: string; team: string; person: string | null };
export type CsvProblem = { line: number; text: string; why: string };

/**
 * Reads a results list (CSV from a campus, or lines pasted from WhatsApp): each line needs an email or a
 * registration number (#123) and a result (qualified / not qualified / absent, common spellings accepted).
 * Emails match the team lead or any team member of a registration in a pre-event competition.
 */
export async function matchResults(text: string) {
  const db = requireDb();
  const names = [...(await preEventCompetitions())];
  const subs = names.length
    ? await db.select().from(s.submissions).where(and(eq(s.submissions.type, "competition"), inArray(s.submissions.subject, names)))
    : [];
  const byEmail = new Map<string, { sub: Submission; person: string }>();
  for (const sub of subs) {
    for (const h of holdersFor(sub)) if (!byEmail.has(h.email.toLowerCase())) byEmail.set(h.email.toLowerCase(), { sub, person: h.name });
  }
  const byId = new Map(subs.map((sub) => [sub.id, sub]));
  const matches: CsvMatch[] = [];
  const problems: CsvProblem[] = [];
  text.split(/\r?\n/).forEach((raw, i) => {
    const line = raw.trim();
    if (!line) return;
    const cells = line.split(/[,;\t|]/).map((c) => c.trim().replace(/^"|"$/g, ""));
    const email = cells.map((c) => c.match(/[^\s<>()"']+@[^\s<>()"']+\.[a-z]{2,}/i)?.[0]?.toLowerCase()).find(Boolean) ?? null;
    const idCell = cells.map((c) => c.match(/^#?(\d{1,7})$/)?.[1]).find(Boolean);
    const result = cells.map(parseResult).find(Boolean) ?? resultInText(line.replace(/[^\s<>()"']+@[^\s<>()"']+/g, " "));
    if (!email && !idCell) {
      if (i === 0 && !result) return; // header row
      problems.push({ line: i + 1, text: line, why: "No email or registration number" });
      return;
    }
    if (!result) return void problems.push({ line: i + 1, text: line, why: "No result (qualified / not qualified / absent)" });
    const hit = email ? byEmail.get(email) : undefined;
    const sub = hit?.sub ?? (idCell ? byId.get(Number(idCell)) : undefined);
    if (!sub) return void problems.push({ line: i + 1, text: line, why: email ? "Email not found in a pre-event competition" : "Registration number not found in a pre-event competition" });
    const team = typeof sub.data.team === "string" && sub.data.team ? sub.data.team : sub.name;
    matches.push({ line: i + 1, email, result, submissionId: sub.id, competition: sub.subject ?? "", team, person: hit?.person ?? null });
  });
  return { matches, problems };
}

/**
 * Saves matched results. Qualified / not qualified apply to the whole team. Absent marks the matched member,
 * or the whole team when matched by registration number or when every member is absent.
 */
export async function saveResults(matches: CsvMatch[]) {
  const db = requireDb();
  const ids = [...new Set(matches.map((m) => m.submissionId))];
  if (!ids.length) return [];
  const subs = await db.select().from(s.submissions).where(inArray(s.submissions.id, ids));
  const changed: number[] = [];
  for (const sub of subs) {
    const mine = matches.filter((m) => m.submissionId === sub.id);
    let result = sub.preEventResult;
    const absent = new Set((sub.preEventAbsent ?? []).map((e) => e.toLowerCase()));
    for (const m of mine) {
      if (m.result === "absent" && m.email) absent.add(m.email);
      else result = m.result;
    }
    const members = holdersFor(sub).map((h) => h.email.toLowerCase());
    if (members.length && members.every((e) => absent.has(e))) {
      result = "absent";
      absent.clear();
    }
    await db.update(s.submissions).set({ preEventResult: result, preEventAbsent: absent.size ? [...absent] : null }).where(eq(s.submissions.id, sub.id));
    changed.push(sub.id);
  }
  return changed;
}
