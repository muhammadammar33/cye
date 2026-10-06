import { eq } from "drizzle-orm";
import { ArrowLeft, Mail, MessageCircle, Phone, Trash2 } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteSubmission, updateSubmission } from "@/app/admin/actions";
import { SubmissionForm } from "@/components/admin/SubmissionForm";
import { formatDate, PageHeader, StatusBadge } from "@/components/admin/StatusBadge";
import { ConfirmForm, SubmitButton } from "@/components/admin/ui";
import { TYPE_NAMES } from "@/lib/admin/labels";
import { requireDb, schema as s } from "@/lib/db";

const label = (key: string) => key.replace(/_/g, " ").replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^\w/, (c) => c.toUpperCase());

function Value({ value }: { value: unknown }) {
  if (typeof value === "string" && /^https?:\/\//.test(value)) {
    return (
      <a href={value} target="_blank" rel="noreferrer" className="break-all font-semibold text-cye-orange hover:underline">
        {value}
      </a>
    );
  }
  return <span className="whitespace-pre-wrap break-words">{String(value ?? "")}</span>;
}

export default async function SubmissionPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const [row] = await requireDb().select().from(s.submissions).where(eq(s.submissions.id, id)).limit(1);
  if (!row) notFound();

  // Gender is edited in the sidebar form (the column is the source of truth), so it is not repeated here.
  const { members, paymentSlip, gender: _gender, ...data } = row.data as Record<string, unknown> & { members?: Record<string, string>[]; paymentSlip?: string };
  void _gender;
  const phone = row.phone?.replace(/[^\d+]/g, "");
  const whatsapp = phone ? phone.replace(/^0/, "92").replace(/^\+/, "") : null;

  return (
    <>
      <Link href="/admin/submissions" className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 hover:text-cye-blue">
        <ArrowLeft className="h-4 w-4" aria-hidden />
        All submissions
      </Link>
      <PageHeader title={row.name} description={`${TYPE_NAMES[row.type]} #${row.id} · received ${formatDate(row.createdAt)}`} actions={<StatusBadge status={row.status} />} />

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap gap-2">
              <a href={`mailto:${row.email}`} className="inline-flex items-center gap-1.5 rounded-xl bg-cye-mist px-3 py-1.5 text-sm font-semibold text-cye-blue">
                <Mail className="h-4 w-4" aria-hidden /> {row.email}
              </a>
              {phone ? (
                <a href={`tel:${phone}`} className="inline-flex items-center gap-1.5 rounded-xl bg-cye-mist px-3 py-1.5 text-sm font-semibold text-cye-blue">
                  <Phone className="h-4 w-4" aria-hidden /> {row.phone}
                </a>
              ) : null}
              {whatsapp ? (
                <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-700">
                  <MessageCircle className="h-4 w-4" aria-hidden /> WhatsApp
                </a>
              ) : null}
            </div>
            <dl className="mt-5 grid gap-x-6 gap-y-4 sm:grid-cols-2">
              {Object.entries(data).map(([key, value]) => (
                <div key={key} className={typeof value === "string" && value.length > 80 ? "sm:col-span-2" : undefined}>
                  <dt className="text-xs font-bold uppercase tracking-wider text-slate-400">{label(key)}</dt>
                  <dd className="mt-0.5 text-sm text-slate-800">
                    <Value value={value} />
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          {paymentSlip ? (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-heading text-base font-bold text-cye-blue">Payment slip</h2>
                <a href={paymentSlip} target="_blank" rel="noreferrer" className="text-sm font-semibold text-cye-orange hover:underline">
                  Open full size
                </a>
              </div>
              <a href={paymentSlip} target="_blank" rel="noreferrer" className="mt-3 block">
                {/* eslint-disable-next-line @next/next/no-img-element -- uploaded slip from Vercel Blob */}
                <img src={paymentSlip} alt={`Payment slip from ${row.name}`} className="max-h-[420px] rounded-xl border border-slate-200 object-contain" />
              </a>
              <p className="mt-2 text-xs text-slate-500">Check the amount and reference, then set the status to Approved.</p>
            </section>
          ) : null}

          {members?.length ? (
            <section className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
              <h2 className="px-5 pt-4 font-heading text-base font-bold text-cye-blue">Team members ({members.length})</h2>
              <table className="mt-2 w-full min-w-[560px] text-left text-sm">
                <thead className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  <tr>
                    <th className="px-5 py-2">#</th>
                    <th className="px-5 py-2">Name</th>
                    <th className="px-5 py-2">Email</th>
                    <th className="px-5 py-2">Phone</th>
                    <th className="px-5 py-2">Institution</th>
                    <th className="px-5 py-2">Gender</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {members.map((m, i) => (
                    <tr key={i}>
                      <td className="px-5 py-2.5 text-slate-400">{i === 0 ? "Lead" : i + 1}</td>
                      <td className="px-5 py-2.5 font-semibold">{m.name}</td>
                      <td className="px-5 py-2.5">{m.email}</td>
                      <td className="px-5 py-2.5">{m.phone}</td>
                      <td className="px-5 py-2.5">{m.institution}</td>
                      <td className="px-5 py-2.5">{m.gender ?? ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          ) : null}
        </div>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <SubmissionForm status={row.status} notes={row.notes ?? ""} gender={row.gender ?? ""} showGender={row.type !== "sponsor" && row.type !== "contact"} action={updateSubmission.bind(null, row.id)} />
          </section>
          <section className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm">
            <ConfirmForm action={deleteSubmission.bind(null, row.id)} message={`Delete ${row.name}'s submission permanently?`}>
              <SubmitButton variant="danger" className="w-full">
                <Trash2 className="h-4 w-4" aria-hidden />
                Delete submission
              </SubmitButton>
            </ConfirmForm>
            <p className="mt-2 text-xs text-slate-400">Last updated {formatDate(row.updatedAt)}</p>
          </section>
        </aside>
      </div>
    </>
  );
}
