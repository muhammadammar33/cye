"use client";

import { renameTeam } from "@/app/admin/actions";
import { FormMessage, inputClass, SubmitButton, useFormAction } from "@/components/admin/ui";

/** Changes a competition team's name; its passes are relabelled with the new name. */
export function TeamNameForm({ id, current, solo }: { id: number; current: string; solo: boolean }) {
  const { state, onSubmit, pending } = useFormAction(renameTeam.bind(null, id));
  return (
    <form key={`${current}|${state?.ok ?? ""}`} onSubmit={onSubmit} className="space-y-3">
      <label className="block text-xs font-semibold text-slate-700">
        Team name
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start">
          <input name="team" defaultValue={current} required={!solo} maxLength={120} placeholder={solo ? "Solo entry" : "Team name"} className={inputClass} />
          <SubmitButton pending={pending} className="shrink-0 whitespace-nowrap sm:mt-1.5">
            Save name
          </SubmitButton>
        </div>
      </label>
      <FormMessage state={state} />
    </form>
  );
}
