"use client";

import { addTeamMember } from "@/app/admin/actions";
import { FormMessage, inputClass, SubmitButton, useFormAction } from "@/components/admin/ui";
import { GENDERS } from "@/data/event";

/** Add a member to a registered team, within the competition's team limit. */
export function AddMemberForm({ id }: { id: number }) {
  const { state, onSubmit, pending } = useFormAction(addTeamMember.bind(null, id));
  return (
    <form key={state?.ok} onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <label className="block text-xs font-semibold text-slate-700">
        Name
        <input name="name" required className={inputClass} />
      </label>
      <label className="block text-xs font-semibold text-slate-700">
        Email
        <input name="email" type="email" required className={inputClass} />
      </label>
      <label className="block text-xs font-semibold text-slate-700">
        Phone
        <input name="phone" type="tel" required className={inputClass} />
      </label>
      <label className="block text-xs font-semibold text-slate-700">
        Institution
        <input name="institution" required className={inputClass} />
      </label>
      <label className="block text-xs font-semibold text-slate-700">
        Gender
        <select name="gender" required defaultValue="" className={inputClass}>
          <option value="" disabled>
            Select
          </option>
          {GENDERS.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </label>
      <div className="space-y-2 sm:col-span-2 lg:col-span-5">
        <FormMessage state={state} />
        <SubmitButton pending={pending}>Add member</SubmitButton>
      </div>
    </form>
  );
}
