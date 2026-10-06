"use client";

import type { ActionState } from "@/app/admin/actions";
import { FormMessage, inputClass, SubmitButton, useFormAction } from "@/components/admin/ui";
import { STATUS_LABELS } from "@/lib/admin/labels";
import { SUBMISSION_STATUSES } from "@/lib/db/schema";
import { GENDERS } from "@/data/event";

export function SubmissionForm({ status, notes, gender, showGender, action }: { status: string; notes: string; gender: string; showGender: boolean; action: (state: ActionState, form: FormData) => Promise<ActionState> }) {
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
      {showGender ? (
        <label className="block text-sm font-semibold text-slate-700">
          Gender
          <select name="gender" defaultValue={gender} className={inputClass}>
            <option value="">Not set</option>
            {GENDERS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <input type="hidden" name="gender" value={gender} />
      )}
      <label className="block text-sm font-semibold text-slate-700">
        Internal notes
        <textarea name="notes" rows={6} defaultValue={notes} placeholder="Calls made, payment received, follow-ups..." className={inputClass} />
      </label>
      <FormMessage state={state} />
      <SubmitButton className="w-full" pending={pending}>Save</SubmitButton>
    </form>
  );
}
