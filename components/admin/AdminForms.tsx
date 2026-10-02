"use client";

import { changePassword, createAdmin } from "@/app/admin/actions";
import { FormMessage, inputClass, SubmitButton, useFormAction } from "@/components/admin/ui";

export function CreateAdminForm() {
  const { state, onSubmit, pending } = useFormAction(createAdmin);
  return (
    <form key={state?.ok} onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-3">
      <label className="block text-sm font-semibold text-slate-700">
        Name
        <input name="name" required className={inputClass} />
      </label>
      <label className="block text-sm font-semibold text-slate-700">
        Email
        <input name="email" type="email" required className={inputClass} />
      </label>
      <label className="block text-sm font-semibold text-slate-700">
        Temporary password
        <input name="password" type="password" required minLength={10} autoComplete="new-password" className={inputClass} />
      </label>
      <div className="space-y-3 sm:col-span-3">
        <FormMessage state={state} />
        <SubmitButton pending={pending}>Add admin</SubmitButton>
      </div>
    </form>
  );
}

export function PasswordForm() {
  const { state, onSubmit, pending } = useFormAction(changePassword);
  return (
    <form key={state?.ok} onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
      <label className="block text-sm font-semibold text-slate-700">
        Current password
        <input name="current" type="password" required autoComplete="current-password" className={inputClass} />
      </label>
      <label className="block text-sm font-semibold text-slate-700">
        New password
        <input name="next" type="password" required minLength={10} autoComplete="new-password" className={inputClass} />
      </label>
      <div className="space-y-3 sm:col-span-2">
        <FormMessage state={state} />
        <SubmitButton pending={pending}>Change password</SubmitButton>
      </div>
    </form>
  );
}
