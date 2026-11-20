/**
 * Applies migrations, seeds site content (only into empty tables), default settings,
 * and the first admin from ADMIN_EMAIL / ADMIN_PASSWORD. Safe to run on every deploy.
 * Skips quietly when DATABASE_URL is not set.
 */
import bcrypt from "bcryptjs";
import { and, count, eq, inArray, isNull, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import type { PgTable } from "drizzle-orm/pg-core";
import * as s from "../lib/db/schema";
import { AMBASSADORS } from "../data/ambassadors";
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

  await seed(s.ambassadors, AMBASSADORS.map((a, i) => ({ ...a, sortOrder: i })), "ambassadors");
  await seed(s.competitions, E.COMPETITIONS.map((c, i) => ({
    name: c.name, vertical: c.vertical, audience: c.audience, fee: c.fee,
    teamMin: c.teamMin, teamMax: c.teamMax, description: c.desc, rulebook: c.rulebook, focalName: c.focalName, focalPhone: c.focalPhone,
    focalName2: "focalName2" in c ? c.focalName2 : null, focalPhone2: "focalPhone2" in c ? c.focalPhone2 : null,
    prize1: c.prizes[0], prize2: c.prizes[1], prize3: c.prizes[2], sortOrder: i,
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
    applied.add("2026-10-rulebooks");
    console.log("[db-setup] applied patch 2026-10-rulebooks");
  }

  if (!applied.has("2026-10-ctf-fee")) {
    // Shorter fee label so the card stays the same height as its neighbours (early bird / regular).
    await db.update(s.competitions).set({ fee: "PKR 1,500 / 1,800" }).where(eq(s.competitions.fee, "PKR 1,500 early bird, PKR 1,800 regular"));
    applied.add("2026-10-ctf-fee");
    console.log("[db-setup] applied patch 2026-10-ctf-fee");
  }

  if (!applied.has("2026-10-ctf-website-fee")) {
    // Fees come from the website, not the rule books: back to Capture the Flag's original PKR 2,000.
    await db
      .update(s.competitions)
      .set({ fee: "PKR 2,000" })
      .where(and(byName("Cyber Security (Capture The Flag)"), inArray(s.competitions.fee, ["PKR 1,500 / 1,800", "PKR 1,500 early bird, PKR 1,800 regular"])));
    applied.add("2026-10-ctf-website-fee");
    console.log("[db-setup] applied patch 2026-10-ctf-website-fee");
  }

  if (!applied.has("2026-11-hackathon-team-size")) {
    // Updated rule book 04 allows 1 to 5 members. Only changes the row if it still has the old 3 to 5.
    await db.update(s.competitions).set({ teamMin: 1 }).where(and(byName("Hackathon"), eq(s.competitions.teamMin, 3), eq(s.competitions.teamMax, 5)));
    applied.add("2026-11-hackathon-team-size");
    console.log("[db-setup] applied patch 2026-11-hackathon-team-size");
  }

  if (!applied.has("2026-11-arts-rulebook")) {
    // Arts had no rule book. Only fills it in if the row still has none, so an admin-set link is kept.
    await db.update(s.competitions).set({ rulebook: "/rulebooks/19-arts.pdf" }).where(and(byName("Arts"), or(isNull(s.competitions.rulebook), eq(s.competitions.rulebook, ""))));
    applied.add("2026-11-arts-rulebook");
    console.log("[db-setup] applied patch 2026-11-arts-rulebook");
  }

  if (!applied.has("2026-11-focal-persons")) {
    // Focal person per competition. Only fills rows that have none yet, so admin edits are kept.
    for (const c of E.COMPETITIONS) {
      await db.update(s.competitions).set({ focalName: c.focalName, focalPhone: c.focalPhone }).where(and(byName(c.name), isNull(s.competitions.focalName)));
    }
    applied.add("2026-11-focal-persons");
    console.log("[db-setup] applied patch 2026-11-focal-persons");
  }

  if (!applied.has("2026-11-arts-focal-person")) {
    // New Arts focal person. Only replaces the previous one, so a different name set in admin is kept.
    await db
      .update(s.competitions)
      .set({ focalName: "Kaleem Ul Haq", focalPhone: "+92 344 0442365" })
      .where(and(byName("Arts"), or(isNull(s.competitions.focalName), eq(s.competitions.focalName, "Anas Mehmood"))));
    applied.add("2026-11-arts-focal-person");
    console.log("[db-setup] applied patch 2026-11-arts-focal-person");
  }

  if (!applied.has("2026-11-prizes")) {
    // Prize money per competition from the official prize list. Only fills rows without prizes, so admin edits are kept.
    for (const c of E.COMPETITIONS) {
      if (!c.prizes.length) continue;
      await db
        .update(s.competitions)
        .set({ prize1: c.prizes[0], prize2: c.prizes[1], prize3: c.prizes[2] })
        .where(and(byName(c.name), isNull(s.competitions.prize1), isNull(s.competitions.prize2), isNull(s.competitions.prize3)));
    }
    applied.add("2026-11-prizes");
    console.log("[db-setup] applied patch 2026-11-prizes");
  }

  if (!applied.has("2026-11-ambassador-coupons")) {
    // A coupon code for every head ambassador. Only fills heads without one, so codes set in admin are kept.
    for (const a of AMBASSADORS) {
      if (!a.coupon) continue;
      await db
        .update(s.ambassadors)
        .set({ coupon: a.coupon })
        .where(and(eq(s.ambassadors.institute, a.institute), eq(s.ambassadors.role, "Head Ambassador"), isNull(s.ambassadors.coupon)));
    }
    applied.add("2026-11-ambassador-coupons");
    console.log("[db-setup] applied patch 2026-11-ambassador-coupons");
  }

  if (!applied.has("2026-11-e-gaming")) {
    // New E-Gaming competitions (PUBG, Tekken, FIFA), added at the end. Skipped if a row with the name exists.
    const [{ max }] = await db.select({ max: sql<number>`coalesce(max(${s.competitions.sortOrder}), 0)` }).from(s.competitions);
    let order = Number(max);
    for (const c of E.COMPETITIONS.filter((x) => x.name.startsWith("E-Gaming:"))) {
      const [exists] = await db.select({ id: s.competitions.id }).from(s.competitions).where(byName(c.name)).limit(1);
      if (exists) continue;
      await db.insert(s.competitions).values({
        name: c.name, vertical: c.vertical, audience: c.audience, fee: c.fee, teamMin: c.teamMin, teamMax: c.teamMax,
        description: c.desc, rulebook: c.rulebook, focalName: c.focalName, focalPhone: c.focalPhone, sortOrder: ++order,
      });
    }
    applied.add("2026-11-e-gaming");
    console.log("[db-setup] applied patch 2026-11-e-gaming");
  }

  if (!applied.has("2026-11-ambassador-names")) {
    // Name corrections sent by the ambassadors. Only rows still carrying the old name change, so admin edits are kept.
    const head = (institute: string, from: string) =>
      and(eq(s.ambassadors.institute, institute), eq(s.ambassadors.role, "Head Ambassador"), eq(s.ambassadors.name, from));
    await db.update(s.ambassadors).set({ name: "Ariba Rehman" }).where(head("Riphah International University, Gulberg", "Areeba Rashid"));
    await db.update(s.ambassadors).set({ name: "Muhammad Sulaiman Javed" }).where(head("Quaid-i-Azam University", "M Salman"));
    // FUUAST: Muhammad Ali Raza is the head (he was listed as a co-ambassador, and the head as Ali Asghar).
    const moved = await db
      .update(s.ambassadors)
      .set({ name: "Muhammad Ali Raza", photo: "/ambassadors/muhammad-ali-raza-fuuast.webp" })
      .where(head("FUUAST", "Ali Asghar"))
      .returning({ id: s.ambassadors.id });
    if (moved.length) {
      await db
        .delete(s.ambassadors)
        .where(and(eq(s.ambassadors.institute, "FUUAST"), eq(s.ambassadors.role, "Co-Ambassador"), eq(s.ambassadors.name, "Muhammad Ali Raza")));
    }
    applied.add("2026-11-ambassador-names");
    console.log("[db-setup] applied patch 2026-11-ambassador-names");
  }

  if (!applied.has("2026-11-ambassador-names-2")) {
    // More spelling corrections from ambassadors. Only rows still carrying the old spelling change.
    const renames: [institute: string, from: string, to: string][] = [["NUST", "Tehreem Mansha", "Tahreem Mansha"]];
    for (const [institute, from, to] of renames) {
      await db.update(s.ambassadors).set({ name: to }).where(and(eq(s.ambassadors.institute, institute), eq(s.ambassadors.name, from)));
    }
    applied.add("2026-11-ambassador-names-2");
    console.log("[db-setup] applied patch 2026-11-ambassador-names-2");
  }

  if (!applied.has("2026-11-ambassador-phones")) {
    // Phone corrections for head ambassadors. Only rows still carrying the old number change.
    const fixes: [institute: string, from: string, to: string][] = [["PIEAS", "+92 313 5590341", "+92 326 8210196"]];
    for (const [institute, from, to] of fixes) {
      await db
        .update(s.ambassadors)
        .set({ phone: to })
        .where(and(eq(s.ambassadors.institute, institute), eq(s.ambassadors.role, "Head Ambassador"), eq(s.ambassadors.phone, from)));
    }
    applied.add("2026-11-ambassador-phones");
    console.log("[db-setup] applied patch 2026-11-ambassador-phones");
  }

  if (!applied.has("2026-11-ambassador-names-3")) {
    // Spelling correction from an ambassador. Only the row still carrying the old spelling changes.
    await db
      .update(s.ambassadors)
      .set({ name: "Haleema Sadia" })
      .where(and(eq(s.ambassadors.institute, "Hamdard University"), eq(s.ambassadors.name, "Haleem Sadia")));
    applied.add("2026-11-ambassador-names-3");
    console.log("[db-setup] applied patch 2026-11-ambassador-names-3");
  }

  if (!applied.has("2026-11-ambassador-fixes-4")) {
    // Fixes sent by the ambassadors. Each only touches rows still in their old state, so admin edits are kept.
    const A = s.ambassadors;
    await db.update(A).set({ phone: "+92 345 5310038" }).where(and(eq(A.institute, "Fazaia College"), eq(A.role, "Head Ambassador"), eq(A.phone, "+92 331 7397495")));
    // PIEAS: Muhammad Abdullah was listed twice with the same photo.
    await db.delete(A).where(and(eq(A.institute, "PIEAS"), eq(A.name, "Muhammad Abdullah"), eq(A.photo, "/ambassadors/muhammad-abdullah-pieas-2.webp")));
    await db
      .update(A)
      .set({ photo: "/ambassadors/haleema-aurangzeb-ist.webp" })
      .where(and(eq(A.name, "Haleema Aurangzeb"), eq(A.photo, "/ambassadors/haleema-aurangzeb-institute-of-space-technology.webp")));
    // Yusra Zafar (campus ambassador application #876) joins Shifa as a co-ambassador.
    const shifa = "Shifa Tameer-e-Millat University";
    const [already] = await db.select({ id: A.id }).from(A).where(and(eq(A.institute, shifa), sql`lower(${A.name}) = 'yusra zafar'`)).limit(1);
    const [app] = await db.select({ name: s.submissions.name, type: s.submissions.type }).from(s.submissions).where(eq(s.submissions.id, 876)).limit(1);
    if (!already && app?.type === "ambassador" && /yusra/i.test(app.name)) {
      const name = app.name.trim().replace(/\s+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      const [last] = await db.select({ order: sql<number>`max(${A.sortOrder})` }).from(A).where(eq(A.institute, shifa));
      await db.insert(A).values({ name, institute: shifa, role: "Co-Ambassador", sortOrder: Number(last?.order ?? 0) });
    }
    applied.add("2026-11-ambassador-fixes-4");
    console.log("[db-setup] applied patch 2026-11-ambassador-fixes-4");
  }

  if (!applied.has("2026-11-ambassador-fixes-5")) {
    // Photo for the NUTECH head ambassador. Its own patch: fixes-4 had already run (preview builds share the
    // database) before this was added to it. Only sets a photo where there is none.
    await db
      .update(s.ambassadors)
      .set({ photo: "/ambassadors/fatima-hafeez-nutech.webp" })
      .where(and(eq(s.ambassadors.institute, "NUTECH"), eq(s.ambassadors.role, "Head Ambassador"), isNull(s.ambassadors.photo)));
    applied.add("2026-11-ambassador-fixes-5");
    console.log("[db-setup] applied patch 2026-11-ambassador-fixes-5");
  }

  if (!applied.has("2026-11-ambassador-fixes-6")) {
    // FJWU head ambassador's full name. Only the row still carrying the old name changes.
    await db
      .update(s.ambassadors)
      .set({ name: "Minahil Gul" })
      .where(and(eq(s.ambassadors.institute, "Fatima Jinnah Women University"), eq(s.ambassadors.role, "Head Ambassador"), eq(s.ambassadors.name, "Minahil")));
    applied.add("2026-11-ambassador-fixes-6");
    console.log("[db-setup] applied patch 2026-11-ambassador-fixes-6");
  }

  if (!applied.has("2026-11-e-gaming-on-spot")) {
    // E-Gaming entries are taken on the spot on event day: no online registration.
    await db.update(s.competitions).set({ onSpot: true }).where(sql`${s.competitions.name} like 'E-Gaming:%'`);
    applied.add("2026-11-e-gaming-on-spot");
    console.log("[db-setup] applied patch 2026-11-e-gaming-on-spot");
  }

  if (!applied.has("2026-11-ambassador-fixes-7")) {
    // Updates sent by the ambassadors team (Nov 19). Each step only changes rows still in their old state.
    const A = s.ambassadors;
    for (const [from, to] of [["Riphah International University (Female)", "Riphah I-14 Females"], ["Riphah International University (Male)", "Riphah I-14 Males"], ["NSU", "National Skills University"]]) {
      await db.update(A).set({ institute: to }).where(eq(A.institute, from));
    }
    await db
      .update(A)
      .set({ name: "Muhammad Zain Malik", phone: "+92 305 9917678", photo: "/ambassadors/muhammad-zain-malik-national-skills-university.webp" })
      .where(and(eq(A.institute, "National Skills University"), eq(A.role, "Head Ambassador"), eq(A.name, "Aliha Ansar")));
    await db.update(A).set({ phone: "+92 315 5518575" }).where(and(eq(A.institute, "APS"), eq(A.role, "Head Ambassador"), isNull(A.phone)));
    const photos: [institute: string, name: string, photo: string][] = [
      ["Riphah International University, Gulberg", "Ariba Rehman", "/ambassadors/ariba-rehman-riphah-international-university-gulberg.webp"],
      ["Fatima Jinnah Women University", "Minahil Gul", "/ambassadors/minahil-gul-fatima-jinnah-women-university.webp"],
      ["SZABMU", "Syed Nihal Abbas", "/ambassadors/syed-nihal-abbas-szabmu.webp"],
      ["Shifa Tameer-e-Millat University", "Yusra Zafar", "/ambassadors/yusra-zafar-shifa-tameer-e-millat-university.webp"],
    ];
    for (const [institute, name, photo] of photos) {
      await db.update(A).set({ photo }).where(and(eq(A.institute, institute), eq(A.name, name), isNull(A.photo)));
    }
    // New co-ambassadors, added after the institute's others; skipped if already there.
    const added: [institute: string, name: string, photo: string][] = [
      ["Riphah International University, Gulberg", "Aliza Jamil", "/ambassadors/aliza-jamil-riphah-international-university-gulberg.webp"],
      ["Riphah International University, Gulberg", "Alveena Zaheer", "/ambassadors/alveena-zaheer-riphah-international-university-gulberg.webp"],
      ["Riphah International University, Gulberg", "Bebi Kalsoom Hussain", "/ambassadors/bebi-kalsoom-hussain-riphah-international-university-gulberg.webp"],
      ["Riphah International University, Gulberg", "Emaan Shahid", "/ambassadors/emaan-shahid-riphah-international-university-gulberg.webp"],
      ["Riphah International University, Gulberg", "Maryam", "/ambassadors/maryam-riphah-international-university-gulberg.webp"],
      ["Riphah International University, Gulberg", "Meerab Javed", "/ambassadors/meerab-javed-riphah-international-university-gulberg.webp"],
      ["Riphah International University, Gulberg", "Mehkan Tariq", "/ambassadors/mehkan-tariq-riphah-international-university-gulberg.webp"],
      ["Fatima Jinnah Women University", "Aima Baig", "/ambassadors/aima-baig-fatima-jinnah-women-university.webp"],
      ["Fatima Jinnah Women University", "Aleena", "/ambassadors/aleena-fatima-jinnah-women-university.webp"],
      ["Fatima Jinnah Women University", "Fatima", "/ambassadors/fatima-fatima-jinnah-women-university.webp"],
      ["Fatima Jinnah Women University", "Ismat", "/ambassadors/ismat-fatima-jinnah-women-university.webp"],
      ["Fatima Jinnah Women University", "Kanzal Eman", "/ambassadors/kanzal-eman-fatima-jinnah-women-university.webp"],
      ["SZABMU", "Syeda Alizay Fatima", "/ambassadors/syeda-alizay-fatima-szabmu.webp"],
      ["SZABMU", "Waleed Qasim", "/ambassadors/waleed-qasim-szabmu.webp"],
      ["National Skills University", "Allah Yar", "/ambassadors/allah-yar-national-skills-university.webp"],
      ["National Skills University", "Maaz Khan", "/ambassadors/maaz-khan-national-skills-university.webp"],
      ["National Skills University", "Muhammad Aliyan Hasan", "/ambassadors/muhammad-aliyan-hasan-national-skills-university.webp"],
      ["National Skills University", "Noor Ul Eman", "/ambassadors/noor-ul-eman-national-skills-university.webp"],
      ["National Skills University", "Syed Taqi", "/ambassadors/syed-taqi-national-skills-university.webp"],
      ["National Skills University", "Tayyba Zahoor", "/ambassadors/tayyba-zahoor-national-skills-university.webp"],
      ["Health Services Academy", "Fasih Dawar", "/ambassadors/fasih-dawar-health-services-academy.webp"],
      ["Health Services Academy", "Khalil Rehman", "/ambassadors/khalil-rehman-health-services-academy.webp"],
      ["Health Services Academy", "Swaiba Shakeel", "/ambassadors/swaiba-shakeel-health-services-academy.webp"],
      ["Health Services Academy", "Zeshan Adeel", "/ambassadors/zeshan-adeel-health-services-academy.webp"],
    ];
    for (const [institute, name, photo] of added) {
      const [exists] = await db.select({ id: A.id }).from(A).where(and(eq(A.institute, institute), eq(A.name, name))).limit(1);
      if (exists) continue;
      const [last] = await db.select({ order: sql<number>`max(${A.sortOrder})` }).from(A).where(eq(A.institute, institute));
      await db.insert(A).values({ name, institute, role: "Co-Ambassador", photo, sortOrder: Number(last?.order ?? 0) });
    }
    applied.add("2026-11-ambassador-fixes-7");
    console.log("[db-setup] applied patch 2026-11-ambassador-fixes-7");
  }

  if (!applied.has("2026-11-close-ambassador-applications")) {
    // Ambassador applications are closed: the /ambassadors page shows the directory only.
    await db.execute(sql`update settings set value = value || '{"ambassadors": false}'::jsonb where key = 'registration_open'`);
    applied.add("2026-11-close-ambassador-applications");
    console.log("[db-setup] applied patch 2026-11-close-ambassador-applications");
  }

  if (!applied.has("2026-11-merge-impcc")) {
    // IMPCC H-8/4 and IMPCC H-8 are one college: one card, IMPCC H-8, with Mustafa Fahad as head ambassador.
    // Sanaullah stays on as a co-ambassador; both coupon codes keep working.
    const A = s.ambassadors;
    await db.update(A).set({ institute: "IMPCC H-8" }).where(eq(A.institute, "IMPCC H-8/4"));
    await db
      .update(A)
      .set({ role: "Co-Ambassador" })
      .where(and(eq(A.institute, "IMPCC H-8"), eq(A.name, "Sanaullah"), eq(A.role, "Head Ambassador")));
    applied.add("2026-11-merge-impcc");
    console.log("[db-setup] applied patch 2026-11-merge-impcc");
  }

  if (!applied.has("2026-11-merge-business-innovation")) {
    // Business Innovation is merged into Pitch Your Idea (same PKR 1,500 fee): its registrations move over (fee,
    // coupon and payment slip unchanged; pre-event result cleared; passes relabelled) and it leaves the website.
    const from = "Business Innovation";
    const to = "Pitch Your Idea (SparkTank)";
    const subs = await db.select().from(s.submissions).where(and(eq(s.submissions.type, "competition"), eq(s.submissions.subject, from)));
    for (const sub of subs) {
      const data = { ...(sub.data as Record<string, unknown>), competition: to, mergedFrom: from };
      await db.update(s.submissions).set({ subject: to, data, preEventResult: null, preEventAbsent: null }).where(eq(s.submissions.id, sub.id));
    }
    if (subs.length) {
      await db
        .update(s.passes)
        .set({ detail: sql`replace(${s.passes.detail}, ${from}, ${to})` })
        .where(and(inArray(s.passes.submissionId, subs.map((x) => x.id)), eq(s.passes.category, "competition")));
    }
    const big = subs.filter((x) => Array.isArray((x.data as { members?: unknown[] }).members) && (x.data as { members: unknown[] }).members.length > 4);
    console.log(`[db-setup] merged ${subs.length} Business Innovation registrations into ${to} (${big.length} with 5 members: ${big.map((x) => `#${x.id}`).join(", ") || "none"})`);
    await db.update(s.competitions).set({ active: false }).where(byName(from));
    // Raffae Rafique Malik manages Pitch Your Idea with Danish Faheem.
    await db
      .update(s.competitions)
      .set({ focalName2: "Raffae Rafique Malik", focalPhone2: "+92 313 5008558" })
      .where(and(byName(to), isNull(s.competitions.focalName2)));
    applied.add("2026-11-merge-business-innovation");
    console.log("[db-setup] applied patch 2026-11-merge-business-innovation");
  }

  if (!applied.has("2026-11-graphic-design-live")) {
    // Graphic Design was hidden in admin; it is open for registration again.
    await db.update(s.competitions).set({ active: true }).where(byName("Graphic Design"));
    applied.add("2026-11-graphic-design-live");
    console.log("[db-setup] applied patch 2026-11-graphic-design-live");
  }

  if (!applied.has("2026-11-ambassador-photo-sulaiman")) {
    await db
      .update(s.ambassadors)
      .set({ photo: "/ambassadors/muhammad-sulaiman-javed-quaid-i-azam-university.webp" })
      .where(and(eq(s.ambassadors.institute, "Quaid-i-Azam University"), eq(s.ambassadors.name, "Muhammad Sulaiman Javed")));
    applied.add("2026-11-ambassador-photo-sulaiman");
    console.log("[db-setup] applied patch 2026-11-ambassador-photo-sulaiman");
  }

  if (!applied.has("2026-10-remove-debate")) {
    await db.delete(s.competitions).where(byName("Debate"));
    applied.add("2026-10-remove-debate");
    console.log("[db-setup] applied patch 2026-10-remove-debate");
  }

  const value = [...applied];
  await db.insert(s.settings).values({ key: "applied_patches", value }).onConflictDoUpdate({ target: s.settings.key, set: { value } });
}

main().catch((err) => {
  console.error("[db-setup] failed:", err);
  process.exit(1);
});
