"use client";

import { useRef } from "react";
import { createManualPass } from "@/app/admin/actions";
import { FormMessage, inputClass, SubmitButton, useFormAction } from "@/components/admin/ui";
import { MANUAL_PASS_CATEGORIES, PASS_CATEGORIES } from "@/lib/passCategories";

type Suggestion = { name: string; detail: string; category: "focal" | "team" };

/** Issue a pass to a focal person or event team member. Picking a known name fills in their pass type and role. */
export function ManualPassForm({ suggestions }: { suggestions: Suggestion[] }) {
  const { state, onSubmit, pending } = useFormAction(createManualPass);
  const detail = useRef<HTMLInputElement>(null);
  const category = useRef<HTMLSelectElement>(null);
  return (
    <form key={state?.ok} onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <label className="block text-sm font-semibold text-slate-700">
        Pass type
        <select ref={category} name="category" required defaultValue="focal" className={inputClass}>
          {MANUAL_PASS_CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {PASS_CATEGORIES[c].label}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm font-semibold text-slate-700">
        Name
        <input
          name="name"
          required
          list="focal-suggestions"
          className={inputClass}
          onChange={(e) => {
            const hit = suggestions.find((s) => s.name.toLowerCase() === e.target.value.trim().toLowerCase());
            if (hit && detail.current) detail.current.value = hit.detail;
            if (hit && category.current) category.current.value = hit.category;
          }}
        />
        <datalist id="focal-suggestions">
          {suggestions.map((s) => (
            <option key={`${s.name}-${s.detail}`} value={s.name}>
              {s.category === "team" ? `Event Team: ${s.detail}` : s.detail}
            </option>
          ))}
        </datalist>
      </label>
      <label className="block text-sm font-semibold text-slate-700">
        Email
        <input name="email" type="email" required className={inputClass} />
      </label>
      <label className="block text-sm font-semibold text-slate-700">
        Role / for
        <input ref={detail} name="detail" placeholder="e.g. Focal person, Robo War" className={inputClass} />
      </label>
      <label className="block text-sm font-semibold text-slate-700">
        Institution (optional)
        <input name="institution" className={inputClass} />
      </label>
      <div className="space-y-3 sm:col-span-2 lg:col-span-5">
        <FormMessage state={state} />
        <SubmitButton pending={pending}>Issue and email pass</SubmitButton>
      </div>
    </form>
  );
}
