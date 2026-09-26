"use client";

import { FormEvent, useState } from "react";
import { Send } from "lucide-react";
import { COMPETITIONS, EDUCATION_LEVELS, EMAILS } from "@/data/event";
import { teamLabel } from "@/components/competitions/CompetitionCatalog";
import { Field, fieldClass } from "@/components/ui/Field";
import { CONSENT_FIELDS } from "@/lib/consent";
import { openMailto } from "@/lib/mailto";

const MEMBER_ORDINALS = ["Team lead", "2nd member", "3rd member", "4th member"];

export function TeamRegistrationForm({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (name: string) => void;
}) {
  const [teamSize, setTeamSize] = useState(1);
  const [status, setStatus] = useState<"idle" | "sent">("idle");
  const competition = COMPETITIONS.find((item) => item.name === selected);
  const sizes = competition
    ? Array.from({ length: competition.teamMax - competition.teamMin + 1 }, (_, i) => competition.teamMin + i)
    : [1];
  const size = sizes.includes(teamSize) ? teamSize : sizes[0];

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const get = (key: string) => String(data.get(key) ?? "");
    const lines = [
      `Competition: ${selected}`,
      `Fee: ${competition?.fee ?? ""}`,
      `Team name: ${get("team")}`,
      `Team size: ${size}`,
      `Education level: ${get("level")}`,
      `CNIC / Student ID / B-Form (lead): ${get("idNumber")}`,
      "",
      ...Array.from({ length: size }, (_, i) => [
        `${MEMBER_ORDINALS[i]}:`,
        `  Name: ${get(`member${i}_name`)}`,
        `  Email: ${get(`member${i}_email`)}`,
        `  Phone: ${get(`member${i}_phone`)}`,
        `  Institution: ${get(`member${i}_institution`)}`,
      ]).flat(),
      "",
      ...CONSENT_FIELDS.map((field) => `${field.label} Yes`),
    ];

    // TODO: POST to a backend endpoint when one is available.
    openMailto(EMAILS.competitions, `CYE 2026 competition registration — ${selected} — ${get("member0_name")}`, lines);
    setStatus("sent");
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
      <Field label="Competition" className="sm:col-span-2">
        <select
          name="competition"
          required
          value={selected}
          onChange={(event) => onSelect(event.target.value)}
          className={fieldClass}
        >
          <option value="" disabled>
            Select a competition
          </option>
          {COMPETITIONS.map((item) => (
            <option key={item.name} value={item.name}>
              {item.name} — {item.fee} — {teamLabel(item.teamMin, item.teamMax)}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Team size">
        <select
          name="size"
          value={size}
          onChange={(event) => setTeamSize(Number(event.target.value))}
          disabled={sizes.length === 1}
          className={fieldClass}
        >
          {sizes.map((value) => (
            <option key={value} value={value}>
              {value === 1 ? "Individual" : `${value} members`}
            </option>
          ))}
        </select>
      </Field>
      <Field label={size > 1 ? "Team name" : "Team name (optional)"}>
        <input name="team" required={size > 1} className={fieldClass} placeholder={size > 1 ? "" : "Solo entry"} />
      </Field>
      <Field label="Current level / grade">
        <select name="level" required defaultValue="" className={fieldClass}>
          <option value="" disabled>
            Select your level
          </option>
          {EDUCATION_LEVELS.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
      </Field>
      <Field label="CNIC / Student ID / B-Form">
        <input name="idNumber" required className={fieldClass} placeholder="Team lead's ID" />
      </Field>

      {Array.from({ length: size }, (_, i) => (
        <fieldset key={i} className="grid gap-4 rounded-2xl border border-cye-blue/10 p-4 sm:col-span-2 sm:grid-cols-2">
          <legend className="px-2 font-heading text-xs font-bold uppercase tracking-wider text-cye-orange">
            {MEMBER_ORDINALS[i]}
          </legend>
          <Field label="Full name">
            <input name={`member${i}_name`} required autoComplete={i === 0 ? "name" : "off"} className={fieldClass} />
          </Field>
          <Field label="Email">
            <input
              name={`member${i}_email`}
              type="email"
              required
              autoComplete={i === 0 ? "email" : "off"}
              className={fieldClass}
            />
          </Field>
          <Field label="Phone">
            <input name={`member${i}_phone`} type="tel" required autoComplete={i === 0 ? "tel" : "off"} className={fieldClass} />
          </Field>
          <Field label="Institution">
            <input
              name={`member${i}_institution`}
              required
              autoComplete={i === 0 ? "organization" : "off"}
              className={fieldClass}
            />
          </Field>
        </fieldset>
      ))}

      {CONSENT_FIELDS.map((field) => (
        <label key={field.name} className="flex items-start gap-3 text-sm text-cye-ink/75 sm:col-span-2">
          <input name={field.name} type="checkbox" required className="mt-0.5 h-4 w-4 shrink-0 accent-cye-orange" />
          {field.label}
        </label>
      ))}

      <button
        type="submit"
        className="inline-flex items-center justify-center gap-2 rounded-full bg-cye-orange px-6 py-3 font-heading text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-cye-orange/25 transition-all hover:-translate-y-0.5 hover:bg-cye-orange-lt sm:col-span-2"
      >
        <Send className="h-4 w-4" aria-hidden />
        Submit registration
      </button>
      {status === "sent" ? (
        <p className="text-center text-sm text-cye-blue sm:col-span-2" role="status">
          Opening your email client — if nothing appears, write to {EMAILS.competitions}.
        </p>
      ) : null}
    </form>
  );
}
