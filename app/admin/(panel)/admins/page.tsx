import { asc } from "drizzle-orm";
import { CreateAdminForm, PasswordForm } from "@/components/admin/AdminForms";
import { formatDate, PageHeader } from "@/components/admin/StatusBadge";
import { ConfirmForm, SubmitButton } from "@/components/admin/ui";
import { deleteAdmin } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/auth";
import { requireDb, schema as s } from "@/lib/db";

export default async function AdminsPage() {
  const me = await requireAdmin();
  const admins = await requireDb().select().from(s.admins).orderBy(asc(s.admins.createdAt));

  return (
    <>
      <PageHeader title="Admins" description="People who can sign in to this dashboard." />
      <div className="max-w-4xl space-y-6">
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Last sign-in</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {admins.map((admin) => (
                <tr key={admin.id}>
                  <td className="px-4 py-3 font-semibold">{admin.name}</td>
                  <td className="px-4 py-3">{admin.email}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{admin.lastLoginAt ? formatDate(admin.lastLoginAt) : "Never"}</td>
                  <td className="px-4 py-3 text-right">
                    {admin.id === me.id ? (
                      <span className="text-xs text-slate-400">You</span>
                    ) : admins.length > 1 ? (
                      <ConfirmForm action={deleteAdmin.bind(null, admin.id)} message={`Remove ${admin.email}'s access?`}>
                        <SubmitButton variant="ghost">Remove</SubmitButton>
                      </ConfirmForm>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-heading text-base font-bold text-cye-blue">Add an admin</h2>
          <CreateAdminForm />
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-heading text-base font-bold text-cye-blue">Change your password</h2>
          <PasswordForm />
        </section>
      </div>
    </>
  );
}
