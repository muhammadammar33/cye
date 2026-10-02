import { count, desc, gt, sql } from "drizzle-orm";
import Link from "next/link";
import { formatDate, PageHeader, StatusBadge } from "@/components/admin/StatusBadge";
import { TYPE_NAMES } from "@/lib/admin/labels";
import { requireDb, schema as s } from "@/lib/db";
import { SUBMISSION_TYPES, type SubmissionType } from "@/lib/db/schema";

export default async function AdminHome() {
  const db = requireDb();
  const [byType, [{ week }], recent] = await Promise.all([
    db
      .select({ type: s.submissions.type, total: count(), fresh: sql<number>`count(*) filter (where ${s.submissions.status} = 'new')`.mapWith(Number) })
      .from(s.submissions)
      .groupBy(s.submissions.type),
    db.select({ week: count() }).from(s.submissions).where(gt(s.submissions.createdAt, sql`now() - interval '7 days'`)),
    db.select().from(s.submissions).orderBy(desc(s.submissions.createdAt)).limit(8),
  ]);
  const stats = new Map(byType.map((row) => [row.type, row]));
  const total = byType.reduce((sum, row) => sum + row.total, 0);
  const fresh = byType.reduce((sum, row) => sum + row.fresh, 0);

  return (
    <>
      <PageHeader title="Overview" description="Everything coming in through the website." />
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total submissions", value: total },
          { label: "Waiting for review", value: fresh, accent: true },
          { label: "Last 7 days", value: week },
        ].map((card) => (
          <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{card.label}</p>
            <p className={`mt-2 font-heading text-3xl font-black ${card.accent ? "text-cye-orange" : "text-cye-blue"}`}>{card.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      <h2 className="mt-8 font-heading text-lg font-bold text-cye-blue">By form</h2>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {SUBMISSION_TYPES.map((type: SubmissionType) => {
          const row = stats.get(type);
          return (
            <Link key={type} href={`/admin/submissions?type=${type}`} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-cye-orange">
              <p className="text-sm font-semibold text-slate-700">{TYPE_NAMES[type]}</p>
              <p className="mt-1 font-heading text-2xl font-black text-cye-blue">{row?.total ?? 0}</p>
              <p className="text-xs font-semibold text-cye-orange">{row?.fresh ?? 0} new</p>
            </Link>
          );
        })}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <h2 className="font-heading text-lg font-bold text-cye-blue">Latest submissions</h2>
        <Link href="/admin/submissions" className="text-sm font-semibold text-cye-orange hover:underline">
          View all
        </Link>
      </div>
      <div className="mt-3 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[640px] text-left text-sm">
          <tbody className="divide-y divide-slate-100">
            {recent.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-center text-slate-500">No submissions yet.</td>
              </tr>
            ) : (
              recent.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/submissions/${row.id}`} className="font-semibold text-cye-blue hover:underline">
                      {row.name}
                    </Link>
                    <p className="text-xs text-slate-500">{row.email}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{TYPE_NAMES[row.type]}</td>
                  <td className="px-4 py-3 text-slate-600">{row.subject}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={row.status} />
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-slate-500">{formatDate(row.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
