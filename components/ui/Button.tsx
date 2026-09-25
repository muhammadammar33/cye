import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const variants = {
  primary:
    "bg-cye-orange text-white shadow-lg shadow-cye-orange/25 hover:bg-cye-orange-lt",
  secondary:
    "border-2 border-cye-blue bg-white text-cye-blue hover:bg-cye-mist",
  ghost: "text-cye-blue hover:text-cye-orange",
};

export function Button({
  href,
  children,
  variant = "primary",
  className,
  onClick,
}: {
  href: string;
  children: ReactNode;
  variant?: keyof typeof variants;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-heading text-sm font-bold uppercase tracking-wide transition-all duration-300 hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cye-orange",
        variants[variant],
        className,
      )}
    >
      {children}
    </Link>
  );
}
