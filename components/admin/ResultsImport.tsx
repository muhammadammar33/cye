"use client";

import { FileUp, Loader2 } from "lucide-react";
import { startTransition, useActionState, useState } from "react";
import { importPreEventResults, type ResultsListState } from "@/app/admin/actions";
import { PRE_EVENT_LABELS } from "@/lib/admin/labels";

/**
 * Results from a campus: upload their CSV or paste lines from WhatsApp, check what matched, then save.
 * Each line needs an email (or registration number like #123) and a result: qualified / not qualified / absent.
 */
export function ResultsImport() {
  const [text, setText] = useState("");
  const [state, dispatch, pending] = useActionState<ResultsListState, FormData>(importPreEventResults, undefined);
  const run = (mode: "check" | "save") => {
    const data = new FormData();
    data.set("text", text);
    data.set("mode", mode);
    startTransition(() => dispatch(data));
  };
  const checked = state?.matches && !state.saved;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          <FileUp className="h-4 w-4" aria-hidden />
          Upload CSV
          <input
            type="file"
            accept=".csv,text/csv,text/plain"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) file.text().then(setText);
            }}
          />
        </label>
        <span className="text-xs text-slate-500">or paste below (e.g. from WhatsApp)</span>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={7}
        placeholder={"email, result\nali.khan@nust.edu.pk, qualified\nsara@comsats.edu.pk, not qualified\n#214, absent"}
        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 font-mono text-xs outline-none focus:border-cye-orange focus:ring-2 focus:ring-cye-orange/30"
        aria-label="Results list"
      />
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={pending || !text.trim()} onClick={() => run("check")} className="inline-flex items-center gap-2 rounded-xl bg-grad-blue px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
          Check list
        </button>
        {checked && state.matches!.length ? (
          <button type="button" disabled={pending} onClick={() => run("save")} className="rounded-xl bg-grad-orange px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
            Save {state.matches!.length} result{state.matches!.length === 1 ? "" : "s"}
          </button>
        ) : null}
      </div>

      {state?.error ? <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{state.error}</p> : null}
      {state?.ok ? <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">{state.ok}</p> : null}

      {checked ? (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full min-w-[640px] text-left text-xs">
            <thead className="bg-slate-50 font-bold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2">Line</th>
                <th className="px-3 py-2">Matched</th>
                <th className="px-3 py-2">Competition</th>
                <th className="px-3 py-2">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {state.matches!.map((m) => (
                <tr key={m.line}>
                  <td className="px-3 py-2 text-slate-400">{m.line}</td>
                  <td className="px-3 py-2">
                    <span className="font-semibold text-slate-800">{m.person ?? `Team ${m.team}`}</span>
                    <span className="block text-slate-500">
                      {m.email ?? `#${m.submissionId}`} · team {m.team}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-slate-600">{m.competition}</td>
                  <td className="px-3 py-2 font-semibold">
                    {PRE_EVENT_LABELS[m.result]}
                    {m.result === "absent" && m.email ? <span className="block font-normal text-slate-500">this member only</span> : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      {state?.problems?.length ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
          <p className="font-bold">{state.problems.length} line{state.problems.length === 1 ? "" : "s"} not matched (not saved):</p>
          <ul className="mt-1 space-y-0.5">
            {state.problems.slice(0, 30).map((p) => (
              <li key={p.line}>
                Line {p.line}: <span className="font-mono">{p.text.slice(0, 80)}</span> · {p.why}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
