import { and, asc, eq, isNotNull, sql } from "drizzle-orm";
import Link from "next/link";
import { PageHeader } from "@/components/admin/StatusBadge";
import { requireDb, schema as s } from "@/lib/db";

const amount = (fee: unknown) => Number(String(fee ?? "").replace(/[^\d]/g, "")) || 0;

/** Head ambassador coupons ranked by how many competition registrations used them. */
export default async function CouponsPage() {
  const db = requireDb();
  const coupon = sql<string>`${s.submissions.data}->>'coupon'`;
  const [owners, used] = await Promise.all([
    db
      .select({ code: s.ambassadors.coupon, name: s.ambassadors.name, institute: s.ambassadors.institute, active: s.ambassadors.active })
      .from(s.ambassadors)
      .where(isNotNull(s.ambassadors.coupon))
      .orderBy(asc(s.ambassadors.sortOrder)),
    db
      .select({ coupon, status: s.submissions.status, payment: s.submissions.paymentStatus, data: s.submissions.data })
      .from(s.submissions)
      .where(and(eq(s.submissions.type, "competition"), sql`${coupon} is not null`)),
  ]);

  const stats = new Map<string, { uses: number; approved: number; paid: number; discount: number }>();
  for (const r of used) {
    const st = stats.get(r.coupon) ?? { uses: 0, approved: 0, paid: 0, discount: 0 };
    st.uses++;
    if (r.status === "approved") st.approved++;
    if (r.payment === "Confirmed") st.paid++;
    const d = r.data as Record<string, unknown>;
    st.discount += Math.max(0, amount(d.feeBeforeCoupon) - amount(d.fee));
    stats.set(r.coupon, st);
  }
  const empty = { uses: 0, approved: 0, paid: 0, discount: 0 };
  const rows = owners
    .map((o) => ({ ...o, code: o.code!, ...(stats.get(o.code!) ?? empty) }))
    .sort((a, b) => b.uses - a.uses || b.paid - a.paid);
  // Codes used on registrations whose ambassador's code was later changed or removed.
  const orphan = [...stats].filter(([code]) => !owners.some((o) => o.code === code));
  const total = used.length;
  const discount = [...stats.values()].reduce((n, st) => n + st.discount, 0);
  const usedCodes = rows.filter((r) => r.uses > 0).length;
  const pkr = (n: number) => `PKR ${n.toLocaleString("en-US")}`;

  return (
    <>
      <PageHeader
        title="Coupons"
        description="Head ambassador coupons (10% off a competition registration fee), most used first. Click a code to see its registrations."
      />
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        {[
          ["Registrations with a coupon", total.toLocaleString()],
          ["Coupons used at least once", `${usedCodes} of ${rows.length}`],
          ["Total discount given", pkr(discount)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p>
            <p className="mt-1 font-heading text-2xl font-extrabold text-cye-blue">{value}</p>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Coupon</th>
              <th className="px-4 py-3">Head ambassador</th>
              <th className="px-4 py-3 text-right">Registrations</th>
              <th className="px-4 py-3 text-right">Approved</th>
              <th className="px-4 py-3 text-right">Payment confirmed</th>
              <th className="px-4 py-3 text-right">Discount given</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((r, i) => (
              <tr key={r.code} className={r.uses ? "hover:bg-slate-50" : "text-slate-400"}>
                <td className="px-4 py-3 text-xs text-slate-400">{r.uses ? i + 1 : "–"}</td>
                <td className="px-4 py-3">
                  <Link href={`/admin/submissions?type=competition&q=${encodeURIComponent(r.code)}`} className="whitespace-nowrap font-mono font-semibold text-cye-blue hover:underline">
                    {r.code}
                  </Link>
                  {!r.active ? <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">hidden, not accepted</span> : null}
                </td>
                <td className="px-4 py-3">
                  <span className={r.uses ? "font-medium text-slate-800" : undefined}>{r.name}</span>
                  <span className="block text-xs text-slate-500">{r.institute}</span>
                </td>
                <td className={`px-4 py-3 text-right font-heading text-base font-extrabold ${r.uses ? "text-cye-blue" : ""}`}>{r.uses}</td>
                <td className="px-4 py-3 text-right">{r.approved}</td>
                <td className="px-4 py-3 text-right">{r.paid}</td>
                <td className="px-4 py-3 text-right">{r.discount ? pkr(r.discount) : "–"}</td>
              </tr>
            ))}
            {orphan.map(([code, st]) => (
              <tr key={code} className="bg-amber-50/50">
                <td className="px-4 py-3 text-xs text-slate-400">–</td>
                <td className="px-4 py-3">
                  <Link href={`/admin/submissions?type=competition&q=${encodeURIComponent(code)}`} className="whitespace-nowrap font-mono font-semibold text-cye-blue hover:underline">
                    {code}
                  </Link>
                </td>
                <td className="px-4 py-3 text-xs text-amber-700">No ambassador has this code any more</td>
                <td className="px-4 py-3 text-right font-heading text-base font-extrabold text-cye-blue">{st.uses}</td>
                <td className="px-4 py-3 text-right">{st.approved}</td>
                <td className="px-4 py-3 text-right">{st.paid}</td>
                <td className="px-4 py-3 text-right">{st.discount ? pkr(st.discount) : "–"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
