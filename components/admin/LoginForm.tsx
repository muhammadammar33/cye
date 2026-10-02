"use client";

import { login } from "@/app/admin/actions";
import { FormMessage, inputClass, SubmitButton, useFormAction } from "@/components/admin/ui";

export function LoginForm({ next }: { next?: string }) {
  const { state, onSubmit, pending } = useFormAction(login);
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <input type="hidden" name="next" value={next ?? ""} />
      <label className="block text-sm font-semibold text-slate-700">
        Email
        <input name="email" type="email" required autoComplete="username" className={inputClass} />
      </label>
      <label className="block text-sm font-semibold text-slate-700">
        Password
        <input name="password" type="password" required autoComplete="current-password" className={inputClass} />
      </label>
      <FormMessage state={state} />
      <SubmitButton className="w-full" pending={pending}>Sign in</SubmitButton>
    </form>
  );
}
