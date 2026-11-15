import { and, count, eq, inArray, like, sql } from "drizzle-orm";
import Link from "next/link";
import { sendPreEventResults } from "@/app/admin/actions";
import { ResultsImport } from "@/components/admin/ResultsImport";
import { PageHeader } from "@/components/admin/StatusBadge";
import { ConfirmForm } from "@/components/admin/ui";
import { requireDb, schema as s } from "@/lib/db";
import { planPreEventResults } from "@/lib/preEvents";

const EMAILS = [
  ["not_qualified", "Not qualified"],
  ["not_qualified-apology", "Not qualified, with apology"],
  ["absent", "Absent"],
  ["absent-apology", "Absent, with apology"],
] as const;

export default async function PreEventsPage() {
  const db = requireDb();
  const comps = await db.select({ name: s.competitions.name }).from(s.competitions).where(eq(s.competitions.preEvent, true));
  const names = comps.map((c) => c.name);
  const [summary, plan, [{ moved }]] = await Promise.all([
    names.length
      ? db
          .select({
            competition: s.submissions.subject,
            total: count(),
            qualified: sql<number>`count(*) filter (where ${s.submissions.preEventResult} = 'qualified')::int`,
            notQualified: sql<number>`count(*) filter (where ${s.submissions.preEventResult} = 'not_qualified')::int`,
            absent: sql<number>`count(*) filter (where ${s.submissions.preEventResult} = 'absent')::int`,
            pending: sql<number>`count(*) filter (where ${s.submissions.preEventResult} is null)::int`,
            absentMembers: sql<number>`coalesce(sum(jsonb_array_length(coalesce(${s.submissions.preEventAbsent}, '[]'::jsonb))), 0)::int`,
          })
          .from(s.submissions)
          .where(and(eq(s.submissions.type, "competition"), inArray(s.submissions.subject, names)))
          .groupBy(s.submissions.subject)
      : Promise.resolve([]),
    planPreEventResults(),
    db.select({ moved: count() }).from(s.passes).where(and(eq(s.passes.category, "visitor"), like(s.passes.detail, "% pre-event"))),
  ]);
  const byName = new Map(summary.map((r) => [r.competition, r]));
  const apologies = plan.filter((p) => p.apology).length;
  const cancels = plan.reduce((n, p) => n + p.cancel.length, 0);
  const notQualified = plan.filter((p) => p.reason === "not_qualified").length;

  return (
    <>
      <PageHeader
        title="Pre-events"
        description="Campus pre-events shortlist teams for CYE. Teams that don't qualify, and members who were absent, go to CYE as visitors."
      />

      {names.length === 0 ? (
        <p className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          No competition has a pre-event yet. Turn on <strong>Has campus pre-event</strong> on a competition in{" "}
          <Link href="/admin/content/competitions" className="font-semibold underline">
            Competitions
          </Link>
          .
        </p>
      ) : (
        <section className="mb-6 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Competition</th>
                <th className="px-4 py-3">Teams</th>
                <th className="px-4 py-3 text-emerald-700">Qualified</th>
                <th className="px-4 py-3 text-red-700">Not qualified</th>
                <th className="px-4 py-3 text-amber-700">Absent</th>
                <th className="px-4 py-3">Pending</th>
                <th className="px-4 py-3">Members absent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {names.map((name) => {
                const r = byName.get(name);
                const link = (pre: string) => `/admin/submissions?type=competition&q=${encodeURIComponent(name)}&pre=${pre}`;
                return (
                  <tr key={name}>
                    <td className="px-4 py-3 font-semibold text-cye-ink">{name}</td>
                    <td className="px-4 py-3">{r?.total ?? 0}</td>
                    <td className="px-4 py-3"><Link href={link("qualified")} className="hover:underline">{r?.qualified ?? 0}</Link></td>
                    <td className="px-4 py-3"><Link href={link("not_qualified")} className="hover:underline">{r?.notQualified ?? 0}</Link></td>
                    <td className="px-4 py-3"><Link href={link("absent")} className="hover:underline">{r?.absent ?? 0}</Link></td>
                    <td className="px-4 py-3"><Link href={link("pending")} className="hover:underline">{r?.pending ?? 0}</Link></td>
                    <td className="px-4 py-3"><Link href={link("has_absent")} className="hover:underline">{r?.absentMembers ?? 0}</Link></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-heading text-lg font-extrabold text-cye-blue">1. Enter results</h2>
          <p className="mb-4 mt-1 text-sm text-slate-500">
            From a campus CSV or a WhatsApp message. Each line: an email (team lead or member) or registration number like #214, and a result. You can also set results in{" "}
            <Link href="/admin/submissions?type=competition" className="font-semibold text-cye-blue hover:underline">
              Submissions
            </Link>{" "}
            (Pre-event column, or select teams and use Set result).
          </p>
          <ResultsImport />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-heading text-lg font-extrabold text-cye-blue">2. Send results</h2>
          <p className="mt-1 text-sm text-slate-500">
            Moves everyone marked Not qualified or Absent to visitors: their Competitor pass is cancelled, they get a Visitor pass, and one email each. People who were emailed a
            Competitor pass get the apology. {moved ? `${moved} already moved.` : ""}
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            Preview emails:
            {EMAILS.map(([v, label]) => (
              <a key={v} href={`/admin/pre-events/email?variant=${v}`} target="_blank" rel="noreferrer" className="rounded-lg border border-slate-300 px-2 py-1 font-semibold text-slate-700 hover:bg-slate-50">
                {label}
              </a>
            ))}
          </div>

          {plan.length === 0 ? (
            <p className="mt-4 rounded-xl bg-slate-50 px-3 py-3 text-sm text-slate-600">Nobody to move right now.</p>
          ) : (
            <>
              <ul className="mt-4 grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
                {[
                  ["People to move", plan.length],
                  ["Not qualified", notQualified],
                  ["Absent", plan.length - notQualified],
                  ["Get the apology", apologies],
                ].map(([label, n]) => (
                  <li key={label} className="rounded-xl bg-slate-50 px-3 py-2">
                    <span className="block text-xs text-slate-500">{label}</span>
                    <span className="font-heading text-xl font-black text-cye-ink">{n}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 max-h-80 overflow-y-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-slate-50 font-bold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-3 py-2">Person</th>
                      <th className="px-3 py-2">Competition</th>
                      <th className="px-3 py-2">Email</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {plan.map((p) => (
                      <tr key={`${p.submissionId}-${p.email}-${p.name}`}>
                        <td className="px-3 py-2">
                          <span className="font-semibold text-slate-800">{p.name}</span>
                          <span className="block text-slate-500">{p.email}</span>
                        </td>
                        <td className="px-3 py-2 text-slate-600">
                          <Link href={`/admin/submissions/${p.submissionId}`} className="hover:underline">
                            {p.competition}
                          </Link>
                        </td>
                        <td className="px-3 py-2">
                          <span className={p.reason === "absent" ? "font-semibold text-amber-700" : "font-semibold text-red-700"}>{p.reason === "absent" ? "Absent" : "Not qualified"}</span>
                          {p.apology || p.cancel.length ? (
                            <span className="block text-slate-500">{[p.apology ? "+ apology" : "", p.cancel.length ? "Competitor pass cancelled" : ""].filter(Boolean).join(", ")}</span>
                          ) : null}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <ConfirmForm
                action={sendPreEventResults}
                message={`Move ${plan.length} people to visitors and email them now? ${cancels} Competitor pass${cancels === 1 ? "" : "es"} will be cancelled and ${apologies} people get the apology. This can't be undone.`}
              >
                <button type="submit" className="mt-4 w-full rounded-xl bg-grad-orange px-4 py-2.5 text-sm font-bold text-white">
                  Send results to {plan.length} {plan.length === 1 ? "person" : "people"}
                </button>
              </ConfirmForm>
            </>
          )}
        </section>
      </div>
    </>
  );
}
