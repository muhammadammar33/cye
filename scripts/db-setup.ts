/**
 * Applies migrations, seeds site content (only into empty tables), default settings,
 * and the first admin from ADMIN_EMAIL / ADMIN_PASSWORD. Safe to run on every deploy.
 * Skips quietly when DATABASE_URL is not set.
 */
import bcrypt from "bcryptjs";
import { count } from "drizzle-orm";
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
    teamMin: c.teamMin, teamMax: c.teamMax, description: c.desc, sortOrder: i,
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

main().catch((err) => {
  console.error("[db-setup] failed:", err);
  process.exit(1);
});
