"use client";

import { Check, ChevronDown, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { setSubmissionGender } from "@/app/admin/actions";
import { inputClass } from "@/components/admin/ui";
import { GENDERS } from "@/data/event";
import { cn } from "@/lib/cn";

type Option = { key: string; label: string; count: number };

/**
 * Multi-select of every institution applicants typed. Search, tick as many as needed
 * (e.g. search "comsats" and press "Select all shown"), then press Filter.
 */
export function UniversityFilter({ options, selected }: { options: Option[]; selected: string[] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<string[]>(selected);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const shown = useMemo(() => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    return words.length ? options.filter((o) => words.every((w) => o.key.includes(w))) : options;
  }, [options, query]);
  const labelOf = (key: string) => options.find((o) => o.key === key)?.label ?? key;
  const toggle = (key: string) => setPicked((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));

  return (
    <div ref={ref} className="relative">
      {picked.map((key) => (
        <input key={key} type="hidden" name="uni" value={key} />
      ))}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={cn(inputClass, "flex items-center justify-between gap-2 text-left")}
      >
        <span className={cn("truncate", picked.length === 0 && "text-slate-500")}>
          {picked.length === 0 ? "All universities" : picked.length === 1 ? labelOf(picked[0]) : `${picked.length} universities`}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" aria-hidden />
      </button>

      {open ? (
        <div className="absolute left-0 z-30 mt-2 w-[min(26rem,calc(100vw-2rem))] rounded-2xl border border-slate-200 bg-white p-3 shadow-xl">
          <label className="flex items-center gap-2 rounded-xl border border-slate-300 px-3 py-2">
            <Search className="h-4 w-4 text-slate-400" aria-hidden />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search, e.g. comsats"
              className="w-full bg-transparent text-sm outline-none"
              aria-label="Search universities"
            />
          </label>
          <div className="mt-2 flex items-center justify-between gap-2 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setPicked((prev) => [...new Set([...prev, ...shown.map((o) => o.key)])])}
              disabled={shown.length === 0}
              className="rounded-lg px-2 py-1 text-cye-blue hover:bg-cye-mist disabled:opacity-40"
            >
              Select all shown ({shown.length})
            </button>
            <button type="button" onClick={() => setPicked([])} disabled={picked.length === 0} className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100 disabled:opacity-40">
              Clear
            </button>
          </div>
          {picked.length ? (
            <div className="mt-2 flex max-h-20 flex-wrap gap-1.5 overflow-y-auto">
              {picked.map((key) => (
                <button key={key} type="button" onClick={() => toggle(key)} className="inline-flex items-center gap-1 rounded-full bg-cye-mist px-2.5 py-1 text-xs font-semibold text-cye-blue">
                  {labelOf(key)}
                  <X className="h-3 w-3" aria-label="Remove" />
                </button>
              ))}
            </div>
          ) : null}
          <ul className="mt-2 max-h-64 overflow-y-auto border-t border-slate-100 pt-1" role="listbox" aria-multiselectable>
            {shown.length === 0 ? (
              <li className="px-2 py-4 text-center text-sm text-slate-500">{options.length ? "No match." : "No institutions submitted yet."}</li>
            ) : (
              shown.map((o) => {
                const on = picked.includes(o.key);
                return (
                  <li key={o.key}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={on}
                      onClick={() => toggle(o.key)}
                      className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-slate-50"
                    >
                      <span className={cn("flex h-4 w-4 shrink-0 items-center justify-center rounded border", on ? "border-cye-orange bg-cye-orange text-white" : "border-slate-300")}>
                        {on ? <Check className="h-3 w-3" aria-hidden /> : null}
                      </span>
                      <span className="flex-1 truncate">{o.label}</span>
                      <span className="text-xs text-slate-400">{o.count}</span>
                    </button>
                  </li>
                );
              })
            )}
          </ul>
          <p className="mt-2 text-[11px] text-slate-400">Pick one or more, then press Filter.</p>
        </div>
      ) : null}
    </div>
  );
}

/** Gender picker inside the submissions table; saves as soon as it changes. */
export function GenderSelect({ id, value, name }: { id: number; value: string | null; name: string }) {
  const [current, setCurrent] = useState(value ?? "");
  const [error, setError] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <select
      value={current}
      disabled={pending}
      aria-label={`Gender of ${name}`}
      onChange={(e) => {
        const next = e.target.value;
        const prev = current;
        setCurrent(next);
        setError(false);
        startTransition(async () => {
          const result = await setSubmissionGender(id, next);
          if (result?.error) {
            setCurrent(prev);
            setError(true);
          }
        });
      }}
      className={cn(
        "rounded-lg border bg-white px-2 py-1 text-xs font-semibold",
        error ? "border-red-400 text-red-600" : current ? "border-slate-200 text-slate-700" : "border-dashed border-slate-300 text-slate-400",
        pending && "opacity-60",
      )}
    >
      <option value="">Not set</option>
      {GENDERS.map((g) => (
        <option key={g} value={g}>
          {g}
        </option>
      ))}
    </select>
  );
}
