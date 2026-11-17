"use client";

import { CheckCircle2, Loader2, TicketPercent, X } from "lucide-react";
import { useState } from "react";
import { fieldClass } from "@/components/ui/Field";
import { normalizeCoupon } from "@/lib/coupons";

export type AppliedCoupon = { code: string; percent: number; ambassador: string; institute: string };

/**
 * Optional head ambassador coupon. "Apply" checks the code; the server checks it again on submit, so a code
 * typed but not applied is still validated. `name="coupon"` carries the code in the form data.
 */
export function CouponField({ applied, onApply, className }: { applied: AppliedCoupon | null; onApply: (coupon: AppliedCoupon | null) => void; className?: string }) {
  const [value, setValue] = useState(applied?.code ?? "");
  const [status, setStatus] = useState<"idle" | "checking" | "invalid" | "error">("idle");

  async function apply() {
    const code = normalizeCoupon(value);
    if (!code) return;
    setStatus("checking");
    try {
      const res = await fetch(`/api/coupons?code=${encodeURIComponent(code)}`, { cache: "no-store" });
      const body = (await res.json()) as { valid: boolean } & Partial<AppliedCoupon>;
      if (body.valid && body.code) {
        onApply({ code: body.code, percent: body.percent ?? 10, ambassador: body.ambassador ?? "", institute: body.institute ?? "" });
        setValue(body.code);
        setStatus("idle");
      } else {
        onApply(null);
        setStatus("invalid");
      }
    } catch {
      setStatus("error");
    }
  }

  function remove() {
    onApply(null);
    setValue("");
    setStatus("idle");
  }

  return (
    <div className={className}>
      <label htmlFor="coupon" className="flex items-center gap-1.5 text-sm font-semibold text-cye-blue">
        <TicketPercent className="h-4 w-4 text-cye-orange" aria-hidden />
        Coupon code (optional)
      </label>
      <p className="mt-0.5 text-xs text-cye-ink/60">Got a code from your campus head ambassador? Get 10% off the registration fee.</p>
      <div className="mt-2 flex gap-2">
        <input
          id="coupon"
          name="coupon"
          value={value}
          onChange={(event) => {
            setValue(event.target.value);
            if (applied) onApply(null);
            if (status !== "checking") setStatus("idle");
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              void apply();
            }
          }}
          readOnly={Boolean(applied)}
          autoComplete="off"
          spellCheck={false}
          className={`${fieldClass} uppercase`}
          aria-describedby="coupon-status"
        />
        {applied ? (
          <button type="button" onClick={remove} className="inline-flex shrink-0 items-center gap-1 rounded-xl border border-cye-blue/15 bg-white px-4 text-sm font-semibold text-cye-ink/70 hover:text-cye-orange">
            <X className="h-4 w-4" aria-hidden />
            Remove
          </button>
        ) : (
          <button
            type="button"
            onClick={apply}
            disabled={!value.trim() || status === "checking"}
            className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-cye-blue px-4 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-50"
          >
            {status === "checking" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
            Apply
          </button>
        )}
      </div>
      <p id="coupon-status" aria-live="polite" className="mt-2 text-sm">
        {applied ? (
          <span className="flex items-start gap-1.5 font-semibold text-emerald-700">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            {applied.percent}% off applied with {applied.ambassador}&rsquo;s coupon ({applied.institute}).
          </span>
        ) : status === "invalid" ? (
          <span className="font-semibold text-red-600">This coupon code is not valid. Check it with your head ambassador, or leave it empty.</span>
        ) : status === "error" ? (
          <span className="font-semibold text-red-600">Could not check the code right now. You can still submit: we check it again then.</span>
        ) : null}
      </p>
    </div>
  );
}
