"use client";

import { useState } from "react";
import type { ActionState } from "@/app/admin/actions";
import { FormMessage, inputClass, SubmitButton, useFormAction } from "@/components/admin/ui";
import type { FieldDef } from "@/lib/admin/entities";

type Values = Record<string, unknown>;

function ImageField({ field, value }: { field: FieldDef; value: string | null }) {
  const [preview, setPreview] = useState<string | null>(value);
  return (
    <div className="sm:col-span-2">
      <span className="text-sm font-semibold text-slate-700">{field.label}</span>
      <div className="mt-1.5 flex flex-col gap-4 rounded-xl border border-dashed border-slate-300 p-4 sm:flex-row sm:items-start">
        {/* eslint-disable-next-line @next/next/no-img-element -- local preview of an arbitrary URL or picked file */}
        {preview ? <img src={preview} alt="" className="h-28 w-28 shrink-0 rounded-xl object-cover" /> : <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs text-slate-400">No photo</div>}
        <div className="flex-1 space-y-3">
          <label className="block text-xs font-semibold text-slate-600">
            Upload a new photo
            <input
              type="file"
              name={`${field.name}_file`}
              accept="image/*"
              className="mt-1 block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-cye-mist file:px-3 file:py-1.5 file:font-semibold file:text-cye-blue"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) setPreview(URL.createObjectURL(file));
              }}
            />
          </label>
          <label className="block text-xs font-semibold text-slate-600">
            or a site image path
            <input name={field.name} defaultValue={value ?? ""} placeholder="/guests/name.webp" className={inputClass} onChange={(e) => setPreview(e.target.value || null)} />
          </label>
          {value ? (
            <label className="flex items-center gap-2 text-xs text-slate-600">
              <input type="checkbox" name={`${field.name}_remove`} className="accent-cye-orange" /> Remove photo
            </label>
          ) : null}
          {field.help ? <p className="text-xs text-slate-500">{field.help}</p> : null}
        </div>
      </div>
    </div>
  );
}

export function EntityForm({ fields, values, action, submitLabel }: { fields: FieldDef[]; values: Values; action: (state: ActionState, form: FormData) => Promise<ActionState>; submitLabel: string }) {
  const { state, onSubmit, pending } = useFormAction(action);
  return (
    <form onSubmit={onSubmit} className="grid gap-5 sm:grid-cols-2">
      {fields.map((field) => {
        const value = values[field.name];
        const help = field.help && field.kind !== "image" ? <span className="mt-1 block text-xs font-normal text-slate-500">{field.help}</span> : null;
        switch (field.kind) {
          case "image":
            return <ImageField key={field.name} field={field} value={(value as string | null) ?? null} />;
          case "checkbox":
            return (
              <label key={field.name} className="flex items-center gap-2 self-end text-sm font-semibold text-slate-700">
                <input type="checkbox" name={field.name} defaultChecked={Boolean(value)} className="h-4 w-4 accent-cye-orange" />
                {field.label}
              </label>
            );
          case "textarea":
          case "list":
            return (
              <label key={field.name} className="block text-sm font-semibold text-slate-700 sm:col-span-2">
                {field.label}
                <textarea
                  name={field.name}
                  required={field.required}
                  rows={field.kind === "list" ? 6 : 5}
                  defaultValue={Array.isArray(value) ? value.join("\n") : String(value ?? "")}
                  className={inputClass}
                />
                {help}
              </label>
            );
          case "select":
            return (
              <label key={field.name} className="block text-sm font-semibold text-slate-700">
                {field.label}
                <select name={field.name} required={field.required} defaultValue={String(value ?? "")} className={inputClass}>
                  <option value="" disabled>
                    Select...
                  </option>
                  {field.options?.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                {help}
              </label>
            );
          default:
            return (
              <label key={field.name} className="block text-sm font-semibold text-slate-700">
                {field.label}
                <input
                  name={field.name}
                  type={field.kind === "number" ? "number" : "text"}
                  required={field.required}
                  defaultValue={value === undefined || value === null ? "" : String(value)}
                  className={inputClass}
                />
                {help}
              </label>
            );
        }
      })}
      <div className="space-y-3 sm:col-span-2">
        <FormMessage state={state} />
        <SubmitButton pending={pending}>{submitLabel}</SubmitButton>
      </div>
    </form>
  );
}
