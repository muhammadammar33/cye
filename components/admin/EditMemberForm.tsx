"use client";

import { Pencil, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { editTeamMember } from "@/app/admin/actions";
import { FormMessage, inputClass, SubmitButton, useFormAction } from "@/components/admin/ui";
import { GENDERS } from "@/data/event";

type Member = { name: string; email: string; phone?: string; institution?: string; gender?: string };

/** Edit button for a team member row; the form opens in a dialog. */
export function EditMemberForm({ id, index, member, lead }: { id: number; index: number; member: Member; lead: boolean }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const { state, onSubmit, pending } = useFormAction(editTeamMember.bind(null, id, index, member.email));

  // Close shortly after a successful save so the message can be read.
  useEffect(() => {
    if (!state?.ok) return;
    const t = setTimeout(() => dialog.current?.close(), 1400);
    return () => clearTimeout(t);
  }, [state]);

  return (
    <>
      <button
        type="button"
        onClick={() => dialog.current?.showModal()}
        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-cye-blue hover:bg-slate-50"
      >
        <Pencil className="h-3 w-3" aria-hidden />
        Edit
      </button>
      <dialog
        ref={dialog}
        className="m-auto w-[min(36rem,calc(100vw-2rem))] rounded-2xl p-0 text-left shadow-xl backdrop:bg-slate-900/40"
        onClick={(e) => e.target === dialog.current && dialog.current?.close()}
      >
        <form key={`${member.email}|${state?.ok ?? ""}`} onSubmit={onSubmit} className="space-y-3 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-heading text-base font-bold text-cye-blue">Edit {lead ? "team lead" : "member"}</h3>
              <p className="mt-0.5 text-xs text-slate-500">
                {lead ? "The lead's details are also the registration's contact details. " : ""}
                A pass keeps its link; if the email changes, the pass is sent to the new address.
              </p>
            </div>
            <button type="button" onClick={() => dialog.current?.close()} aria-label="Close" className="rounded-lg p-1 text-slate-400 hover:bg-slate-100">
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-xs font-semibold text-slate-700">
              Name
              <input name="name" required defaultValue={member.name} className={inputClass} />
            </label>
            <label className="block text-xs font-semibold text-slate-700">
              Email
              <input name="email" type="email" required defaultValue={member.email} className={inputClass} />
            </label>
            <label className="block text-xs font-semibold text-slate-700">
              Phone
              <input name="phone" type="tel" required defaultValue={member.phone ?? ""} className={inputClass} />
            </label>
            <label className="block text-xs font-semibold text-slate-700">
              Institution
              <input name="institution" required defaultValue={member.institution ?? ""} className={inputClass} />
            </label>
            <label className="block text-xs font-semibold text-slate-700">
              Gender
              <select name="gender" required defaultValue={member.gender ?? ""} className={inputClass}>
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
          </div>
          <FormMessage state={state} />
          <SubmitButton pending={pending}>Save changes</SubmitButton>
        </form>
      </dialog>
    </>
  );
}
