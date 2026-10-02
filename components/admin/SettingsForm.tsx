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
