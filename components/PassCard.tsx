import Image from "next/image";
import { CalendarDays, MapPin } from "lucide-react";
import { EVENT } from "@/data/event";
import { PASS_CATEGORIES, type PassCategory } from "@/lib/passCategories";

type PassForCard = { token: string; code: string | null; category: string; name: string; detail: string | null; institution: string | null; createdAt: Date };

const ISSUED = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit", timeZone: "Asia/Karachi" });

/** Three small diamonds, as on printed entry passes. */
function Diamonds({ color }: { color: string }) {
  return (
    <span className="flex items-center gap-1" aria-hidden>
      {["#ef432c", color, "#f4782a"].map((c, i) => (
        <span key={i} className="h-1.5 w-1.5 rotate-45" style={{ background: c }} />
      ))}
    </span>
  );
}

function Field({ label, value, color, wide }: { label: string; value: string; color?: string; wide?: boolean }) {
  return (
    <div className={wide ? "col-span-2" : undefined}>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-0.5 border-b border-slate-300/80 pb-1.5 font-heading text-[15px] font-bold leading-snug text-cye-ink" style={color ? { color } : undefined}>
        {value}
      </p>
    </div>
  );
}

/**
 * The printable entry pass: big CYE logo, a ribbon in the pass type's colour, the holder's details, a QR code and
 * the venue at the bottom. Background graphics: CYE's brand arcs and a geometric star pattern (after the venue's
 * facade). Everything prints in colour.
 */
export function PassCard({ pass, valid }: { pass: PassForCard; valid: boolean }) {
  const cat = PASS_CATEGORIES[pass.category as PassCategory] ?? PASS_CATEGORIES.visitor;
  const patternId = `stars-${pass.token.slice(0, 6)}`;
  return (
    <article
      className={`relative break-inside-avoid overflow-hidden rounded-[28px] border border-slate-200 bg-[#fffdf8] shadow-card [print-color-adjust:exact] [-webkit-print-color-adjust:exact] ${valid ? "" : "opacity-60 grayscale"}`}
    >
      {/* Background graphics */}
      <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <pattern id={patternId} width="44" height="44" patternUnits="userSpaceOnUse">
            <path
              d="M22 6 L26 18 L38 22 L26 26 L22 38 L18 26 L6 22 L18 18 Z M22 12 L24.5 19.5 L32 22 L24.5 24.5 L22 32 L19.5 24.5 L12 22 L19.5 19.5 Z"
              fill="none"
              stroke="#1b4694"
              strokeWidth="0.8"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} opacity="0.07" />
      </svg>
      {/* eslint-disable-next-line @next/next/no-img-element -- decorative SVG */}
      <img src="/hero-arcs.svg" alt="" aria-hidden className="pointer-events-none absolute -right-16 -top-16 w-56 opacity-40" />
      {/* eslint-disable-next-line @next/next/no-img-element -- decorative SVG */}
      <img src="/hero-arcs.svg" alt="" aria-hidden className="pointer-events-none absolute -left-14 -top-14 w-36 -scale-x-100 opacity-25" />

      <div className="relative">
        {/* Header: big logo and event line */}
        <header className="flex flex-col items-center px-6 pt-6 text-center">
          <Image src="/brand/cye-logo.png" alt="Capital Youth Expo" width={773} height={760} priority className="h-auto w-44" />
          <p className="mt-2 text-[10px] font-bold tracking-[0.3em] text-cye-orange">{EVENT.tagline}</p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs font-semibold text-cye-blue">
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="h-3.5 w-3.5 text-cye-orange" aria-hidden />
              {EVENT.date}
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-cye-orange" aria-hidden />
              {EVENT.venue}, {EVENT.city}
            </span>
          </div>
        </header>

        {/* Ribbon in the pass type's colour */}
        <div className="relative mx-3 mt-4 rounded-xl px-4 py-3 text-center text-white shadow-md" style={{ background: `linear-gradient(135deg, ${cat.color}, ${cat.color}d9)` }}>
          <div className="flex items-center justify-center gap-3">
            <Diamonds color="#ffffff" />
            <p className="whitespace-nowrap font-heading text-[clamp(1rem,5vw,1.25rem)] font-black uppercase tracking-wide">Official Entry Pass</p>
            <Diamonds color="#ffffff" />
          </div>
          <p className="mt-0.5 text-[11px] font-bold uppercase tracking-[0.25em] text-white/85">{cat.label}</p>
        </div>

        {/* Holder */}
        <div className="grid grid-cols-2 gap-x-5 gap-y-3 px-7 pt-5">
          <Field label="Name" value={pass.name} wide />
          {pass.detail ? <Field label={pass.category === "competition" ? "Competition" : "Role / for"} value={pass.detail} wide /> : null}
          {pass.institution ? <Field label="Institution" value={pass.institution} /> : null}
          <Field label="Pass type" value={cat.label} color={cat.color} wide={!pass.institution} />
        </div>

        {/* QR: smaller than the logo, framed */}
        <div className="flex flex-col items-center px-6 pt-5">
          <div className="rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element -- PNG generated per pass by our own route */}
            <img src={`/api/passes/${pass.token}/qr`} alt={`QR code for pass ${pass.code}`} width={112} height={112} className="h-28 w-28" />
          </div>
          <p className="mt-2 font-mono text-base font-bold tracking-[0.2em]" style={{ color: cat.color }}>
            {pass.code}
          </p>
          <div className="mt-1 flex items-center gap-2 text-[10px] text-slate-500">
            <span className="h-px w-8 bg-slate-300" aria-hidden />
            <Diamonds color={cat.color} />
            <span className="h-px w-8 bg-slate-300" aria-hidden />
          </div>
          <p className="mt-1 text-[10px] text-slate-500">Issued {ISSUED.format(pass.createdAt)}</p>
        </div>

        {/* Venue */}
        <footer className="relative mt-4">
          <p className="relative z-10 px-6 text-center text-[11px] font-bold leading-tight text-cye-blue">
            Original CNIC, student card or B-Form required for entry
          </p>
          <div className="relative -mt-1 h-24 [mask-image:linear-gradient(to_bottom,transparent,black_45%)]">
            <Image src="/brand/pass-venue-building.webp" alt={`${EVENT.venue}, ${EVENT.city}`} fill sizes="420px" className="object-cover object-center" />
          </div>
        </footer>
      </div>
    </article>
  );
}
