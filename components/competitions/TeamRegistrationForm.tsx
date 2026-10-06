"use client";

import { FormEvent, useState } from "react";
import { ImageUp, Loader2, Send } from "lucide-react";
import { EDUCATION_LEVELS, GENDERS } from "@/data/event";
import { teamLabel } from "@/components/competitions/CompetitionCatalog";
import { Field, fieldClass } from "@/components/ui/Field";
import { FormError, FormSuccess, Honeypot, type FormState } from "@/components/ui/FormStatus";
import type { Competition } from "@/lib/content";
import { compressImage } from "@/lib/compressImage";
import { CONSENT_FIELDS } from "@/lib/consent";
import { submitForm } from "@/lib/submit";

/** How the payment slip field behaves: hidden, optional or required. */
export type SlipMode = "off" | "optional" | "required";

const MEMBER_ORDINALS = ["Team lead", "2nd member", "3rd member", "4th member"];

export function TeamRegistrationForm({
  competitions,
  inbox,
  selected,
  onSelect,
  slipMode = "off",
}: {
  competitions: Competition[];
  inbox: string;
  selected: string;
  onSelect: (name: string) => void;
  slipMode?: SlipMode;
}) {
  const [teamSize, setTeamSize] = useState(1);
  const [slipPreview, setSlipPreview] = useState<string | null>(null);
  const [state, setState] = useState<FormState>({ status: "idle" });
  const competition = competitions.find((item) => item.name === selected);
  const sizes = competition
    ? Array.from({ length: competition.teamMax - competition.teamMin + 1 }, (_, i) => competition.teamMin + i)
    : [1];
  const size = sizes.includes(teamSize) ? teamSize : sizes[0];

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const get = (key: string) => String(form.get(key) ?? "");
    const data = {
      competition: selected,
      size,
      team: get("team"),
      level: get("level"),
      idNumber: get("idNumber"),
      members: Array.from({ length: size }, (_, i) => ({
        name: get(`member${i}_name`),
        email: get(`member${i}_email`),
        phone: get(`member${i}_phone`),
        institution: get(`member${i}_institution`),
        gender: get(`member${i}_gender`),
      })),
      ...Object.fromEntries(CONSENT_FIELDS.filter((field) => form.get(field.name)).map((field) => [field.name, "on"])),
    };
    const picked = form.get("slip");
    const slipFile = picked instanceof File && picked.size > 0 ? picked : undefined;
    if (slipMode === "required" && !slipFile) {
      setState({ status: "error", error: "Please upload a photo or screenshot of your payment slip." });
      return;
    }
    setState({ status: "sending" });
    const slip = slipFile ? await compressImage(slipFile) : undefined;
    const result = await submitForm("competition", data, get("company_website"), slip);
    setState(result.ok ? { status: "sent" } : { status: "error", error: `${result.error} If this keeps happening, email ${inbox}.` });
  }

  if (state.status === "sent") {
    return (
      <FormSuccess title="Registration received!">
        Thank you for registering for {selected}. We have emailed a confirmation to your team lead.{" "}
        {slipMode === "off"
          ? "Fee payment details follow once your registration is confirmed."
          : "Our team will verify your payment and confirm your registration."}
      </FormSuccess>
    );
  }

  return (
    <form onSubmit={onSubmit} className="relative grid gap-4 sm:grid-cols-2">
      <Honeypot />
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
          {competitions.map((item) => (
            <option key={item.name} value={item.name}>
              {item.name} | {item.fee} | {teamLabel(item.teamMin, item.teamMax)}
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
          <Field label="Gender">
            <select name={`member${i}_gender`} required defaultValue="" className={fieldClass}>
              <option value="" disabled>
                Select gender
              </option>
              {GENDERS.map((gender) => (
                <option key={gender} value={gender}>
                  {gender}
                </option>
              ))}
            </select>
          </Field>
        </fieldset>
      ))}

      {slipMode !== "off" ? (
        <label className="block rounded-2xl border border-dashed border-cye-blue/25 bg-cye-mist p-4 text-sm font-semibold text-cye-blue sm:col-span-2">
          <span className="flex items-center gap-2">
            <ImageUp className="h-4 w-4 text-cye-orange" aria-hidden />
            Payment slip {slipMode === "required" ? "" : "(optional)"}
          </span>
          <span className="mt-1 block text-xs font-normal text-cye-ink/60">
            Upload a photo or screenshot of your bank / JazzCash / Easypaisa payment (JPG or PNG).
          </span>
          <input
            type="file"
            name="slip"
            accept="image/*"
            required={slipMode === "required"}
            onChange={(event) => {
              const file = event.target.files?.[0];
              setSlipPreview(file ? URL.createObjectURL(file) : null);
            }}
            className="mt-3 block w-full text-sm font-normal text-cye-ink file:mr-3 file:rounded-full file:border-0 file:bg-cye-orange file:px-4 file:py-2 file:font-semibold file:text-white"
          />
          {slipPreview ? (
            // eslint-disable-next-line @next/next/no-img-element -- local preview of the picked file
            <img src={slipPreview} alt="Payment slip preview" className="mt-3 max-h-48 rounded-xl border border-white object-contain shadow-card" />
          ) : null}
        </label>
      ) : null}

      {CONSENT_FIELDS.map((field) => (
        <label key={field.name} className="flex items-start gap-3 text-sm text-cye-ink/75 sm:col-span-2">
          <input name={field.name} type="checkbox" required className="mt-0.5 h-4 w-4 shrink-0 accent-cye-orange" />
          {field.label}
        </label>
      ))}

      <FormError state={state} />
      <button
        type="submit"
        disabled={state.status === "sending" || !selected}
        className="inline-flex items-center justify-center gap-2 rounded-full bg-grad-orange px-6 py-3 font-heading text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-cye-orange/25 transition-all hover:-translate-y-0.5 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70 sm:col-span-2"
      >
        {state.status === "sending" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Send className="h-4 w-4" aria-hidden />}
        {state.status === "sending" ? "Submitting..." : "Submit registration"}
      </button>
    </form>
  );
}
