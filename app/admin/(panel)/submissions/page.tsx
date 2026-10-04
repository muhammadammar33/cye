import { count, desc } from "drizzle-orm";
import { Download } from "lucide-react";
import Link from "next/link";
import { bulkSetStatus } from "@/app/admin/actions";
import { formatDate, PageHeader, StatusBadge } from "@/components/admin/StatusBadge";
import { inputClass, SubmitButton } from "@/components/admin/ui";
import { STATUS_LABELS, TYPE_NAMES } from "@/lib/admin/labels";
import { filterQuery, parseFilters, whereFor } from "@/lib/admin/submissionQuery";
import { requireDb, schema as s } from "@/lib/db";
import { SUBMISSION_STATUSES, SUBMISSION_TYPES } from "@/lib/db/schema";

const PAGE_SIZE = 25;

export default async function SubmissionsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const filters = parseFilters(params);
  const page = Math.max(1, Number(params.page) || 1);
  const db = requireDb();
  const where = whereFor(filters);
  const [rows, [{ total }]] = await Promise.all([
    db.select().from(s.submissions).where(where).orderBy(desc(s.submissions.createdAt)).limit(PAGE_SIZE).offset((page - 1) * PAGE_SIZE),
    db.select({ total: count() }).from(s.submissions).where(where),
  ]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <>
      <PageHeader
        title={filters.type ? TYPE_NAMES[filters.type] : "All submissions"}
        description={`${total.toLocaleString()} result${total === 1 ? "" : "s"}`}
        actions={
          <a href={`/admin/submissions/export${filterQuery(filters)}`} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            <Download className="h-4 w-4" aria-hidden />
            Export CSV
          </a>
        }
      />

      <form className="mb-4 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-[1fr_1fr_2fr_auto]">
        <select name="type" defaultValue={filters.type ?? ""} className={inputClass} aria-label="Form">
          <option value="">All forms</option>
          {SUBMISSION_TYPES.map((t) => (
            <option key={t} value={t}>
              {TYPE_NAMES[t]}
            </option>
          ))}
        </select>
        <select name="status" defaultValue={filters.status ?? ""} className={inputClass} aria-label="Status">
          <option value="">Any status</option>
          {SUBMISSION_STATUSES.map((st) => (
            <option key={st} value={st}>
              {STATUS_LABELS[st]}
            </option>
          ))}
        </select>
        <input name="q" defaultValue={filters.q ?? ""} placeholder="Search name, email, phone, institution..." className={inputClass} aria-label="Search" />
        <button type="submit" className="mt-1.5 rounded-xl bg-grad-blue px-5 py-2 text-sm font-semibold text-white">
          Filter
        </button>
      </form>

      <form action={bulkSetStatus}>
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="w-10 px-4 py-3" />
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Form</th>
                <th className="px-4 py-3">About</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Received</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                    No submissions match these filters.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <input type="checkbox" name="ids" value={row.id} aria-label={`Select ${row.name}`} className="h-4 w-4 accent-cye-orange" />
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/admin/submissions/${row.id}`} className="font-semibold text-cye-blue hover:underline">
                        {row.name}
                      </Link>
                      <p className="text-xs text-slate-500">
                        {row.email}
                        {row.phone ? ` · ${row.phone}` : ""}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{TYPE_NAMES[row.type]}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {row.subject}
                      {row.data.paymentSlip ? (
                        <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-700">Slip</span>
                      ) : null}
                      {row.institution && row.institution !== row.subject ? <p className="text-xs text-slate-400">{row.institution}</p> : null}
                    </td>
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
        {rows.length ? (
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <span className="text-sm text-slate-600">Selected:</span>
            <select name="bulkStatus" defaultValue="in_review" className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm" aria-label="New status">
              {SUBMISSION_STATUSES.map((st) => (
                <option key={st} value={st}>
                  Mark as {STATUS_LABELS[st].toLowerCase()}
                </option>
              ))}
            </select>
            <SubmitButton variant="ghost">Apply</SubmitButton>
          </div>
        ) : null}
      </form>

      {pages > 1 ? (
        <nav className="mt-6 flex items-center justify-center gap-2 text-sm" aria-label="Pagination">
          {page > 1 ? (
            <Link href={`/admin/submissions${filterQuery(filters, { page: page - 1 })}`} className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 font-semibold">
              Previous
            </Link>
          ) : null}
          <span className="text-slate-500">
            Page {page} of {pages}
          </span>
          {page < pages ? (
            <Link href={`/admin/submissions${filterQuery(filters, { page: page + 1 })}`} className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 font-semibold">
              Next
            </Link>
          ) : null}
        </nav>
      ) : null}
    </>
  );
}
