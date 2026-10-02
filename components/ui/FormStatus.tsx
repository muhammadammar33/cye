import { CheckCircle2 } from "lucide-react";

export type FormState = { status: "idle" | "sending" } | { status: "sent" } | { status: "error"; error: string };

/** Hidden honeypot input: real visitors never see or fill it. */
export function Honeypot() {
  return (
    <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
      <label>
        Leave this empty
        <input type="text" name="company_website" tabIndex={-1} autoComplete="off" />
      </label>
    </div>
  );
}

export function FormSuccess({ title = "Submitted!", children }: { title?: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-2xl bg-cye-mist p-6 text-center" role="status">
      <CheckCircle2 className="mx-auto h-8 w-8 text-cye-orange" aria-hidden />
      <p className="mt-3 font-heading text-lg font-extrabold text-cye-blue">{title}</p>
      <p className="mt-2 text-sm text-cye-ink/70">
        {children ?? "Thank you. We have received your submission and sent a confirmation to your email. Our team will be in touch soon."}
      </p>
    </div>
  );
}

export function FormError({ state }: { state: FormState }) {
  if (state.status !== "error") return null;
  return (
    <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 sm:col-span-2" role="alert">
      {state.error}
    </p>
  );
}
