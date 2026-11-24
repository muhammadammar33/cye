import { and, asc, eq, notInArray } from "drizzle-orm";
import Link from "next/link";
import { PageHeader } from "@/components/admin/StatusBadge";
import { requireDb, schema as s } from "@/lib/db";

const amount = (v: unknown) => Number(String(v ?? "").replace(/[^\d]/g, "")) || 0;
const pkr = (n: number) => `PKR ${n.toLocaleString("en-US")}`;
const pct = (part: number, whole: number) => (whole ? Math.round((part / whole) * 100) : 0);

/**
 * How much of each competition's prize pool its registrations cover. Counts every registration except rejected and
 * archived ones, at the fee each team actually pays (after any coupon), and separately those with payment confirmed.
 */
export default async function PrizeRecoveryPage() {
  const db = requireDb();
  const [comps, regs] = await Promise.all([
    db.select().from(s.competitions).where(eq(s.competitions.active, true)).orderBy(asc(s.competitions.sortOrder), asc(s.competitions.id)),
    db
      .select({ subject: s.submissions.subject, data: s.submissions.data, payment: s.submissions.paymentStatus })
      .from(s.submissions)
      .where(and(eq(s.submissions.type, "competition"), notInArray(s.submissions.status, ["rejected", "archived"]))),
  ]);

  const rows = comps
    .map((c) => {
      const pool = [c.prize1, c.prize2, c.prize3].reduce((n, p) => n + amount(p), 0);
      const mine = regs.filter((r) => r.subject === c.name);
      const feeOf = (r: (typeof regs)[number]) => amount((r.data as Record<string, unknown>).fee) || amount(c.fee);
      const collected = mine.reduce((n, r) => n + feeOf(r), 0);
      const paidRegs = mine.filter((r) => r.payment === "Confirmed");
      const paid = paidRegs.reduce((n, r) => n + feeOf(r), 0);
      return { name: c.name, onSpot: c.onSpot, fee: c.fee, pool, count: mine.length, collected, paidCount: paidRegs.length, paid, share: pct(collected, pool), paidShare: pct(paid, pool) };
    })
    .sort((a, b) => (b.pool ? 1 : 0) - (a.pool ? 1 : 0) || b.share - a.share);

  const withPool = rows.filter((r) => r.pool);
  const total = withPool.reduce((t, r) => ({ pool: t.pool + r.pool, collected: t.collected + r.collected, paid: t.paid + r.paid, count: t.count + r.count }), { pool: 0, collected: 0, paid: 0, count: 0 });
  const bar = (value: number) => (
    <span className="mt-1 block h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
      <span className={`block h-full rounded-full ${value >= 100 ? "bg-emerald-500" : value >= 50 ? "bg-amber-400" : "bg-cye-orange"}`} style={{ width: `${Math.min(100, value)}%` }} />
    </span>
  );

  return (
    <>
      <PageHeader
        title="Prize recovery"
        description="How much of each competition's prize pool its registration fees cover. Rejected and archived registrations are left out; fees are after coupons."
      />
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        {[
          ["Prize money (all competitions)", pkr(total.pool)],
          ["Fees from registrations", `${pkr(total.collected)} · ${pct(total.collected, total.pool)}%`],
          ["Payment confirmed", `${pkr(total.paid)} · ${pct(total.paid, total.pool)}%`],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
            <p className="mt-1 font-heading text-2xl font-extrabold text-cye-blue">{value}</p>
          </div>
        ))}
      </div>
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-3">Competition</th>
              <th className="px-4 py-3 text-right">Prize pool</th>
              <th className="px-4 py-3 text-right">Registrations</th>
              <th className="px-4 py-3 text-right">Fees</th>
              <th className="w-40 px-4 py-3">Recovered</th>
              <th className="px-4 py-3 text-right">Payment confirmed</th>
              <th className="w-40 px-4 py-3">Confirmed %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((r) => (
              <tr key={r.name} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link href={`/admin/submissions?comp=${encodeURIComponent(r.name)}`} className="font-semibold text-cye-blue hover:underline">
                    {r.name}
                  </Link>
                  <span className="block text-xs text-slate-500">
                    {r.fee}
                    {r.onSpot ? " · on-spot registration" : ""}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">{r.pool ? pkr(r.pool) : <span className="text-slate-400">No prizes set</span>}</td>
                <td className="px-4 py-3 text-right font-semibold">{r.count}</td>
                <td className="px-4 py-3 text-right">{pkr(r.collected)}</td>
                <td className="px-4 py-3">
                  {r.pool ? (
                    <>
                      <span className="font-heading text-base font-extrabold text-cye-blue">{r.share}%</span>
                      {bar(r.share)}
                    </>
                  ) : (
                    <span className="text-slate-400">–</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  {pkr(r.paid)}
                  <span className="block text-xs text-slate-500">{r.paidCount} confirmed</span>
                </td>
                <td className="px-4 py-3">
                  {r.pool ? (
                    <>
                      <span className="font-heading text-base font-extrabold text-cye-blue">{r.paidShare}%</span>
                      {bar(r.paidShare)}
                    </>
                  ) : (
                    <span className="text-slate-400">–</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t-2 border-slate-200 bg-slate-50 font-semibold">
            <tr>
              <td className="px-4 py-3">Total (competitions with prizes)</td>
              <td className="px-4 py-3 text-right">{pkr(total.pool)}</td>
              <td className="px-4 py-3 text-right">{total.count}</td>
              <td className="px-4 py-3 text-right">{pkr(total.collected)}</td>
              <td className="px-4 py-3">{pct(total.collected, total.pool)}%</td>
              <td className="px-4 py-3 text-right">{pkr(total.paid)}</td>
              <td className="px-4 py-3">{pct(total.paid, total.pool)}%</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </>
  );
}
