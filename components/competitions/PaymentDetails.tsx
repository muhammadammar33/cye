"use client";

import { Check, Copy, CreditCard } from "lucide-react";
import { useState } from "react";
import type { PaymentSettings } from "@/lib/defaults";

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        } catch {
          /* clipboard unavailable: the number is still visible to copy by hand */
        }
      }}
      className="inline-flex shrink-0 items-center gap-1 rounded-full border border-cye-blue/15 bg-white px-2.5 py-1 text-xs font-semibold text-cye-blue hover:border-cye-orange hover:text-cye-orange"
      aria-label={`Copy ${value}`}
    >
      {copied ? <Check className="h-3.5 w-3.5" aria-hidden /> : <Copy className="h-3.5 w-3.5" aria-hidden />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

export function PaymentDetails({ payment, fee }: { payment: PaymentSettings; fee?: string }) {
  if (payment.accounts.length === 0) return null;
  return (
    <div className="rounded-2xl border border-cye-orange/25 bg-cye-orange/5 p-5">
      <p className="flex items-center gap-2 font-heading text-sm font-bold uppercase tracking-wider text-cye-orange">
        <CreditCard className="h-4 w-4" aria-hidden />
        Payment details
      </p>
      {fee ? (
        <p className="mt-2 text-sm text-cye-ink/75">
          Registration fee: <span className="font-heading font-extrabold text-cye-blue">{fee}</span>
        </p>
      ) : null}
      {payment.instructions ? <p className="mt-2 text-sm leading-relaxed text-cye-ink/70">{payment.instructions}</p> : null}
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {payment.accounts.map((account) => (
          <li key={`${account.method}-${account.number}`} className="rounded-xl border border-white bg-white p-4 shadow-card">
            <p className="font-heading text-sm font-extrabold text-cye-blue">{account.method}</p>
            {account.title ? <p className="mt-0.5 text-xs text-cye-ink/60">{account.title}</p> : null}
            <div className="mt-2 flex items-center justify-between gap-2">
              <span className="break-all font-mono text-sm font-semibold text-cye-ink">{account.number}</span>
              <CopyButton value={account.number} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
