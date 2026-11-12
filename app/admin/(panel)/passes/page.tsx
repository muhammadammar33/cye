import { and, count, desc, eq, ilike, inArray, isNotNull, isNull, or, sql, type SQL } from "drizzle-orm";
import { resendPass, revokePass, sendMissingPasses } from "@/app/admin/actions";
import { ManualPassForm } from "@/components/admin/PassForms";
import { formatDate, PageHeader } from "@/components/admin/StatusBadge";
import { ConfirmForm, inputClass } from "@/components/admin/ui";
import { FOCAL_PERSONS, PASS_ONLY_FOCAL_PERSONS } from "@/data/event";
import { getCompetitions, getTeam } from "@/lib/content";
import { requireDb, schema as s } from "@/lib/db";
import { isPassCategory, PASS_CATEGORIES, PASS_CATEGORY_KEYS, PASS_FOR_TYPE, type PassCategory } from "@/lib/passCategories";

const PAGE_SIZE = 100;
const STATES = { valid: "Valid", checked: "Checked in", cancelled: "Cancelled", unsent: "Not emailed" } as const;
type State = keyof typeof STATES;

export default async function PassesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() || "";
  const category = isPassCategory(one(params.category)) ? (one(params.category) as PassCategory) : "";
  const state = (one(params.state) in STATES ? one(params.state) : "") as State | "";
  const q = one(params.q).slice(0, 100);
  const page = Math.max(1, Number(params.page) || 1);

  const conditions: SQL[] = [];
  if (category) conditions.push(eq(s.passes.category, category));
  if (state === "valid") conditions.push(isNull(s.passes.revokedAt));
  if (state === "cancelled") conditions.push(isNotNull(s.passes.revokedAt));
  if (state === "checked") conditions.push(isNotNull(s.passes.checkedInAt));
  if (state === "unsent") conditions.push(and(isNull(s.passes.emailedAt), isNull(s.passes.revokedAt))!);
  if (q) {
    const like = `%${q.replace(/[%_\\]/g, "\\$&")}%`;
    conditions.push(or(ilike(s.passes.name, like), ilike(s.passes.email, like), ilike(s.passes.code, like), ilike(s.passes.detail, like))!);
  }
  const where = conditions.length ? and(...conditions) : undefined;

  const db = requireDb();
  const passTypes = Object.keys(PASS_FOR_TYPE) as (keyof typeof PASS_FOR_TYPE)[];
  const [rows, [{ total }], stats, [{ missing }], competitions, team] = await Promise.all([
    db.select().from(s.passes).where(where).orderBy(desc(s.passes.createdAt), desc(s.passes.id)).limit(PAGE_SIZE).offset((page - 1) * PAGE_SIZE),
    db.select({ total: count() }).from(s.passes).where(where),
    db
      .select({
        category: s.passes.category,
        valid: sql<number>`count(*) filter (where ${s.passes.revokedAt} is null)::int`,
        checked: sql<number>`count(*) filter (where ${s.passes.checkedInAt} is not null and ${s.passes.revokedAt} is null)::int`,
        unsent: sql<number>`count(*) filter (where ${s.passes.emailedAt} is null and ${s.passes.revokedAt} is null)::int`,
      })
      .from(s.passes)
      .groupBy(s.passes.category),
    db
      .select({ missing: count() })
      .from(s.submissions)
      .where(
        and(
          eq(s.submissions.status, "approved"),
          inArray(s.submissions.type, passTypes),
          sql`not exists (select 1 from ${s.passes} where ${s.passes.submissionId} = ${s.submissions.id} and ${s.passes.revokedAt} is null)`,
        ),
      ),
    getCompetitions(),
    getTeam(),
  ]);
  const byCat = new Map(stats.map((r) => [r.category, r]));
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const link = (over: Record<string, string>) => {
    const sp = new URLSearchParams({ ...(category && { category }), ...(state && { state }), ...(q && { q }), ...over });
    for (const [k, v] of [...sp]) if (!v) sp.delete(k);
    const str = sp.toString();
    return `/admin/passes${str ? `?${str}` : ""}`;
  };
  // Known names for the manual pass form: focal persons and the event team (Admin > Team).
  const suggestions = [
    ...competitions.filter((c) => c.focalName).map((c) => ({ name: c.focalName!, detail: `Focal person, ${c.name}`, category: "focal" as const })),
    ...[...Object.values(FOCAL_PERSONS), ...PASS_ONLY_FOCAL_PERSONS].map((f) => ({ name: f.name, detail: f.title, category: "focal" as const })),
    ...team.map((m) => ({ name: m.name, detail: m.role, category: "team" as const })),
  ];

  return (
    <>
      <PageHeader
        title="Passes"
        description="Approving a submission emails a pass to each person on it. Every pass type has its own colour. Scan a QR code (signed in) to check someone in."
      />

      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {PASS_CATEGORY_KEYS.map((c) => {
          const st = byCat.get(c);
          return (
            <a key={c} href={link({ category: c, page: "" })} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:border-slate-300">
              <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wide" style={{ color: PASS_CATEGORIES[c].color }}>
                <span className="h-3 w-3 rounded-full" style={{ background: PASS_CATEGORIES[c].color }} aria-hidden />
                {PASS_CATEGORIES[c].label}
              </span>
              <p className="mt-2 font-heading text-2xl font-black text-cye-ink">{st?.valid ?? 0}</p>
              <p className="text-xs text-slate-500">
                {st?.checked ?? 0} checked in{st?.unsent ? ` · ${st.unsent} not emailed` : ""}
              </p>
            </a>
          );
        })}
      </div>

      {missing > 0 ? (
        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-amber-900">
            <strong>{missing}</strong> approved submission{missing === 1 ? " has" : "s have"} no pass yet (approved before passes were switched on).
          </p>
          <ConfirmForm action={sendMissingPasses} message={`Issue and email passes for ${missing} approved submission${missing === 1 ? "" : "s"}?`}>
            <button type="submit" className="rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700">
              Send their passes
            </button>
          </ConfirmForm>
        </div>
      ) : null}

      <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-heading text-lg font-extrabold text-cye-blue">Issue a pass by hand</h2>
        <p className="mb-4 mt-1 text-sm text-slate-500">For focal persons and the event team. Start typing a name to pick from the list; pass type and role fill in. The pass is emailed straight away.</p>
        <ManualPassForm suggestions={suggestions} />
      </section>

      <form className="mb-4 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-[1fr_1fr_2fr_auto]">
        <select name="category" defaultValue={category} className={inputClass} aria-label="Pass type">
          <option value="">All pass types</option>
          {PASS_CATEGORY_KEYS.map((c) => (
            <option key={c} value={c}>
              {PASS_CATEGORIES[c].label}
            </option>
          ))}
        </select>
        <select name="state" defaultValue={state} className={inputClass} aria-label="Status">
          <option value="">Any status</option>
          {Object.entries(STATES).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
        <input name="q" defaultValue={q} placeholder="Search name, email, pass number..." className={inputClass} aria-label="Search" />
        <button type="submit" className="mt-1.5 rounded-xl bg-grad-blue px-5 py-2 text-sm font-semibold text-white">
          Filter
        </button>
      </form>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[860px] text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Pass</th>
              <th className="px-4 py-3">Holder</th>
              <th className="px-4 py-3">For</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Issued</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                  No passes yet.
                </td>
              </tr>
            ) : (
              rows.map((p) => {
                const cat = PASS_CATEGORIES[p.category as PassCategory] ?? PASS_CATEGORIES.visitor;
                return (
                  <tr key={p.id} className={p.revokedAt ? "opacity-50" : ""}>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-2 whitespace-nowrap font-mono text-xs font-bold" style={{ color: cat.color }}>
                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: cat.color }} aria-hidden />
                        {p.code}
                      </span>
                      <span className="block text-xs text-slate-500">{cat.label}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-semibold text-cye-ink">{p.name}</span>
                      <span className="block text-xs text-slate-500">{p.email}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {p.detail ?? "-"}
                      {p.submissionId ? (
                        <a href={`/admin/submissions/${p.submissionId}`} className="block text-xs text-cye-blue hover:underline">
                          Submission #{p.submissionId}
                        </a>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {p.revokedAt ? (
                        <span className="font-semibold text-red-600">Cancelled</span>
                      ) : p.checkedInAt ? (
                        <span className="font-semibold text-emerald-700">
                          Checked in {formatDate(p.checkedInAt)}
                          {p.companions ? ` with ${p.companions} team member${p.companions === 1 ? "" : "s"}` : ""}
                        </span>
                      ) : (
                        <span className="font-semibold text-slate-700">Valid</span>
                      )}
                      <span className="block text-slate-500">{p.emailedAt ? `Emailed ${formatDate(p.emailedAt)}` : "Not emailed"}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {formatDate(p.createdAt)}
                      {p.issuedBy ? <span className="block">by {p.issuedBy}</span> : null}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <a href={`/pass/${p.token}`} target="_blank" rel="noreferrer" className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                          View
                        </a>
                        {!p.revokedAt ? (
                          <>
                            <form action={resendPass.bind(null, p.id)}>
                              <button type="submit" className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                                {p.emailedAt ? "Resend" : "Send"}
                              </button>
                            </form>
                            <ConfirmForm action={revokePass.bind(null, p.id)} message={`Cancel pass ${p.code} for ${p.name}? It will show as cancelled at the gate.`}>
                              <button type="submit" className="rounded-lg border border-red-200 px-2.5 py-1 text-xs font-semibold text-red-600 hover:bg-red-50">
                                Cancel
                              </button>
                            </ConfirmForm>
                          </>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      {pages > 1 ? (
        <div className="mt-4 flex items-center justify-between text-sm">
          <span className="text-slate-500">
            Page {page} of {pages} · {total} passes
          </span>
          <div className="flex gap-2">
            {page > 1 ? <a href={link({ page: String(page - 1) })} className="rounded-lg border border-slate-300 px-3 py-1.5 font-semibold">Previous</a> : null}
            {page < pages ? <a href={link({ page: String(page + 1) })} className="rounded-lg border border-slate-300 px-3 py-1.5 font-semibold">Next</a> : null}
          </div>
        </div>
      ) : null}
    </>
  );
}
