"use client";

import { Loader2 } from "lucide-react";
import { useFormStatus } from "react-dom";
import { startTransition, useActionState, type FormEvent, type ReactNode } from "react";
import type { ActionState } from "@/app/admin/actions";
import { cn } from "@/lib/cn";

export const inputClass =
  "mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-cye-ink outline-none ring-cye-orange/30 focus:border-cye-orange focus:ring-2";

/**
 * useActionState wired through onSubmit instead of <form action>, so React does not
 * clear the form after the action runs (keeps the admin's input when validation fails).
 */
export function useFormAction(action: (state: ActionState, form: FormData) => Promise<ActionState>) {
  const [state, dispatch, pending] = useActionState(action, undefined);
  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    startTransition(() => dispatch(data));
  };
  return { state, onSubmit, pending };
}

export function SubmitButton({
  children,
  className,
  variant = "primary",
  pending: pendingProp,
}: {
  children: ReactNode;
  className?: string;
  variant?: "primary" | "danger" | "ghost";
  pending?: boolean;
}) {
  const status = useFormStatus();
  const pending = pendingProp ?? status.pending;
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-wait disabled:opacity-60",
        variant === "primary" && "bg-grad-orange text-white hover:brightness-110",
        variant === "danger" && "bg-red-600 text-white hover:bg-red-700",
        variant === "ghost" && "border border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
        className,
      )}
    >
      {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
      {children}
    </button>
  );
}

export function FormMessage({ state }: { state: ActionState }) {
  if (!state) return null;
  if (state.error) return <p className="rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-700" role="alert">{state.error}</p>;
  if (state.ok) return <p className="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700" role="status">{state.ok}</p>;
  return null;
}

/** A form whose submit asks for confirmation first (for deletes). */
export function ConfirmForm({ action, message, children }: { action: () => Promise<void>; message: string; children: ReactNode }) {
  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm(message)) event.preventDefault();
      }}
    >
      {children}
    </form>
  );
}
