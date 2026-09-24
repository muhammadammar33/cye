import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export const fieldClass =
  "mt-1.5 w-full rounded-2xl border border-cye-blue/15 bg-cye-mist px-4 py-3 font-medium text-cye-ink outline-none ring-cye-orange/40 focus:ring-2";

export function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block text-sm font-semibold text-cye-blue", className)}>
      {label}
      {children}
    </label>
  );
}
