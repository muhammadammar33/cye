"use client";

import { savePreEvent } from "@/app/admin/actions";
import { FormMessage, inputClass, SubmitButton, useFormAction } from "@/components/admin/ui";
import { PRE_EVENT_LABELS, PRE_EVENT_RESULTS } from "@/lib/admin/labels";

/** Team result at the campus pre-event, plus individual members who did not attend. */
export function PreEventForm({ id, result, absent, members }: { id: number; result: string | null; absent: string[]; members: { name: string; email: string }[] }) {
  const { state, onSubmit, pending } = useFormAction(savePreEvent.bind(null, id));
  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <label className="block text-sm font-semibold text-slate-700">
        Team result
        <select name="result" defaultValue={result ?? ""} className={inputClass}>
          <option value="">Pending</option>
          {PRE_EVENT_RESULTS.map((r) => (
            <option key={r} value={r}>
              {PRE_EVENT_LABELS[r]}
            </option>
          ))}
        </select>
      </label>
      {members.length > 1 ? (
        <fieldset>
          <legend className="text-sm font-semibold text-slate-700">Members absent at the pre-event</legend>
          <p className="text-xs text-slate-500">They go to CYE as visitors even if the team qualified.</p>
          <div className="mt-2 space-y-1.5">
            {members.map((m) => (
              <label key={m.email} className="flex items-start gap-2 text-sm text-slate-700">
                <input type="checkbox" name="absent" value={m.email.toLowerCase()} defaultChecked={absent.includes(m.email.toLowerCase())} className="mt-0.5 h-4 w-4 accent-cye-orange" />
                <span>
                  {m.name}
                  <span className="block text-xs text-slate-500">{m.email}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      ) : null}
      <FormMessage state={state} />
      <SubmitButton className="w-full" pending={pending}>
        Save pre-event result
      </SubmitButton>
      <p className="text-xs text-slate-500">Emails go out from Admin › Pre-events › Send results, after you check the preview.</p>
    </form>
  );
}
