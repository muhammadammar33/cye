import "server-only";
import { and, asc, eq, ne, notInArray, sql } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { AMBASSADORS } from "@/data/ambassadors";
import * as E from "@/data/event";
import { db, schema as s } from "@/lib/db";
import { DEFAULT_SETTINGS, type SiteSettings } from "@/lib/defaults";
import { MIN_NOTICE_HIDE_AT, minRegistrations } from "@/lib/minRegistrations";

/** Ambassador role for a row that only holds an institute's coupon until its ambassadors are announced. */
export const COUPON_ONLY_ROLE = "Coupon only";

/** Cache tag for every piece of site content; admin edits expire it. */
export const CONTENT_TAG = "content";

export type Competition = { id?: number; name: string; vertical: string; audience: string; fee: string; teamMin: number; teamMax: number; desc: string; rulebook: string | null; focalName: string | null; focalPhone: string | null; focalName2?: string | null; focalPhone2?: string | null; prizes: string[]; preEvent?: boolean; onSpot?: boolean };
export type Person = { id?: number; name: string; role: string; photo: string | null };
export type Advisor = Person & { bio: string };
export type TeamMember = Person & { featured: boolean };
export type Tier = { id?: number; name: string; price: string; benefits: string[]; highlight: boolean };
export type Ambassador = { name: string; role: string; phone: string | null; photo: string | null };
/** One institute's ambassadors: the head first, then co-ambassadors. */
export type AmbassadorGroup = { institute: string; members: Ambassador[] };
export type Contact = { id?: number; label: string; phones: string[]; email: string };

const fallback = {
  competitions: (): Competition[] => E.COMPETITIONS.map((c) => ({ ...c })),
  guests: (): Person[] => E.GUESTS.map((g) => ({ name: g.name, role: g.role, photo: g.photo ? `/guests/${g.photo}.webp` : null })),
  advisory: (): Advisor[] => E.ADVISORY_BOARD.map((a) => ({ name: a.name, role: a.role, bio: a.bio, photo: `/advisory/${a.photo}.webp` })),
  team: (): TeamMember[] => E.TEAM.map((t, i) => ({ name: t.name, role: t.role, photo: `/team/${t.photo}.webp`, featured: i < 2 })),
  sponsorship: (): Tier[] => E.SPONSORSHIP.map((t) => ({ name: t.tier, price: t.price, benefits: t.benefits, highlight: t.highlight })),
  stalls: (): Tier[] => E.STALLS.map((t) => ({ name: t.tier, price: t.price, benefits: t.benefits, highlight: false })),
  ambassadors: (): AmbassadorGroup[] => groupAmbassadors(AMBASSADORS),
  contacts: (): Contact[] => E.CONTACTS.map((c) => ({ ...c })),
};

/**
 * Changes with every deploy, so a deploy starts with a fresh content cache. Without it the cache
 * survives deploys and changes made by db-setup patches only show up after the hourly refresh.
 */
const DEPLOY_ID = process.env.VERCEL_DEPLOYMENT_ID || process.env.VERCEL_GIT_COMMIT_SHA || "local";

/** Runs a cached DB read; without a database, or if the read fails, serves the defaults in data/event.ts. */
function cached<T>(key: string, read: () => Promise<T>, fallbackValue: () => T): () => Promise<T> {
  const load = unstable_cache(read, ["cye", DEPLOY_ID, key], { tags: [CONTENT_TAG], revalidate: 3600 });
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
      (c) => ({ id: c.id, name: c.name, vertical: c.vertical, audience: c.audience, fee: c.fee, teamMin: c.teamMin, teamMax: c.teamMax, desc: c.description, rulebook: c.rulebook, focalName: c.focalName, focalPhone: c.focalPhone, focalName2: c.focalName2, focalPhone2: c.focalPhone2, prizes: [c.prize1, c.prize2, c.prize3].filter((p): p is string => !!p?.trim()), preEvent: c.preEvent, onSpot: c.onSpot }),
    ),
  fallback.competitions,
);

const countRegistrations = unstable_cache(
  async () =>
    need()
      .select({ name: s.submissions.subject, count: sql<number>`count(*)::int` })
      .from(s.submissions)
      .where(and(eq(s.submissions.type, "competition"), notInArray(s.submissions.status, ["archived", "rejected"])))
      .groupBy(s.submissions.subject),
  ["cye", DEPLOY_ID, "registration-counts"],
  { revalidate: 600 },
);

/**
 * Competitions with at least 80% of their minimum registrations (prize pool ÷ fee); the site stops showing the
 * minimum note for them. Archived (including suspected spam) and rejected registrations don't count. Counts refresh
 * every 10 minutes and are never sent to the page, only the names.
 */
export async function getNearMinimum(competitions: Competition[]): Promise<string[]> {
  if (!db) return [];
  try {
    const counts = new Map((await countRegistrations()).map((r) => [r.name, r.count]));
    return competitions
      .filter((c) => {
        const min = minRegistrations(c.prizes, c.fee);
        return min !== null && (counts.get(c.name) ?? 0) >= min * MIN_NOTICE_HIDE_AT;
      })
      .map((c) => c.name);
  } catch (err) {
    console.error("[content] registration counts failed", err);
    return [];
  }
}

/** Groups ambassadors by institute, in the order each institute first appears; the head leads each group. */
function groupAmbassadors(rows: (Ambassador & { institute: string })[]): AmbassadorGroup[] {
  const groups = new Map<string, Ambassador[]>();
  for (const { institute, ...a } of rows) {
    const key = institute.trim();
    groups.set(key, [...(groups.get(key) ?? []), a]);
  }
  const isHead = (a: Ambassador) => /head/i.test(a.role);
  return [...groups].map(([institute, members]) => ({ institute, members: [...members.filter(isHead), ...members.filter((m) => !isHead(m))] }));
}

export const getAmbassadors = cached(
  "ambassadors",
  async () =>
    groupAmbassadors(
      // "Coupon only" rows hold a coupon for an institute whose ambassadors aren't announced yet: not listed publicly.
      (await need().select().from(s.ambassadors).where(and(eq(s.ambassadors.active, true), ne(s.ambassadors.role, COUPON_ONLY_ROLE))).orderBy(asc(s.ambassadors.sortOrder), asc(s.ambassadors.id))).map((a) => ({
        institute: a.institute, name: a.name, role: a.role, phone: a.phone, photo: a.photo,
      })),
    ),
  fallback.ambassadors,
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

// Only the saved rows are cached. Defaults are merged on every read, so a setting added in code
// (e.g. a new registration switch or inbox) works straight after a deploy instead of being
// missing until the cached copy expires.
const getSettingRows = cached(
  "settings-rows",
  async () => (await need().select({ key: s.settings.key, value: s.settings.value }).from(s.settings)) as { key: string; value: unknown }[],
  () => [],
);

export async function getSettings(): Promise<SiteSettings> {
  const out = structuredClone(DEFAULT_SETTINGS) as SiteSettings;
  for (const row of await getSettingRows()) {
    if (row.key in out && row.value && typeof row.value === "object") {
      const key = row.key as keyof SiteSettings;
      (out as Record<string, unknown>)[key] = { ...out[key], ...(row.value as object) };
    }
  }
  return out;
}
