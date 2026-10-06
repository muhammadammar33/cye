/**
 * Applies migrations, seeds site content (only into empty tables), default settings,
 * and the first admin from ADMIN_EMAIL / ADMIN_PASSWORD. Safe to run on every deploy.
 * Skips quietly when DATABASE_URL is not set.
 */
import bcrypt from "bcryptjs";
import { count, eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import type { PgTable } from "drizzle-orm/pg-core";
import * as s from "../lib/db/schema";
import * as E from "../data/event";
import { DEFAULT_SETTINGS } from "../lib/defaults";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.log("[db-setup] DATABASE_URL not set, skipping.");
    return;
  }
  const client = postgres(url, { prepare: false, max: 1, onnotice: () => {} });
  const db = drizzle(client, { schema: s });

  await migrate(db, { migrationsFolder: "drizzle" });
  console.log("[db-setup] migrations applied");

  async function seed<T extends PgTable>(table: T, rows: T["$inferInsert"][], label: string) {
    const [{ n }] = await db.select({ n: count() }).from(table as never);
    if (n > 0 || rows.length === 0) return;
    await db.insert(table).values(rows as never);
    console.log(`[db-setup] seeded ${rows.length} ${label}`);
  }

  await seed(s.competitions, E.COMPETITIONS.map((c, i) => ({
    name: c.name, vertical: c.vertical, audience: c.audience, fee: c.fee,
    teamMin: c.teamMin, teamMax: c.teamMax, description: c.desc, rulebook: c.rulebook, sortOrder: i,
  })), "competitions");
  await seed(s.guests, E.GUESTS.map((g, i) => ({
    name: g.name, role: g.role, photo: g.photo ? `/guests/${g.photo}.webp` : null, sortOrder: i,
  })), "guests");
  await seed(s.advisoryMembers, E.ADVISORY_BOARD.map((a, i) => ({
    name: a.name, role: a.role, bio: a.bio, photo: `/advisory/${a.photo}.webp`, sortOrder: i,
  })), "advisory members");
  await seed(s.teamMembers, E.TEAM.map((t, i) => ({
    name: t.name, role: t.role, photo: `/team/${t.photo}.webp`, featured: i < 2, sortOrder: i,
  })), "team members");
  await seed(s.tiers, [
    ...E.SPONSORSHIP.map((t, i) => ({ kind: "sponsorship" as const, name: t.tier, price: t.price, benefits: t.benefits, highlight: t.highlight, sortOrder: i })),
    ...E.STALLS.map((t, i) => ({ kind: "stall" as const, name: t.tier, price: t.price, benefits: t.benefits, sortOrder: 100 + i })),
  ], "tiers");
  await seed(s.contacts, E.CONTACTS.map((c, i) => ({ label: c.label, phones: c.phones, email: c.email, sortOrder: i })), "contacts");

  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    await db.insert(s.settings).values({ key, value }).onConflictDoNothing();
  }

  await applyPatches(db);

  const [{ n: adminCount }] = await db.select({ n: count() }).from(s.admins);
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (adminCount === 0) {
    if (email && password) {
      await db.insert(s.admins).values({ email, name: "Admin", passwordHash: await bcrypt.hash(password, 12) });
      console.log(`[db-setup] created admin ${email}`);
    } else {
      console.warn("[db-setup] no admins yet: set ADMIN_EMAIL and ADMIN_PASSWORD and run again to create the first one.");
    }
  }

  await client.end();
}

type Db = ReturnType<typeof drizzle<typeof s>>;

/**
 * One-time content changes for databases that were seeded before the change. Each patch runs once
 * (recorded in settings.applied_patches) and matches rows by name, so admin edits elsewhere are kept.
 */
async function applyPatches(db: Db) {
  const [row] = await db.select().from(s.settings).where(eq(s.settings.key, "applied_patches"));
  const applied = new Set((row?.value as string[] | undefined) ?? []);
  const byName = (name: string) => sql`lower(${s.competitions.name}) = ${name.toLowerCase()}`;
  const comp = (name: string) => E.COMPETITIONS.find((c) => c.name === name)!;

  if (!applied.has("2026-10-rulebooks")) {
    // Rule books and official team sizes.
    for (const c of E.COMPETITIONS) {
      if (!c.rulebook) continue;
      await db.update(s.competitions).set({ rulebook: c.rulebook, teamMin: c.teamMin, teamMax: c.teamMax }).where(byName(c.name));
    }
    for (const name of ["Speed Programming", "Speech (English / Urdu)"]) {
      await db.update(s.competitions).set({ description: comp(name).desc }).where(byName(name));
    }
    // Capture the Flag and Cyber Security become one competition, per rule book 07.
    const ctf = comp("Cyber Security (Capture The Flag)");
    const merged = await db
      .update(s.competitions)
      .set({ name: ctf.name, fee: ctf.fee, teamMin: ctf.teamMin, teamMax: ctf.teamMax, description: ctf.desc, rulebook: ctf.rulebook })
      .where(byName("Capture the Flag"))
      .returning({ id: s.competitions.id });
    if (merged.length) await db.update(s.competitions).set({ active: false }).where(byName("Cyber Security"));
    // New: Debate.
    const [debate] = await db.select({ id: s.competitions.id }).from(s.competitions).where(byName("Debate"));
    if (!debate) {
      const [anchor] = await db.select({ sortOrder: s.competitions.sortOrder }).from(s.competitions).where(byName("Youth Parliament"));
      const d = comp("Debate");
      await db.insert(s.competitions).values({
        name: d.name, vertical: d.vertical, audience: d.audience, fee: d.fee, teamMin: d.teamMin, teamMax: d.teamMax,
        description: d.desc, rulebook: d.rulebook, sortOrder: anchor?.sortOrder ?? 100,
      });
    }
    applied.add("2026-10-rulebooks");
    console.log("[db-setup] applied patch 2026-10-rulebooks");
  }

  const value = [...applied];
  await db.insert(s.settings).values({ key: "applied_patches", value }).onConflictDoUpdate({ target: s.settings.key, set: { value } });
}

main().catch((err) => {
  console.error("[db-setup] failed:", err);
  process.exit(1);
});
