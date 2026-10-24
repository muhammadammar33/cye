"use client";

import { CheckCircle2, FileUp, Loader2, Send, XCircle } from "lucide-react";
import { FormEvent, useState } from "react";
import { GENDERS, TALENT_LEVELS } from "@/data/event";
import { Field, fieldClass } from "@/components/ui/Field";
import { FormError, FormSuccess, Honeypot, type FormState } from "@/components/ui/FormStatus";
import { compressImage } from "@/lib/compressImage";
import { CONSENT_FIELDS } from "@/lib/consent";
import { checkResult, ELIGIBLE_PERCENT, GPA_SCALES, minGpa, type ResultType } from "@/lib/eligibility";
import { submitForm } from "@/lib/submit";
import { cn } from "@/lib/cn";

const MAX_BYTES = 4 * 1024 * 1024;

export function TalentForm({ inbox }: { inbox: string }) {
  const [resultType, setResultType] = useState<ResultType>("Marks");
  const [obtained, setObtained] = useState("");
  const [total, setTotal] = useState("");
  const [gpa, setGpa] = useState("");
  const [scale, setScale] = useState("4");
  const [file, setFile] = useState<File | null>(null);
  const [state, setState] = useState<FormState>({ status: "idle" });

  const started = resultType === "Marks" ? obtained !== "" && total !== "" : gpa !== "";
  const check = checkResult({ resultType, obtained, total, gpa, scale });
  const eligible = check.ok && check.eligible;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!eligible) return;
    const form = new FormData(event.currentTarget);
    const get = (key: string) => String(form.get(key) ?? "");
    if (!file) return setState({ status: "error", error: "Please upload your result card." });
    if (file.type !== "application/pdf" && !file.type.startsWith("image/")) return setState({ status: "error", error: "The result card must be an image (JPG or PNG) or a PDF." });
    const upload = file.type === "application/pdf" ? file : await compressImage(file);
    if (upload.size > MAX_BYTES) return setState({ status: "error", error: "The result card must be 4 MB or smaller. Try a screenshot or a smaller PDF." });

    const data = {
      name: get("name"),
      email: get("email"),
      phone: get("phone"),
      gender: get("gender"),
      institution: get("institution"),
      city: get("city"),
      level: get("level"),
      resultType,
      ...(resultType === "Marks" ? { obtained, total } : { gpa, scale }),
      ...Object.fromEntries(CONSENT_FIELDS.filter((f) => form.get(f.name)).map((f) => [f.name, "on"])),
    };
    setState({ status: "sending" });
    const result = await submitForm("talent", data, get("company_website"), upload);
    setState(result.ok ? { status: "sent" } : { status: "error", error: `${result.error} If this keeps happening, email ${inbox}.` });
  }

  if (state.status === "sent") {
    return (
      <FormSuccess title="Application received!">
        Thank you for applying for Talent Tribute. We have emailed you a confirmation. Our team will verify your result card and contact you.
      </FormSuccess>
    );
  }

  return (
    <form onSubmit={onSubmit} className="relative grid gap-4 sm:grid-cols-2">
      <Honeypot />
      <Field label="Full name">
        <input name="name" required autoComplete="name" className={fieldClass} />
      </Field>
      <Field label="Email">
        <input name="email" type="email" required autoComplete="email" className={fieldClass} />
      </Field>
      <Field label="Phone (WhatsApp preferred)">
        <input name="phone" type="tel" required autoComplete="tel" className={fieldClass} />
      </Field>
      <Field label="Gender">
        <select name="gender" required defaultValue="" className={fieldClass}>
          <option value="" disabled>
            Select gender
          </option>
          {GENDERS.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </Field>
      <Field label="School / college / university">
        <input name="institution" required autoComplete="organization" className={fieldClass} />
      </Field>
      <Field label="City">
        <input name="city" required autoComplete="address-level2" className={fieldClass} />
      </Field>
      <Field label="Class / level of this result" className="sm:col-span-2">
        <select name="level" required defaultValue="" className={fieldClass}>
          <option value="" disabled>
            Select your class or level
          </option>
          {TALENT_LEVELS.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </Field>

      <fieldset className="grid gap-4 rounded-2xl border border-cye-blue/10 p-4 sm:col-span-2 sm:grid-cols-2">
        <legend className="px-2 font-heading text-xs font-bold uppercase tracking-wider text-cye-orange">Your result</legend>
        <div className="flex gap-2 sm:col-span-2" role="radiogroup" aria-label="Result type">
          {(["Marks", "GPA"] as const).map((t) => (
            <button
              key={t}
              type="button"
              role="radio"
              aria-checked={resultType === t}
              onClick={() => setResultType(t)}
              className={cn(
                "flex-1 rounded-full px-4 py-2 text-sm font-semibold transition-colors",
                resultType === t ? "bg-grad-blue text-white shadow-card" : "border border-cye-blue/15 bg-white text-cye-ink/70 hover:text-cye-blue",
              )}
            >
              {t === "Marks" ? "I have marks" : "I have a GPA / CGPA"}
            </button>
          ))}
        </div>
        {resultType === "Marks" ? (
          <>
            <Field label="Obtained marks">
              <input type="number" inputMode="decimal" min={0} step="any" required value={obtained} onChange={(e) => setObtained(e.target.value)} className={fieldClass} placeholder="e.g. 945" />
            </Field>
            <Field label="Total marks">
              <input type="number" inputMode="decimal" min={1} step="any" required value={total} onChange={(e) => setTotal(e.target.value)} className={fieldClass} placeholder="e.g. 1100" />
            </Field>
          </>
        ) : (
          <>
            <Field label="GPA / CGPA">
              <input type="number" inputMode="decimal" min={0} step="0.01" required value={gpa} onChange={(e) => setGpa(e.target.value)} className={fieldClass} placeholder="e.g. 3.45" />
            </Field>
            <Field label="GPA scale">
              <select value={scale} onChange={(e) => setScale(e.target.value)} className={fieldClass}>
                {GPA_SCALES.map((s) => (
                  <option key={s} value={s}>
                    Out of {s.toFixed(1)} (eligible from {minGpa(s)})
                  </option>
                ))}
              </select>
            </Field>
          </>
        )}
        <div aria-live="polite" className="sm:col-span-2">
          {!started ? (
            <p className="rounded-2xl bg-cye-mist px-4 py-3 text-sm text-cye-ink/60">Enter your result to check eligibility. You need {ELIGIBLE_PERCENT}% or above.</p>
          ) : !check.ok ? (
            <p className="flex items-center gap-2 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
              <XCircle className="h-4 w-4 shrink-0" aria-hidden />
              {check.error}
            </p>
          ) : check.eligible ? (
            <p className="flex items-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
              <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />
              {check.percent}%: you are eligible for Talent Tribute.
            </p>
          ) : (
            <p className="flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              <XCircle className="h-4 w-4 shrink-0" aria-hidden />
              {check.percent}%: Talent Tribute needs {ELIGIBLE_PERCENT}% or above, so you are not eligible this time.
            </p>
          )}
        </div>
      </fieldset>

      <label className="block rounded-2xl border border-dashed border-cye-blue/25 bg-cye-mist p-4 text-sm font-semibold text-cye-blue sm:col-span-2">
        <span className="flex items-center gap-2">
          <FileUp className="h-4 w-4 text-cye-orange" aria-hidden />
          Result card
        </span>
        <span className="mt-1 block text-xs font-normal text-cye-ink/60">
          Photo, screenshot or PDF of the result card or transcript that shows these marks or GPA. Up to 4 MB.
        </span>
        <input
          type="file"
          name="resultCard"
          accept="image/*,application/pdf"
          required
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="mt-3 block w-full text-sm font-normal text-cye-ink file:mr-3 file:rounded-full file:border-0 file:bg-cye-orange file:px-4 file:py-2 file:font-semibold file:text-white"
        />
      </label>

      {CONSENT_FIELDS.map((field) => (
        <label key={field.name} className="flex items-start gap-3 text-sm text-cye-ink/75 sm:col-span-2">
          <input name={field.name} type="checkbox" required className="mt-0.5 h-4 w-4 shrink-0 accent-cye-orange" />
          {field.label}
        </label>
      ))}

      <FormError state={state} />
      <button
        type="submit"
        disabled={state.status === "sending" || !eligible}
        className="inline-flex items-center justify-center gap-2 rounded-full bg-grad-orange px-6 py-3 font-heading text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-cye-orange/25 transition-all hover:-translate-y-0.5 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0 sm:col-span-2"
      >
        {state.status === "sending" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Send className="h-4 w-4" aria-hidden />}
        {state.status === "sending" ? "Submitting..." : eligible ? "Apply for Talent Tribute" : `Needs ${ELIGIBLE_PERCENT}% or above`}
      </button>
    </form>
  );
}
