import { asc } from "drizzle-orm";
import { Eye, EyeOff, Plus } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { toggleEntityActive } from "@/app/admin/actions";
import { PageHeader } from "@/components/admin/StatusBadge";
import { ENTITIES, isEntity } from "@/lib/admin/entities";
import { requireDb, schema as s } from "@/lib/db";

export default async function ContentList({ params, searchParams }: { params: Promise<{ entity: string }>; searchParams: Promise<{ saved?: string; deleted?: string }> }) {
  const { entity } = await params;
  if (!isEntity(entity)) notFound();
  const flash = await searchParams;
  const def = ENTITIES[entity];
  const table = def.table as typeof s.guests;
  const rows = (await requireDb().select().from(table).orderBy(asc(table.sortOrder), asc(table.id))) as unknown as (Record<string, unknown> & { id: number; active: boolean })[];

  return (
    <>
      <PageHeader
        title={def.label}
        description={`${rows.length} item${rows.length === 1 ? "" : "s"}. Changes appear on the website within a few seconds.`}
        actions={
          <Link href={`/admin/content/${entity}/new`} className="inline-flex items-center gap-2 rounded-xl bg-grad-orange px-4 py-2 text-sm font-semibold text-white hover:brightness-110">
            <Plus className="h-4 w-4" aria-hidden />
            Add {def.singular}
          </Link>
        }
      />
      {flash.saved ? <p className="mb-4 rounded-xl bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">Saved.</p> : null}
      {flash.deleted ? <p className="mb-4 rounded-xl bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700">Deleted.</p> : null}

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[560px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-3">#</th>
              {def.columns.map((col) => (
                <th key={col.name} className="px-4 py-3">
                  {col.label}
                </th>
              ))}
              <th className="px-4 py-3">Visible</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={row.id} className={row.active ? "hover:bg-slate-50" : "bg-slate-50 text-slate-400"}>
                <td className="px-4 py-3 text-xs text-slate-400">{String(row.sortOrder)}</td>
                {def.columns.map((col) => {
                  const value = row[col.name];
                  if (col.name === "photo") {
                    return (
                      <td key={col.name} className="w-14 px-4 py-2">
                        {value ? (
                          // eslint-disable-next-line @next/next/no-img-element -- admin thumbnail of a stored path or blob URL
                          <img src={String(value)} alt="" className="h-10 w-10 rounded-lg object-cover" />
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-slate-100" />
                        )}
                      </td>
                    );
                  }
                  return (
                    <td key={col.name} className="px-4 py-3">
                      {typeof value === "boolean" ? (value ? "Yes" : "") : String(value ?? "")}
                    </td>
                  );
                })}
                <td className="px-4 py-3">
                  <form action={toggleEntityActive.bind(null, entity, row.id, !row.active)}>
                    <button type="submit" title={row.active ? "Hide from website" : "Show on website"} className="rounded-lg p-1.5 hover:bg-slate-200">
                      {row.active ? <Eye className="h-4 w-4 text-emerald-600" aria-label="Visible" /> : <EyeOff className="h-4 w-4" aria-label="Hidden" />}
                    </button>
                  </form>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/content/${entity}/${row.id}`} className="font-semibold text-cye-orange hover:underline">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
