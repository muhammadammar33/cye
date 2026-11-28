"use client";

import { FileText, MapPin, Phone, Trophy, Users, Wallet } from "lucide-react";
import { useState } from "react";
import { EVENT, VERTICALS } from "@/data/event";
import type { Competition } from "@/lib/content";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { FadeIn } from "@/components/ui/FadeIn";
import { cn } from "@/lib/cn";
import { focalsOf } from "@/lib/focals";
import { minRegistrations } from "@/lib/minRegistrations";
import { phoneList, whatsappLink } from "@/lib/phone";

const PLACES = ["1st", "2nd", "3rd"];

/** Total of the listed prizes, e.g. "PKR 90,000", or null when an amount can't be read as a number. */
function prizePool(prizes: string[]) {
  const amounts = prizes.map((p) => Number(p.replace(/[^\d]/g, "")));
  if (amounts.length < 2 || amounts.some((n) => !n)) return null;
  return `PKR ${amounts.reduce((a, b) => a + b, 0).toLocaleString("en-US")}`;
}

export const VERTICAL_ACCENT: Record<string, string> = {
  TechNexus: "text-cye-blue bg-cye-blue/10",
  Spectrum: "text-cye-orange bg-cye-orange/10",
  VentureX: "text-amber-700 bg-amber-100",
  BioNova: "text-emerald-700 bg-emerald-100",
  "Talent Fiesta": "text-violet-700 bg-violet-100",
  Literary: "text-rose-700 bg-rose-100",
};

export function teamLabel(min: number, max: number) {
  if (max === 1) return "Individual";
  if (min === max) return `${max} members`;
  return `${min}–${max} members`;
}

/** `nearMinimum`: competitions with 80% or more of their minimum registrations; their minimum note is hidden. */
export function CompetitionCatalog({ competitions, onSelect, nearMinimum = [] }: { competitions: Competition[]; onSelect: (name: string) => void; nearMinimum?: string[] }) {
  const [filter, setFilter] = useState("All");
  // Verticals first (in their usual order), then any extra categories such as Literary; empty ones are skipped.
  const filters = [
    "All",
    ...new Set([...VERTICALS.map((vertical) => vertical.name), ...competitions.map((item) => item.vertical)]),
  ].filter((name) => name === "All" || competitions.some((item) => item.vertical === name));
  const items = filter === "All" ? competitions : competitions.filter((item) => item.vertical === filter);

  return (
    <>
      <div role="tablist" aria-label="Filter competitions by vertical" className="mt-10 flex flex-wrap justify-center gap-2">
        {filters.map((name) => (
          <button
            key={name}
            type="button"
            role="tab"
            aria-selected={filter === name}
            onClick={() => setFilter(name)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold transition-colors",
              filter === name
                ? "bg-grad-blue text-white shadow-card"
                : "border border-cye-blue/15 bg-white text-cye-ink/70 hover:text-cye-blue",
            )}
          >
            {name}
          </button>
        ))}
      </div>
      <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {items.map((item, index) => (
          <FadeIn key={item.name} delay={index * 0.04}>
            <Card className="flex h-full flex-col p-6">
              <span
                className={`inline-flex w-fit rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wide ${VERTICAL_ACCENT[item.vertical] ?? VERTICAL_ACCENT.TechNexus}`}
              >
                {item.vertical}
              </span>
              {/* Two-line title slot keeps the audience line and description aligned across a row. */}
              <h3 className="mt-4 line-clamp-2 min-h-[2lh] font-heading text-lg font-extrabold leading-snug text-cye-blue">{item.name}</h3>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-cye-ink/45">
                {item.audience}
              </p>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-cye-ink/70">{item.desc}</p>
              <dl className="mt-4 grid grid-cols-2 gap-2 text-xs">
                {/* On-spot competitions show no fee: entries and payment happen at the venue. */}
                {item.onSpot ? null : (
                  <div className="rounded-2xl bg-cye-mist px-3 py-2">
                    <dt className="flex items-center gap-1 font-semibold uppercase tracking-wide text-cye-ink/45">
                      <Wallet className="h-3.5 w-3.5 text-cye-orange" aria-hidden />
                      Fee
                    </dt>
                    <dd className="mt-0.5 min-h-[2lh] font-heading font-bold leading-snug text-cye-blue">{item.fee}</dd>
                  </div>
                )}
                <div className={cn("rounded-2xl bg-cye-mist px-3 py-2", item.onSpot && "col-span-2")}>
                  <dt className="flex items-center gap-1 font-semibold uppercase tracking-wide text-cye-ink/45">
                    <Users className="h-3.5 w-3.5 text-cye-orange" aria-hidden />
                    Team
                  </dt>
                  <dd className="mt-0.5 min-h-[2lh] font-heading font-bold leading-snug text-cye-blue">
                    {teamLabel(item.teamMin, item.teamMax)}
                  </dd>
                </div>
                {item.prizes.length ? (
                  <div className="col-span-2 rounded-2xl bg-cye-mist px-3 py-2">
                    <dt className="flex items-center justify-between gap-2 font-semibold uppercase tracking-wide text-cye-ink/45">
                      <span className="flex items-center gap-1">
                        <Trophy className="h-3.5 w-3.5 text-cye-orange" aria-hidden />
                        Prizes
                      </span>
                      {prizePool(item.prizes) ? (
                        <span className="normal-case tracking-normal text-cye-orange">Pool {prizePool(item.prizes)}</span>
                      ) : null}
                    </dt>
                    <dd className="mt-1 grid grid-cols-3 gap-1.5">
                      {item.prizes.map((prize, i) => (
                        <span key={i} className="rounded-xl bg-white px-1.5 py-1 text-center">
                          <span className="block text-[10px] font-bold uppercase tracking-wide text-cye-ink/45">{PLACES[i]}</span>
                          <span className="block font-heading font-bold leading-snug text-cye-blue">{prize.replace(/^(PKR|Rs\.?)\s*/i, "")}</span>
                        </span>
                      ))}
                    </dd>
                    {minRegistrations(item.prizes, item.fee) && !nearMinimum.includes(item.name) ? (
                      <p className="mt-2 flex gap-1 text-[11px] font-medium leading-snug text-red-600">
                        <span aria-hidden>★</span>
                        <span>
                          Prizes are based on a minimum of {minRegistrations(item.prizes, item.fee)} registrations. With more or fewer registrations, prizes may go up or down accordingly.
                        </span>
                      </p>
                    ) : null}
                  </div>
                ) : null}
                {focalsOf(item).length ? (
                  <div className="col-span-2 rounded-2xl bg-cye-mist px-3 py-2">
                    <dt className="flex items-center gap-1 font-semibold uppercase tracking-wide text-cye-ink/45">
                      <Phone className="h-3.5 w-3.5 text-cye-orange" aria-hidden />
                      {focalsOf(item).length > 1 ? "Focal persons" : "Focal person"}
                    </dt>
                    {focalsOf(item).map((f) => (
                      <dd key={f.name} className="mt-0.5 font-heading font-bold leading-snug text-cye-blue">
                        {f.name}
                        {f.phone
                          ? phoneList(f.phone).map((n) => (
                              <a
                                key={n}
                                href={whatsappLink(n)}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`WhatsApp ${f.name} on ${n}`}
                                className="block whitespace-nowrap font-sans font-semibold text-cye-orange hover:text-cye-orange-lt"
                              >
                                {n}
                              </a>
                            ))
                          : null}
                      </dd>
                    ))}
                  </div>
                ) : null}
              </dl>
              {item.onSpot ? (
                // No online registration: entries are taken at the venue on event day.
                <p className="mt-5 flex min-h-12 w-full items-center justify-center gap-1.5 rounded-full border-2 border-dashed border-cye-orange/50 bg-cye-orange/5 px-4 py-2 text-center text-xs font-bold uppercase leading-snug tracking-wide text-cye-orange">
                  <MapPin className="h-4 w-4 shrink-0" aria-hidden />
                  On-spot registration on event day, {EVENT.date.replace(/ \d{4}$/, "")}
                </p>
              ) : (
                <Button
                  href="#competition-register"
                  onClick={() => onSelect(item.name)}
                  variant="secondary"
                  className="mt-5 w-full"
                >
                  Register
                </Button>
              )}
              {item.rulebook ? (
                <a
                  href={item.rulebook}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-cye-orange hover:text-cye-orange-lt"
                >
                  <FileText className="h-4 w-4" aria-hidden />
                  View rule book
                </a>
              ) : null}
            </Card>
          </FadeIn>
        ))}
      </div>
    </>
  );
}
