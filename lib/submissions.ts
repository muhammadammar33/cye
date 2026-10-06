import "server-only";
import { z } from "zod";
import type { SubmissionType } from "@/lib/db/schema";
import type { RegistrationKey } from "@/lib/defaults";
import type { Competition } from "@/lib/content";
import { GENDERS } from "@/data/event";

const text = (max = 200) => z.string().trim().min(1, "Required").max(max);
const optional = (max = 500) => z.string().trim().max(max).optional().or(z.literal("")).transform((v) => v || undefined);
const email = z.string().trim().toLowerCase().email("Enter a valid email").max(200);
const phone = z.string().trim().min(7, "Enter a valid phone number").max(30);
const url = z.string().trim().url("Enter a full link starting with https://").max(500);
const consent = z.union([z.literal("on"), z.literal(true), z.literal("true")], { message: "Please confirm" });
const longText = (max = 5000) => z.string().trim().min(1, "Required").max(max);

const consents = { consent_accuracy: consent, consent_rules: consent };
const gender = z.enum(GENDERS, { message: "Select a gender" });

const member = z.object({ name: text(), email, phone, institution: text(), gender });

export const SCHEMAS = {
  competition: z.object({
    competition: text(),
    size: z.coerce.number().int().min(1).max(10),
    team: optional(120),
    level: text(),
    idNumber: text(40),
    members: z.array(member).min(1).max(10),
    ...consents,
  }),
  project: z.object({
    title: text(), vertical: text(), institution: text(), name: text(), email, phone, gender,
    members: optional(500), description: longText(), document: url,
    video: url.optional().or(z.literal("")), website: url.optional().or(z.literal("")),
    ...consents,
  }),
  startup: z.object({
    startup: text(), name: text(), email, phone, gender, sector: text(), stage: text(),
    team: z.coerce.number().int().min(1).max(500), website: url.optional().or(z.literal("")),
    deck: url, description: longText(), ...consents,
  }),
  visitor: z.object({
    name: text(), email, phone, gender, age: z.coerce.number().int().min(5).max(120), institution: text(), level: text(), ...consents,
  }),
  ambassador: z.object({
    name: text(), email, phone, gender, institution: text(), program: text(), year: text(), city: text(), message: longText(),
  }),
  volunteer: z.object({
    name: text(), email, phone, gender, institution: text(), role: text(), availability: text(), message: longText(),
  }),
  sponsor: z.object({ name: text(), organization: text(), email, tier: text(), message: longText() }),
  contact: z.object({ name: text(), email, subject: text(), message: longText() }),
} satisfies Record<SubmissionType, z.ZodType>;

/** Which registration switch in settings gates each form (sponsor/contact are always open). */
export const GATE: Partial<Record<SubmissionType, RegistrationKey>> = {
  competition: "competitions",
  project: "projects",
  startup: "startups",
  visitor: "visitors",
  ambassador: "ambassadors",
  volunteer: "volunteers",
};

/** Settings inbox that receives the team notification for each form. */
export const INBOX: Record<SubmissionType, "competitions" | "projects" | "startups" | "visitors" | "ambassadors" | "volunteers" | "sponsors" | "info"> = {
  competition: "competitions",
  project: "projects",
  startup: "startups",
  visitor: "visitors",
  ambassador: "ambassadors",
  volunteer: "volunteers",
  sponsor: "sponsors",
  contact: "info",
};

export const TYPE_LABELS: Record<SubmissionType, string> = {
  competition: "Competition registration",
  project: "Project submission",
  startup: "Startup submission",
  visitor: "Visitor pass",
  ambassador: "Campus Ambassador application",
  volunteer: "Volunteer application",
  sponsor: "Sponsor / stall enquiry",
  contact: "Contact message",
};

export type Normalized = {
  name: string;
  email: string;
  phone?: string;
  institution?: string;
  gender?: string;
  subject?: string;
  data: Record<string, unknown>;
};

/** Pulls the columns we index on out of a validated payload. */
export function normalize(type: SubmissionType, raw: Record<string, unknown>, competitions: Competition[]): Normalized | { error: string } {
  const parsed = SCHEMAS[type].safeParse(raw);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { error: `${issue.path.join(".") || "form"}: ${issue.message}` };
  }
  const d = parsed.data as Record<string, unknown>;
  for (const key of Object.keys(consents)) delete d[key];

  switch (type) {
    case "competition": {
      const c = d as z.infer<typeof SCHEMAS.competition>;
      const comp = competitions.find((x) => x.name === c.competition);
      if (!comp) return { error: "competition: Unknown competition" };
      if (c.size < comp.teamMin || c.size > comp.teamMax) return { error: `size: ${comp.name} allows ${comp.teamMin} to ${comp.teamMax} members` };
      if (c.members.length !== c.size) return { error: "members: Add details for every team member" };
      if (c.size > 1 && !c.team) return { error: "team: Team name is required" };
      const lead = c.members[0];
      return { name: lead.name, email: lead.email, phone: lead.phone, institution: lead.institution, gender: lead.gender, subject: comp.name, data: { ...d, fee: comp.fee } };
    }
    case "project":
      return { name: d.name as string, email: d.email as string, phone: d.phone as string, gender: d.gender as string, institution: d.institution as string, subject: d.title as string, data: d };
    case "startup":
      return { name: d.name as string, email: d.email as string, phone: d.phone as string, gender: d.gender as string, institution: d.startup as string, subject: d.startup as string, data: d };
    case "sponsor":
      return { name: d.name as string, email: d.email as string, institution: d.organization as string, subject: d.tier as string, data: d };
    case "contact":
      return { name: d.name as string, email: d.email as string, subject: d.subject as string, data: d };
    case "volunteer":
      return { name: d.name as string, email: d.email as string, phone: d.phone as string, gender: d.gender as string, institution: d.institution as string, subject: d.role as string, data: d };
    case "ambassador":
      return { name: d.name as string, email: d.email as string, phone: d.phone as string, gender: d.gender as string, institution: d.institution as string, subject: d.program as string, data: d };
    case "visitor":
      return { name: d.name as string, email: d.email as string, phone: d.phone as string, gender: d.gender as string, institution: d.institution as string, subject: d.level as string, data: d };
  }
}
