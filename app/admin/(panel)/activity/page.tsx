import { and, count, desc, eq, ilike, ne, or, type SQL } from "drizzle-orm";
import Link from "next/link";
import { formatDate, PageHeader } from "@/components/admin/StatusBadge";
import { inputClass } from "@/components/admin/ui";
import { requireDb, schema as s } from "@/lib/db";

const PAGE_SIZE = 50;

export default async function ActivityPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() || "";
  const adminFilter = one(params.admin);
  const q = one(params.q).slice(0, 100);
  const page = Math.max(1, Number(params.page) || 1);

  const conditions: SQL[] = [];
  if (adminFilter) conditions.push(eq(s.adminLogs.adminEmail, adminFilter));
  if (q) {
    const like = `%${q.replace(/[%_\\]/g, "\\$&")}%`;
    conditions.push(or(ilike(s.adminLogs.action, like), ilike(s.adminLogs.target, like), ilike(s.adminLogs.details, like))!);
  }
  const where = conditions.length ? and(...conditions) : undefined;

  const db = requireDb();
  const [rows, [{ total }], people] = await Promise.all([
    db.select().from(s.adminLogs).where(where).orderBy(desc(s.adminLogs.createdAt), desc(s.adminLogs.id)).limit(PAGE_SIZE).offset((page - 1) * PAGE_SIZE),
    db.select({ total: count() }).from(s.adminLogs).where(where),
    db.selectDistinct({ email: s.adminLogs.adminEmail, name: s.adminLogs.adminName }).from(s.adminLogs).where(ne(s.adminLogs.action, "Failed sign-in")),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const query = (p: number) => {
    const sp = new URLSearchParams();
    if (adminFilter) sp.set("admin", adminFilter);
    if (q) sp.set("q", q);
    if (p > 1) sp.set("page", String(p));
    const str = sp.toString();
    return `/admin/activity${str ? `?${str}` : ""}`;
  };
  const admins = [...new Map(people.map((p) => [p.email, p])).values()].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <>
      <PageHeader title="Activity log" description={`Every change made in this dashboard, newest first. ${total.toLocaleString()} entr${total === 1 ? "y" : "ies"}.`} />

      <form className="mb-4 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-[1fr_2fr_auto]">
        <select name="admin" defaultValue={adminFilter} className={inputClass} aria-label="Admin">
          <option value="">All admins</option>
          {admins.map((a) => (
            <option key={a.email} value={a.email}>
              {a.name} ({a.email})
            </option>
          ))}
        </select>
        <input name="q" defaultValue={q} placeholder="Search action, item or details..." className={inputClass} aria-label="Search" />
        <button type="submit" className="mt-1.5 rounded-xl bg-grad-blue px-5 py-2 text-sm font-semibold text-white">
          Filter
        </button>
      </form>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-3">When</th>
              <th className="px-4 py-3">Admin</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Item</th>
              <th className="px-4 py-3">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 align-top">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                  No activity recorded yet.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50">
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-500">{formatDate(row.createdAt)}</td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-800">{row.adminName}</p>
                    <p className="text-xs text-slate-500">{row.adminEmail}</p>
                  </td>
                  <td className={row.action === "Failed sign-in" || row.action.startsWith("Deleted") || row.action.startsWith("Removed") ? "px-4 py-3 font-semibold text-red-600" : "px-4 py-3 font-semibold text-cye-blue"}>
                    {row.action}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{row.target}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">
                    {row.details}
                    {row.ip ? <span className="block text-slate-400">IP {row.ip}</span> : null}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pages > 1 ? (
        <nav className="mt-6 flex items-center justify-center gap-2 text-sm" aria-label="Pagination">
          {page > 1 ? (
            <Link href={query(page - 1)} className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 font-semibold">
              Previous
            </Link>
          ) : null}
          <span className="text-slate-500">
            Page {page} of {pages}
          </span>
          {page < pages ? (
            <Link href={query(page + 1)} className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 font-semibold">
              Next
            </Link>
          ) : null}
        </nav>
      ) : null}
    </>
  );
}
