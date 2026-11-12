import { Phone } from "lucide-react";
import { whatsappLink } from "@/lib/phone";
import { cn } from "@/lib/cn";

/** A CYE focal person: title, name and a WhatsApp link to their number. */
export function FocalPerson({ title, name, phone, className }: { title: string; name: string; phone: string | null; className?: string }) {
  return (
    <div className={cn("flex items-start gap-3 rounded-2xl border border-cye-orange/20 bg-cye-orange/5 px-4 py-3 text-sm", className)}>
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-cye-orange shadow-sm">
        <Phone className="h-4 w-4" aria-hidden />
      </span>
      <p className="leading-relaxed text-cye-ink/75">
        <span className="block text-xs font-semibold uppercase tracking-wide text-cye-ink/45">{title}</span>
        <span className="font-semibold text-cye-blue">{name}</span>
        {phone ? (
          <>
            {" · "}
            <a href={whatsappLink(phone)} target="_blank" rel="noopener noreferrer" className="whitespace-nowrap font-semibold text-cye-orange hover:text-cye-orange-lt">
              {phone}
            </a>
          </>
        ) : null}
      </p>
    </div>
  );
}
