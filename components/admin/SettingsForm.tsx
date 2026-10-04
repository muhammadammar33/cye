"use client";

import { saveSettings } from "@/app/admin/actions";
import { FormMessage, inputClass, SubmitButton, useFormAction } from "@/components/admin/ui";
import type { SiteSettings } from "@/lib/defaults";

const REG_LABELS: Record<string, string> = {
  competitions: "Competition registration",
  projects: "Project submissions",
  startups: "Startup submissions",
  visitors: "Visitor passes",
  volunteers: "Volunteer applications",
  ambassadors: "Campus Ambassador applications",
};

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const { state, onSubmit, pending } = useFormAction(saveSettings);
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-heading text-base font-bold text-cye-blue">Registrations</h2>
        <p className="mt-1 text-sm text-slate-500">Closed forms show a &quot;registration closed&quot; notice on the website.</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {Object.entries(settings.registration_open).map(([key, open]) => (
            <label key={key} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">
              {REG_LABELS[key] ?? key}
              <input type="checkbox" name={`registration_open.${key}`} defaultChecked={open} className="h-5 w-5 accent-cye-orange" />
            </label>
          ))}
        </div>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-heading text-base font-bold text-cye-blue">Competition payments</h2>
        <p className="mt-1 text-sm text-slate-500">
          Shown on the Competitions page next to the registration form, and in the competitor&apos;s confirmation email.
        </p>
        <label className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">
          Require a payment slip with each registration
          <input type="checkbox" name="payment.slipRequired" defaultChecked={settings.payment.slipRequired} className="h-5 w-5 accent-cye-orange" />
        </label>
        <label className="mt-4 block text-sm font-semibold text-slate-700">
          Payment instructions
          <textarea name="payment.instructions" rows={3} defaultValue={settings.payment.instructions} className={inputClass} />
        </label>
        <p className="mt-4 text-sm font-semibold text-slate-700">Accounts</p>
        <p className="text-xs text-slate-500">Leave a row empty to hide it. e.g. Meezan Bank / JazzCash / Easypaisa.</p>
        <div className="mt-2 space-y-3">
          {Array.from({ length: 4 }, (_, i) => {
            const account = settings.payment.accounts[i];
            return (
              <div key={i} className="grid gap-3 rounded-xl border border-slate-200 p-3 sm:grid-cols-3">
                <label className="block text-xs font-semibold text-slate-600">
                  Bank / method
                  <input name={`payment.accounts.${i}.method`} defaultValue={account?.method ?? ""} placeholder="Meezan Bank" className={inputClass} />
                </label>
                <label className="block text-xs font-semibold text-slate-600">
                  Account title
                  <input name={`payment.accounts.${i}.title`} defaultValue={account?.title ?? ""} placeholder="Capital Youth Expo" className={inputClass} />
                </label>
                <label className="block text-xs font-semibold text-slate-600">
                  Account number / IBAN
                  <input name={`payment.accounts.${i}.number`} defaultValue={account?.number ?? ""} placeholder="PK00 MEZN 0000 0000 0000 0000" className={inputClass} />
                </label>
              </div>
            );
          })}
        </div>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-heading text-base font-bold text-cye-blue">Notification inboxes</h2>
        <p className="mt-1 text-sm text-slate-500">New submissions are emailed to these addresses.</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {Object.entries(settings.inboxes).map(([key, value]) => (
            <label key={key} className="block text-sm font-semibold capitalize text-slate-700">
              {key}
              <input name={`inboxes.${key}`} type="email" required defaultValue={value} className={inputClass} />
            </label>
          ))}
        </div>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-heading text-base font-bold text-cye-blue">Social links</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {Object.entries(settings.social_links).map(([key, value]) => (
            <label key={key} className="block text-sm font-semibold capitalize text-slate-700">
              {key}
              <input name={`social_links.${key}`} type="url" defaultValue={value} placeholder="https://" className={inputClass} />
            </label>
          ))}
        </div>
      </section>
      <div className="space-y-3">
        <FormMessage state={state} />
        <SubmitButton pending={pending}>Save settings</SubmitButton>
      </div>
    </form>
  );
}
