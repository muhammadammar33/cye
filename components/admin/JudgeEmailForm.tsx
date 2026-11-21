"use client";

import { Phone, RotateCcw, Send } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { sendJudgeEmail } from "@/app/admin/actions";
import { FormMessage, inputClass, SubmitButton, useFormAction } from "@/components/admin/ui";
import type { Focal } from "@/lib/focals";
import { boldParts, fillJudgeTemplate, JUDGE_MESSAGE, JUDGE_SUBJECT, splitEmails } from "@/lib/judgeEmail";

type Option = { name: string; rulebook: string | null; focals: Focal[] };

/** Judge invitation: pick a competition, enter the judge, check the filled-in message, send. */
export function JudgeEmailForm({ competitions }: { competitions: Option[] }) {
  const { state, onSubmit, pending } = useFormAction(sendJudgeEmail);
  const [competition, setCompetition] = useState("");
  const [judge, setJudge] = useState("");
  const [email, setEmail] = useState("");
  const [cc, setCc] = useState("");
  const [subject, setSubject] = useState(JUDGE_SUBJECT);
  const [message, setMessage] = useState(JUDGE_MESSAGE);
  const chosen = competitions.find((c) => c.name === competition);
  const vars = { judge, competition: competition || "{competition}", focals: chosen?.focals ?? [] };

  // After a send, clear the judge so the next one can be entered; the competition and wording stay.
  const lastOk = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (state?.ok && state.ok !== lastOk.current) {
      lastOk.current = state.ok;
      setJudge("");
      setEmail("");
    }
  }, [state]);

  function confirmFirst(event: React.FormEvent<HTMLFormElement>) {
    const ccList = splitEmails(cc);
    if (!window.confirm(`Send the invitation for ${competition} to ${judge} (${email})${ccList.length ? `, cc ${ccList.join(", ")}` : ""}?`)) {
      event.preventDefault();
      return;
    }
    onSubmit(event);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <form onSubmit={confirmFirst} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <label className="block text-xs font-semibold text-slate-700">
          Competition
          <select name="competition" required value={competition} onChange={(e) => setCompetition(e.target.value)} className={inputClass}>
            <option value="" disabled>
              Choose a competition
            </option>
            {competitions.map((c) => (
              <option key={c.name} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        {chosen ? (
          <div className="rounded-xl bg-cye-mist px-3 py-2 text-xs text-slate-600">
            <p className="font-semibold uppercase tracking-wide text-slate-500">{chosen.focals.length > 1 ? "Focal persons" : "Focal person"} in the email</p>
            {chosen.focals.length ? (
              chosen.focals.map((f) => (
                <p key={f.name} className="mt-1 flex items-center gap-1.5 font-semibold text-cye-blue">
                  <Phone className="h-3 w-3 text-cye-orange" aria-hidden />
                  {f.name}
                  {f.phone ? <span className="font-normal text-slate-600">{f.phone}</span> : null}
                </p>
              ))
            ) : (
              <p className="mt-1 text-red-600">No focal person is set for this competition. Add one in Competitions, or the email says &ldquo;our competitions team&rdquo;.</p>
            )}
          </div>
        ) : null}
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block text-xs font-semibold text-slate-700">
            Judge&apos;s name
            <input name="judge" required value={judge} onChange={(e) => setJudge(e.target.value)} placeholder="e.g. Dr. Ayesha Khan" className={inputClass} />
          </label>
          <label className="block text-xs font-semibold text-slate-700">
            Judge&apos;s email
            <input name="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" className={inputClass} />
          </label>
        </div>
        <label className="block text-xs font-semibold text-slate-700">
          CC <span className="font-normal text-slate-500">(optional; separate several with commas)</span>
          <input name="cc" value={cc} onChange={(e) => setCc(e.target.value)} placeholder="focal.person@example.com, team@capitalyouthexpo.com" className={inputClass} />
        </label>
        <label className="block text-xs font-semibold text-slate-700">
          Subject
          <input name="subject" required maxLength={200} value={subject} onChange={(e) => setSubject(e.target.value)} className={inputClass} />
        </label>
        <label className="block text-xs font-semibold text-slate-700">
          Message
          <textarea name="message" required rows={12} maxLength={6000} value={message} onChange={(e) => setMessage(e.target.value)} className={`${inputClass} font-normal leading-relaxed`} />
        </label>
        <p className="text-xs text-slate-500">
          Placeholders are filled in when the email is sent: <code>{"{judge}"}</code>, <code>{"{competition}"}</code>, <code>{"{focal}"}</code> (focal person and phone),{" "}
          <code>{"{date}"}</code>, <code>{"{venue}"}</code>; filled-in details appear in <strong>bold</strong>. To make any other text bold, put it between double
          asterisks, like <code>**reporting time 9 am**</code>. The email also shows the date, venue, rule book and focal person&apos;s WhatsApp link. Replies go to the competitions inbox.
        </p>
        <FormMessage state={state} />
        <div className="flex flex-wrap items-center gap-2">
          <SubmitButton pending={pending}>
            <Send className="h-4 w-4" aria-hidden />
            Send to judge
          </SubmitButton>
          <button
            type="button"
            onClick={() => {
              setSubject(JUDGE_SUBJECT);
              setMessage(JUDGE_MESSAGE);
            }}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            <RotateCcw className="h-3.5 w-3.5" aria-hidden />
            Reset wording
          </button>
        </div>
      </form>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" aria-label="Preview">
        <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Preview</p>
        <p className="mt-2 text-xs text-slate-500">To: {email || "judge's email"}</p>
        {splitEmails(cc).length ? <p className="text-xs text-slate-500">CC: {splitEmails(cc).join(", ")}</p> : null}
        <h2 className="mt-3 font-heading text-lg font-bold text-cye-blue">{fillJudgeTemplate(subject, vars)}</h2>
        <div className="mt-3 space-y-3 whitespace-pre-line text-sm leading-relaxed text-slate-700">
          {fillJudgeTemplate(message, vars, true)
            .split(/\n\s*\n/)
            .map((p, i) => (
              <p key={i}>
                {boldParts(p.trim()).map((part, j) => (part.bold ? <strong key={j} className="text-slate-900">{part.text}</strong> : <span key={j}>{part.text}</span>))}
              </p>
            ))}
        </div>
        {chosen ? (
          <div className="mt-4 rounded-xl border-l-4 border-cye-orange bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <p>
              <strong className="text-cye-blue">Competition</strong> {chosen.name}
            </p>
            {chosen.rulebook ? <p className="mt-1 text-xs text-cye-orange">Includes a &ldquo;Read the rule book&rdquo; button</p> : null}
          </div>
        ) : null}
        <p className="mt-4 text-sm text-slate-700">
          Regards,
          <br />
          <strong>Team Capital Youth Expo 2026</strong>
        </p>
      </section>
    </div>
  );
}
