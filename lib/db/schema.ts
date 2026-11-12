import { boolean, index, integer, jsonb, pgEnum, pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const SUBMISSION_TYPES = [
  "competition",
  "project",
  "startup",
  "visitor",
  "ambassador",
  "volunteer",
  "sponsor",
  "contact",
  "talent",
] as const;
export type SubmissionType = (typeof SUBMISSION_TYPES)[number];

export const SUBMISSION_STATUSES = ["new", "in_review", "contacted", "approved", "rejected", "archived"] as const;
export type SubmissionStatus = (typeof SUBMISSION_STATUSES)[number];

export const submissionType = pgEnum("submission_type", SUBMISSION_TYPES);
export const submissionStatus = pgEnum("submission_status", SUBMISSION_STATUSES);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
};

export const admins = pgTable("admins", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  /** "admin": the whole dashboard. "gate": only the event-day gate scanner. */
  role: text("role").default("admin").notNull(),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  ...timestamps,
});

export const submissions = pgTable(
  "submissions",
  {
    id: serial("id").primaryKey(),
    type: submissionType("type").notNull(),
    status: submissionStatus("status").default("new").notNull(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    phone: text("phone"),
    institution: text("institution"),
    /** "Male" | "Female"; empty for older submissions until an admin sets it. */
    gender: text("gender"),
    /** Competition payment check: "Confirmed" | "Unpaid" | "Fake"; empty until an admin checks it. */
    paymentStatus: text("payment_status"),
    // What the submission is about: competition name, project title, sponsor tier, subject line...
    subject: text("subject"),
    data: jsonb("data").$type<Record<string, unknown>>().notNull(),
    notes: text("notes"),
    ip: text("ip"),
    ...timestamps,
  },
  (t) => [index("submissions_type_idx").on(t.type), index("submissions_status_idx").on(t.status), index("submissions_created_idx").on(t.createdAt)],
);

const content = {
  sortOrder: integer("sort_order").default(0).notNull(),
  active: boolean("active").default(true).notNull(),
  ...timestamps,
};

export const competitions = pgTable("competitions", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  vertical: text("vertical").notNull(),
  audience: text("audience").notNull(),
  fee: text("fee").notNull(),
  teamMin: integer("team_min").default(1).notNull(),
  teamMax: integer("team_max").default(1).notNull(),
  description: text("description").notNull(),
  /** Link to the competition's rule book PDF, e.g. /rulebooks/01-robo-war.pdf */
  rulebook: text("rulebook"),
  /** Competition focal person shown to participants, e.g. "Syed Hamza Ali" and "+92 349 9181998". */
  focalName: text("focal_name"),
  focalPhone: text("focal_phone"),
  ...content,
});

export const guests = pgTable("guests", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  photo: text("photo"),
  ...content,
});

export const advisoryMembers = pgTable("advisory_members", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  photo: text("photo"),
  bio: text("bio").notNull(),
  ...content,
});

export const teamMembers = pgTable("team_members", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  photo: text("photo"),
  featured: boolean("featured").default(false).notNull(),
  ...content,
});

export const tiers = pgTable("tiers", {
  id: serial("id").primaryKey(),
  kind: text("kind").$type<"sponsorship" | "stall">().notNull(),
  name: text("name").notNull(),
  price: text("price").notNull(),
  benefits: jsonb("benefits").$type<string[]>().notNull(),
  highlight: boolean("highlight").default(false).notNull(),
  ...content,
});

export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  label: text("label").notNull(),
  phones: jsonb("phones").$type<string[]>().notNull(),
  email: text("email").notNull(),
  ...content,
});

export const settings = pgTable("settings", {
  key: text("key").primaryKey(),
  value: jsonb("value").notNull(),
  ...timestamps,
});

/**
 * Event passes. Issued when an admin approves a submission (one per person: every competition team member
 * gets their own), or by hand for focal persons and the event team. The token is the secret in the pass link
 * and QR code; the code (e.g. CYE-V-00042) is what people read out at the gate.
 */
export const passes = pgTable(
  "passes",
  {
    id: serial("id").primaryKey(),
    token: text("token").notNull().unique(),
    code: text("code").unique(),
    category: text("category").notNull(),
    submissionId: integer("submission_id").references(() => submissions.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    email: text("email").notNull(),
    /** What the pass is for, e.g. "Robo War · Team Steel Hawks" or "Focal person, Robo War". */
    detail: text("detail"),
    institution: text("institution"),
    issuedBy: text("issued_by"),
    emailedAt: timestamp("emailed_at", { withTimezone: true }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    checkedInAt: timestamp("checked_in_at", { withTimezone: true }),
    /** Team members who came in with the holder, counted at the gate (project and startup teams). */
    companions: integer("companions").default(0).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("passes_submission_idx").on(t.submissionId), index("passes_category_idx").on(t.category)],
);

/** Who did what in the admin dashboard. Name and email are copied in so entries survive an admin's removal. */
export const adminLogs = pgTable(
  "admin_logs",
  {
    id: serial("id").primaryKey(),
    adminId: integer("admin_id").references(() => admins.id, { onDelete: "set null" }),
    adminName: text("admin_name").notNull(),
    adminEmail: text("admin_email").notNull(),
    action: text("action").notNull(),
    target: text("target"),
    details: text("details"),
    ip: text("ip"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("admin_logs_created_idx").on(t.createdAt), index("admin_logs_admin_idx").on(t.adminId)],
);
