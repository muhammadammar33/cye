"use client";

import { FormEvent, useState } from "react";
import { Send } from "lucide-react";
import { Field, fieldClass } from "@/components/ui/Field";
import { openMailto } from "@/lib/mailto";
import { cn } from "@/lib/cn";

export type InterestField = {
  name: string;
  label: string;
  type?: "text" | "email" | "tel" | "textarea" | "select";
  required?: boolean;
  autoComplete?: string;
  options?: string[];
  placeholder?: string;
  span?: 1 | 2;
};

export function InterestForm({
  fields,
  to,
  subjectPrefix,
  submitLabel,
}: {
  fields: InterestField[];
  to: string;
  subjectPrefix: string;
  submitLabel: string;
}) {
  const [status, setStatus] = useState<"idle" | "sent">("idle");

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "");
    const lines = fields.map((field) => `${field.label}: ${String(data.get(field.name) ?? "")}`);

    // TODO: POST to a backend endpoint when one is available.
    openMailto(to, `${subjectPrefix} — ${name}`, lines);
    setStatus("sent");
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
      {fields.map((field) => {
        const span = field.span === 2 || field.type === "textarea" ? "sm:col-span-2" : undefined;
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
      <button
        type="submit"
        className="inline-flex items-center justify-center gap-2 rounded-full bg-cye-orange px-6 py-3 font-heading text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-cye-orange/25 transition-all hover:-translate-y-0.5 hover:bg-cye-orange-lt sm:col-span-2"
      >
        <Send className="h-4 w-4" aria-hidden />
        {submitLabel}
      </button>
      {status === "sent" ? (
        <p className="text-center text-sm text-cye-blue sm:col-span-2" role="status">
          Opening your email client — if nothing appears, write to {to}.
        </p>
      ) : null}
    </form>
  );
}
