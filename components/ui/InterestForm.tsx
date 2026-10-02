"use client";

import { FormEvent, useState } from "react";
import { Loader2, Send } from "lucide-react";
import { Field, fieldClass } from "@/components/ui/Field";
import { FormError, FormSuccess, Honeypot, type FormState } from "@/components/ui/FormStatus";
import type { SubmissionType } from "@/lib/db/schema";
import { cn } from "@/lib/cn";
import { submitForm } from "@/lib/submit";

export type InterestField = {
  name: string;
  label: string;
  type?: "text" | "email" | "tel" | "url" | "number" | "textarea" | "select" | "checkbox";
  required?: boolean;
  autoComplete?: string;
  options?: string[];
  placeholder?: string;
  span?: 1 | 2;
};

export function InterestForm({
  fields,
  type,
  to,
  submitLabel,
}: {
  fields: InterestField[];
  type: SubmissionType;
  /** Inbox shown if something goes wrong. */
  to: string;
  submitLabel: string;
}) {
  const [state, setState] = useState<FormState>({ status: "idle" });

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const data: Record<string, string> = {};
    for (const field of fields) {
      const value = form.get(field.name);
      if (field.type === "checkbox") {
        if (value) data[field.name] = "on";
      } else {
        data[field.name] = String(value ?? "");
      }
    }
    setState({ status: "sending" });
    const result = await submitForm(type, data, String(form.get("company_website") ?? ""));
    setState(result.ok ? { status: "sent" } : { status: "error", error: `${result.error} If this keeps happening, email ${to}.` });
  }

  if (state.status === "sent") return <FormSuccess />;

  return (
    <form onSubmit={onSubmit} className="relative grid gap-4 sm:grid-cols-2">
      <Honeypot />
      {fields.map((field) => {
        const span =
          field.span === 2 || field.type === "textarea" || field.type === "checkbox" ? "sm:col-span-2" : undefined;
        if (field.type === "checkbox") {
          return (
            <label key={field.name} className={cn("flex items-start gap-3 text-sm text-cye-ink/75", span)}>
              <input
                name={field.name}
                type="checkbox"
                required={field.required}
                className="mt-0.5 h-4 w-4 shrink-0 accent-cye-orange"
              />
              {field.label}
            </label>
          );
        }
        if (field.type === "textarea") {
          return (
            <Field key={field.name} label={field.label} className={span}>
              <textarea
                name={field.name}
                rows={4}
                required={field.required}
                placeholder={field.placeholder}
                className={cn(fieldClass, "resize-y")}
              />
            </Field>
          );
        }
        if (field.type === "select") {
          return (
            <Field key={field.name} label={field.label} className={span}>
              <select
                name={field.name}
                required={field.required}
                defaultValue=""
                className={fieldClass}
              >
                <option value="" disabled>
                  {field.placeholder ?? "Select an option"}
                </option>
                {field.options?.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </Field>
          );
        }
        return (
          <Field key={field.name} label={field.label} className={span}>
            <input
              name={field.name}
              type={field.type ?? "text"}
              required={field.required}
              autoComplete={field.autoComplete}
              placeholder={field.placeholder}
              className={fieldClass}
            />
          </Field>
        );
      })}
      <FormError state={state} />
      <button
        type="submit"
        disabled={state.status === "sending"}
        className="inline-flex items-center justify-center gap-2 rounded-full bg-grad-orange px-6 py-3 font-heading text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-cye-orange/25 transition-all hover:-translate-y-0.5 hover:brightness-110 disabled:cursor-wait disabled:opacity-70 sm:col-span-2"
      >
        {state.status === "sending" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Send className="h-4 w-4" aria-hidden />}
        {state.status === "sending" ? "Submitting..." : submitLabel}
      </button>
    </form>
  );
}
