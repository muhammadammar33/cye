import { ChevronRight } from "lucide-react";
import Link from "next/link";

export function Breadcrumbs({ current }: { current: string }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 flex justify-center">
      <ol className="inline-flex items-center gap-1.5 rounded-full border border-cye-blue/10 bg-white/80 px-4 py-1.5 text-xs font-semibold text-cye-ink/60 shadow-card backdrop-blur-sm">
        <li>
          <Link href="/" className="hover:text-cye-orange">
            Home
          </Link>
        </li>
        <li aria-hidden>
          <ChevronRight className="h-3.5 w-3.5 text-cye-orange" />
        </li>
        <li aria-current="page" className="text-cye-blue">
          {current}
        </li>
      </ol>
    </nav>
  );
}
