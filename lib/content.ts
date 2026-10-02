import "server-only";
import { asc, eq } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import * as E from "@/data/event";
import { db, schema as s } from "@/lib/db";
import { DEFAULT_SETTINGS, type SiteSettings } from "@/lib/defaults";

/** Cache tag for every piece of site content; admin edits expire it. */
export const CONTENT_TAG = "content";

export type Competition = { id?: number; name: string; vertical: string; audience: string; fee: string; teamMin: number; teamMax: number; desc: string };
export type Person = { id?: number; name: string; role: string; photo: string | null };
export type Advisor = Person & { bio: string };
export type TeamMember = Person & { featured: boolean };
export type Tier = { id?: number; name: string; price: string; benefits: string[]; highlight: boolean };
export type Contact = { id?: number; label: string; phones: string[]; email: string };

const fallback = {
  competitions: (): Competition[] => E.COMPETITIONS.map((c) => ({ ...c })),
  guests: (): Person[] => E.GUESTS.map((g) => ({ name: g.name, role: g.role, photo: g.photo ? `/guests/${g.photo}.webp` : null })),
  advisory: (): Advisor[] => E.ADVISORY_BOARD.map((a) => ({ name: a.name, role: a.role, bio: a.bio, photo: `/advisory/${a.photo}.webp` })),
  team: (): TeamMember[] => E.TEAM.map((t, i) => ({ name: t.name, role: t.role, photo: `/team/${t.photo}.webp`, featured: i < 2 })),
  sponsorship: (): Tier[] => E.SPONSORSHIP.map((t) => ({ name: t.tier, price: t.price, benefits: t.benefits, highlight: t.highlight })),
  stalls: (): Tier[] => E.STALLS.map((t) => ({ name: t.tier, price: t.price, benefits: t.benefits, highlight: false })),
  contacts: (): Contact[] => E.CONTACTS.map((c) => ({ ...c })),
};

/** Runs a cached DB read; without a database, or if the read fails, serves the defaults in data/event.ts. */
function cached<T>(key: string, read: () => Promise<T>, fallbackValue: () => T): () => Promise<T> {
  const load = unstable_cache(read, ["cye", key], { tags: [CONTENT_TAG], revalidate: 3600 });
  return async () => {
    if (!db) return fallbackValue();
    try {
      return await load();
    } catch (err) {
      console.error(`[content] ${key} failed, using defaults`, err);
      return fallbackValue();
    }
  };
}

function need() {
  if (!db) throw new Error("no db");
  return db;
}

export const getCompetitions = cached(
  "competitions",
  async () =>
    (await need().select().from(s.competitions).where(eq(s.competitions.active, true)).orderBy(asc(s.competitions.sortOrder), asc(s.competitions.id))).map(
      (c) => ({ id: c.id, name: c.name, vertical: c.vertical, audience: c.audience, fee: c.fee, teamMin: c.teamMin, teamMax: c.teamMax, desc: c.description }),
    ),
  fallback.competitions,
);

export const getGuests = cached(
  "guests",
  async () =>
    (await need().select().from(s.guests).where(eq(s.guests.active, true)).orderBy(asc(s.guests.sortOrder), asc(s.guests.id))).map((g) => ({
      id: g.id, name: g.name, role: g.role, photo: g.photo,
    })),
  fallback.guests,
);

export const getAdvisory = cached(
  "advisory",
  async () =>
    (await need().select().from(s.advisoryMembers).where(eq(s.advisoryMembers.active, true)).orderBy(asc(s.advisoryMembers.sortOrder), asc(s.advisoryMembers.id))).map(
      (a) => ({ id: a.id, name: a.name, role: a.role, bio: a.bio, photo: a.photo }),
    ),
  fallback.advisory,
);

export const getTeam = cached(
  "team",
  async () =>
    (await need().select().from(s.teamMembers).where(eq(s.teamMembers.active, true)).orderBy(asc(s.teamMembers.sortOrder), asc(s.teamMembers.id))).map(
      (t) => ({ id: t.id, name: t.name, role: t.role, photo: t.photo, featured: t.featured }),
    ),
  fallback.team,
);

async function readTiers(kind: "sponsorship" | "stall"): Promise<Tier[]> {
  const rows = await need().select().from(s.tiers).where(eq(s.tiers.kind, kind)).orderBy(asc(s.tiers.sortOrder), asc(s.tiers.id));
  return rows.filter((t) => t.active).map((t) => ({ id: t.id, name: t.name, price: t.price, benefits: t.benefits, highlight: t.highlight }));
}
export const getSponsorshipTiers = cached("sponsorship", () => readTiers("sponsorship"), fallback.sponsorship);
export const getStallTiers = cached("stalls", () => readTiers("stall"), fallback.stalls);

export const getContacts = cached(
  "contacts",
  async () =>
    (await need().select().from(s.contacts).where(eq(s.contacts.active, true)).orderBy(asc(s.contacts.sortOrder), asc(s.contacts.id))).map((c) => ({
      id: c.id, label: c.label, phones: c.phones, email: c.email,
    })),
  fallback.contacts,
);

export const getSettings = cached(
  "settings",
  async (): Promise<SiteSettings> => {
    const rows = await need().select().from(s.settings);
    const out = structuredClone(DEFAULT_SETTINGS) as SiteSettings;
    for (const row of rows) {
      if (row.key in out) {
        const key = row.key as keyof SiteSettings;
        (out as Record<string, unknown>)[key] = { ...out[key], ...(row.value as object) };
      }
    }
    return out;
  },
  () => structuredClone(DEFAULT_SETTINGS),
);
