import Image from "next/image";
import { cn } from "@/lib/cn";

/** "Developed by MACZAC" credit, MACZAC being the parent company. Footer and admin Settings only. */
export function MaczacCredit({ className }: { className?: string }) {
  return (
    <p className={cn("inline-flex items-center gap-2 text-xs text-cye-ink/50", className)}>
      Developed by
      <a href="https://maczac.com" target="_blank" rel="noopener" className="inline-flex shrink-0 rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cye-orange">
        <Image src="/brand/maczac-logo.png" alt="MACZAC" width={663} height={161} sizes="100px" className="h-5 w-auto sm:h-6" />
      </a>
    </p>
  );
}
