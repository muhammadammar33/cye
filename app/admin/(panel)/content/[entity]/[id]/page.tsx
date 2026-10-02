import { eq } from "drizzle-orm";
import { ArrowLeft, Trash2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteEntity, saveEntity } from "@/app/admin/actions";
import { EntityForm } from "@/components/admin/EntityForm";
import { PageHeader } from "@/components/admin/StatusBadge";
import { ConfirmForm, SubmitButton } from "@/components/admin/ui";
import { ENTITIES, isEntity } from "@/lib/admin/entities";
import { requireDb, schema as s } from "@/lib/db";

export default async function ContentEdit({ params }: { params: Promise<{ entity: string; id: string }> }) {
  const { entity, id: rawId } = await params;
  if (!isEntity(entity)) notFound();
  const def = ENTITIES[entity];
  const isNew = rawId === "new";
  const id = isNew ? null : Number(rawId);
  if (!isNew && !Number.isInteger(id)) notFound();

  let values: Record<string, unknown> = { active: true, sortOrder: 0 };
  if (id) {
    const table = def.table as typeof s.guests;
    const [row] = await requireDb().select().from(table).where(eq(table.id, id)).limit(1);
    if (!row) notFound();
    values = row as Record<string, unknown>;
  }
  const name = String(values.name ?? values.label ?? "");

  return (
    <>
      <Link href={`/admin/content/${entity}`} className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-cye-blue">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        {def.label}
      </Link>
      <PageHeader title={isNew ? `Add ${def.singular}` : `Edit ${name}`} />
      <div className="max-w-3xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <EntityForm fields={def.fields} values={values} action={saveEntity.bind(null, entity, id)} submitLabel={isNew ? `Add ${def.singular}` : "Save changes"} />
      </div>
      {id ? (
        <div className="mt-6 max-w-3xl">
          <ConfirmForm action={deleteEntity.bind(null, entity, id)} message={`Delete ${name} permanently? Use "Show on the website" to hide it instead.`}>
            <SubmitButton variant="danger">
              <Trash2 className="h-4 w-4" aria-hidden />
              Delete {def.singular}
            </SubmitButton>
          </ConfirmForm>
        </div>
      ) : null}
    </>
  );
}
