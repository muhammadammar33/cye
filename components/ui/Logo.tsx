import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/cn";

export function Logo({
  className,
  compact = false,
  priority = false,
}: {
  className?: string;
  compact?: boolean;
  priority?: boolean;
}) {
  return (
    <Link href="/" className={cn("flex items-center gap-2.5", className)} aria-label="Capital Youth Expo 2026 home">
      <Image
        src="/brand/cye-emblem.png"
        alt=""
        width={491}
        height={474}
        sizes="44px"
        className="h-10 w-auto sm:h-11"
        priority={priority}
      />
      <span className="leading-none">
        <span className="block font-heading text-[11px] font-extrabold uppercase tracking-[0.18em] text-cye-blue">
          Capital Youth
        </span>
        <span className="font-display text-2xl font-extrabold leading-none text-cye-orange">
          Expo{compact ? "" : " 2026"}
        </span>
      </span>
    </Link>
  );
}
