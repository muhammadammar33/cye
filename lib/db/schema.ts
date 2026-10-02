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
