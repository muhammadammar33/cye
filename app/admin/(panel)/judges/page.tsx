import { asc, desc, eq, inArray } from "drizzle-orm";
import { formatDate, PageHeader } from "@/components/admin/StatusBadge";
import { JudgeEmailForm } from "@/components/admin/JudgeEmailForm";
import { requireDb, schema as s } from "@/lib/db";
import { focalsOf } from "@/lib/focals";

/** Invite judges by email from a template, per competition, with its focal person(s) filled in. */
export default async function JudgesPage() {
  const db = requireDb();
  const [comps, sent] = await Promise.all([
    db.select().from(s.competitions).where(eq(s.competitions.active, true)).orderBy(asc(s.competitions.sortOrder), asc(s.competitions.id)),
    db
      .select({ id: s.adminLogs.id, action: s.adminLogs.action, target: s.adminLogs.target, details: s.adminLogs.details, by: s.adminLogs.adminName, at: s.adminLogs.createdAt })
      .from(s.adminLogs)
      .where(inArray(s.adminLogs.action, ["Emailed judge", "Judge email failed"]))
      .orderBy(desc(s.adminLogs.createdAt))
      .limit(50),
  ]);
  const competitions = comps.map((c) => ({ name: c.name, rulebook: c.rulebook, focals: focalsOf(c) }));

  return (
    <>
      <PageHeader title="Judge emails" description="Invite a judge for a competition. The competition's focal person is added to the email automatically." />
      <JudgeEmailForm competitions={competitions} />
      <section className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <h2 className="px-5 pt-4 font-heading text-base font-bold text-cye-blue">Sent ({sent.filter((r) => r.action === "Emailed judge").length})</h2>
        {sent.length ? (
          <div className="overflow-x-auto">
            <table className="mt-2 w-full min-w-[640px] text-left text-sm">
              <thead className="text-xs font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="px-5 py-2">Competition</th>
                  <th className="px-5 py-2">Judge</th>
                  <th className="px-5 py-2">Sent by</th>
                  <th className="px-5 py-2 text-right">When</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sent.map((r) => (
                  <tr key={r.id}>
                    <td className="px-5 py-2.5 font-semibold text-slate-800">{r.target}</td>
                    <td className="px-5 py-2.5">
                      {(r.details ?? "").split(": ")[0]}
                      {r.action !== "Emailed judge" ? <span className="ml-2 rounded-full bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-600">Failed</span> : null}
                    </td>
                    <td className="px-5 py-2.5 text-slate-500">{r.by}</td>
                    <td className="px-5 py-2.5 text-right text-slate-500">{formatDate(r.at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="px-5 pb-5 pt-2 text-sm text-slate-500">No judge emails sent yet.</p>
        )}
      </section>
    </>
  );
}
