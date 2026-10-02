"use client";

import type { ActionState } from "@/app/admin/actions";
import { FormMessage, inputClass, SubmitButton, useFormAction } from "@/components/admin/ui";
import { STATUS_LABELS } from "@/lib/admin/labels";
import { SUBMISSION_STATUSES } from "@/lib/db/schema";

export function SubmissionForm({ status, notes, action }: { status: string; notes: string; action: (state: ActionState, form: FormData) => Promise<ActionState> }) {
  const { state, onSubmit, pending } = useFormAction(action);
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block text-sm font-semibold text-slate-700">
        Status
        <select name="status" defaultValue={status} className={inputClass}>
          {SUBMISSION_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm font-semibold text-slate-700">
        Internal notes
        <textarea name="notes" rows={6} defaultValue={notes} placeholder="Calls made, payment received, follow-ups..." className={inputClass} />
      </label>
      <FormMessage state={state} />
      <SubmitButton className="w-full" pending={pending}>Save</SubmitButton>
    </form>
  );
}
