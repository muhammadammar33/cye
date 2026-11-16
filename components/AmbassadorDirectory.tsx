"use client";

import { ChevronDown, Phone, Search } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import type { Ambassador, AmbassadorGroup } from "@/lib/content";
import { cn } from "@/lib/cn";
import { whatsappLink } from "@/lib/phone";

/** Institutes shown before "Show all", so the application form stays close. */
const FIRST = 9;

const initials = (name: string) =>
  name
    .replace(/^(m\.?|muhammad|syed|dr\.?)\s+/i, "")
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

function Avatar({ person, size, className }: { person: Ambassador; size: number; className?: string }) {
  return (
    <span
      className={cn("relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-cye-mist font-heading font-bold text-cye-blue ring-2 ring-white", className)}
      style={{ width: size, height: size, fontSize: size * 0.34 }}
    >
      {person.photo ? <Image src={person.photo} alt="" fill sizes={`${size}px`} className="object-cover" /> : initials(person.name)}
    </span>
  );
}

function InstituteCard({ group, open, onToggle }: { group: AmbassadorGroup; open: boolean; onToggle: () => void }) {
  const head = group.members.find((m) => /head/i.test(m.role));
  const co = group.members.filter((m) => m !== head);
  return (
    <article className="flex flex-col rounded-3xl border border-cye-blue/10 bg-white p-5 shadow-card">
      {/* Two-line name slot keeps cards in a row the same height. */}
      <h3 className="font-heading text-base font-extrabold leading-snug text-cye-blue sm:line-clamp-2 sm:min-h-[2lh]">{group.institute}</h3>
      {head ? (
        <div className="mt-4 flex min-h-16 items-center gap-3">
          <Avatar person={head} size={60} className="ring-cye-orange/40" />
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-wide text-cye-orange">Head Ambassador</p>
            <p className="font-heading font-bold leading-snug text-cye-ink">{head.name}</p>
            {head.phone ? (
              <a
                href={whatsappLink(head.phone)}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`WhatsApp ${head.name} on ${head.phone}`}
                className="mt-0.5 inline-flex items-center gap-1 whitespace-nowrap text-sm font-semibold text-cye-orange hover:text-cye-orange-lt"
              >
                <Phone className="h-3.5 w-3.5" aria-hidden />
                {head.phone}
              </a>
            ) : null}
          </div>
        </div>
      ) : null}

      {co.length ? (
        <div className="mt-4 border-t border-cye-blue/10 pt-4">
          <button type="button" onClick={onToggle} aria-expanded={open} className="flex w-full items-center gap-3 text-left">
            <span className="flex -space-x-2.5">
              {co.slice(0, 5).map((m, i) => (
                <Avatar key={i} person={m} size={32} />
              ))}
            </span>
            <span className="flex-1 whitespace-nowrap text-sm font-semibold text-cye-ink/70">
              {co.length} co-ambassador{co.length === 1 ? "" : "s"}
            </span>
            <ChevronDown className={cn("h-4 w-4 text-cye-ink/45 transition-transform", open && "rotate-180")} aria-hidden />
          </button>
          {open ? (
            <ul className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2.5">
              {co.map((m, i) => (
                <li key={i} className="flex min-w-0 items-center gap-2">
                  <Avatar person={m} size={36} />
                  <span className="min-w-0 text-[13px] font-medium leading-tight text-cye-ink/80">{m.name}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : (
        // Same height as the co-ambassadors row, so cards line up.
        <p className="mt-4 flex h-[49px] items-end border-t border-cye-blue/10 text-sm text-cye-ink/45">Co-ambassadors coming soon</p>
      )}
    </article>
  );
}

/** Every institute's campus ambassadors, with a search box. Head ambassadors show a WhatsApp number. */
export function AmbassadorDirectory({ groups }: { groups: AmbassadorGroup[] }) {
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [opened, setOpened] = useState<Set<string>>(new Set());
  const total = groups.reduce((n, g) => n + g.members.length, 0);

  const q = norm(query);
  const matches = useMemo(() => {
    if (!q) return groups.map((g) => ({ group: g, byMember: false }));
    return groups.flatMap((g) => {
      if (norm(g.institute).includes(q)) return [{ group: g, byMember: false }];
      // A co-ambassador's name matched: open the card so they are visible.
      if (g.members.some((m) => norm(m.name).includes(q))) return [{ group: g, byMember: true }];
      return [];
    });
  }, [groups, q]);
  const shown = q || showAll ? matches : matches.slice(0, FIRST);

  const toggle = (institute: string) =>
    setOpened((prev) => {
      const next = new Set(prev);
      if (next.has(institute)) next.delete(institute);
      else next.add(institute);
      return next;
    });

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-semibold text-cye-ink/60">
          {total} ambassadors across {groups.length} institutes
        </p>
        <label className="relative block sm:w-80">
          <span className="sr-only">Search institute or ambassador</span>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-cye-ink/40" aria-hidden />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your institute or a name"
            className="w-full rounded-full border border-cye-blue/15 bg-white py-2.5 pl-10 pr-4 text-sm text-cye-ink placeholder:text-cye-ink/40 focus:border-cye-orange focus:outline-none focus:ring-2 focus:ring-cye-orange/20"
          />
        </label>
      </div>

      {shown.length ? (
        <div className="mt-6 grid items-start gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map(({ group, byMember }) => (
            <InstituteCard key={group.institute} group={group} open={byMember || opened.has(group.institute)} onToggle={() => toggle(group.institute)} />
          ))}
        </div>
      ) : (
        <p className="mt-6 rounded-2xl bg-cye-mist px-5 py-4 text-sm text-cye-ink/70">
          No ambassador found for &ldquo;{query}&rdquo;. Your institute may not have one yet: apply below to become its ambassador.
        </p>
      )}

      {!q && !showAll && groups.length > FIRST ? (
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setShowAll(true)}
            className="inline-flex items-center gap-2 rounded-full border border-cye-blue/20 bg-white px-5 py-2.5 text-sm font-semibold text-cye-blue hover:border-cye-orange hover:text-cye-orange"
          >
            Show all {groups.length} institutes
            <ChevronDown className="h-4 w-4" aria-hidden />
          </button>
        </div>
      ) : null}
    </div>
  );
}
