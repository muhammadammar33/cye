"use client";

import { useState, type FormEvent } from "react";
import { changeCompetition } from "@/app/admin/actions";
import { FormMessage, inputClass, SubmitButton, useFormAction } from "@/components/admin/ui";
import { choiceFor } from "@/lib/competitionOptions";

type Option = { name: string; fee: string; teamMin: number; teamMax: number };

const sizeLabel = (min: number, max: number) => (max === 1 ? "solo" : min === max ? `${min} members` : `${min}–${max} members`);

/** Moves a registration to another competition (e.g. a team that applied to the wrong one). */
export function ChangeCompetitionForm({ id, current, size, competitions }: { id: number; current: string; size: number; competitions: Option[] }) {
  const { state, onSubmit, pending } = useFormAction(changeCompetition.bind(null, id));
  const [target, setTarget] = useState("");
  const choice = target ? choiceFor(target) : null;
  const chosen = competitions.find((c) => c.name === target);

  function confirmFirst(event: FormEvent<HTMLFormElement>) {
    if (!window.confirm(`Move this team from ${current} to ${target}? The fee changes to ${target}'s fee (coupon kept) and the pre-event result is cleared.`)) {
      event.preventDefault();
      return;
    }
    onSubmit(event);
  }

  return (
    <form key={state?.ok} onSubmit={confirmFirst} className="space-y-3">
      <label className="block text-xs font-semibold text-slate-700">
        Move to
        <select name="competition" required value={target} onChange={(e) => setTarget(e.target.value)} className={inputClass}>
          <option value="" disabled>
            Choose a competition
          </option>
          {competitions
            .filter((c) => c.name !== current)
            .map((c) => {
              const fits = size >= c.teamMin && size <= c.teamMax;
              return (
                <option key={c.name} value={c.name} disabled={!fits}>
                  {c.name} | {c.fee} | {sizeLabel(c.teamMin, c.teamMax)}
                  {fits ? "" : ` (team of ${size} does not fit)`}
                </option>
              );
            })}
        </select>
      </label>
      {choice ? (
        <label className="block text-xs font-semibold text-slate-700">
          {choice.label}
          <select key={choice.field} name="choice" required defaultValue="" className={inputClass}>
            <option value="" disabled>
              {choice.prompt}
            </option>
            {choice.options.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      {chosen ? <p className="text-xs text-slate-500">New fee: {chosen.fee} (10% off if the team used a coupon).</p> : null}
      <FormMessage state={state} />
      <SubmitButton pending={pending}>Change competition</SubmitButton>
    </form>
  );
}
