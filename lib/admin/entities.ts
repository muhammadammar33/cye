import { AMBASSADOR_ROLES } from "@/data/ambassadors";
import { VERTICALS } from "@/data/event";
import { schema as s } from "@/lib/db";

export type FieldKind = "text" | "textarea" | "number" | "checkbox" | "select" | "list" | "image" | "link";
export type FieldDef = { name: string; label: string; kind: FieldKind; required?: boolean; options?: string[]; help?: string };

type EntityDef = {
  label: string;
  singular: string;
  table:
    | typeof s.competitions
    | typeof s.guests
    | typeof s.ambassadors
    | typeof s.advisoryMembers
    | typeof s.teamMembers
    | typeof s.tiers
    | typeof s.contacts;
  fields: FieldDef[];
  /** Columns shown in the list view. */
  columns: { name: string; label: string }[];
  /** Folder for uploaded photos in Vercel Blob. */
  folder?: string;
};

const order: FieldDef = { name: "sortOrder", label: "Display order", kind: "number", help: "Lower numbers show first." };
const active: FieldDef = { name: "active", label: "Show on the website", kind: "checkbox" };

export const ENTITIES = {
  competitions: {
    label: "Competitions",
    singular: "competition",
    table: s.competitions,
    fields: [
      { name: "name", label: "Name", kind: "text", required: true },
      { name: "vertical", label: "Vertical / category", kind: "select", required: true, options: [...VERTICALS.map((v) => v.name), "Literary"] },
      { name: "audience", label: "Audience", kind: "select", required: true, options: ["University", "Schools", "Schools & University", "Open"] },
      { name: "fee", label: "Registration fee", kind: "text", required: true, help: "e.g. PKR 2,000" },
      { name: "teamMin", label: "Min team size", kind: "number", required: true },
      { name: "teamMax", label: "Max team size", kind: "number", required: true },
      { name: "description", label: "Description", kind: "textarea", required: true },
      { name: "rulebook", label: "Rule book link", kind: "link", help: "A site file such as /rulebooks/01-robo-war.pdf, or a full https:// link. Leave empty to hide the rule book button." },
      { name: "focalName", label: "Focal person", kind: "text", help: "Shown on the competition card, the registration form and the confirmation email. Leave empty to hide." },
      { name: "focalPhone", label: "Focal person phone", kind: "text", help: "e.g. +92 349 9181998 (also used for the WhatsApp link)" },
      { name: "prize1", label: "1st prize", kind: "text", help: "e.g. PKR 50,000. Leave all three empty to hide prizes." },
      { name: "prize2", label: "2nd prize", kind: "text" },
      { name: "prize3", label: "3rd prize", kind: "text" },
      { name: "preEvent", label: "Has campus pre-event", kind: "checkbox", help: "Teams are shortlisted at campus pre-events. Competitor passes are only sent once a team is marked Qualified (Admin > Pre-events)." },
      order,
      active,
    ],
    columns: [
      { name: "name", label: "Name" },
      { name: "vertical", label: "Vertical" },
      { name: "fee", label: "Fee" },
      { name: "teamMax", label: "Max team" },
    ],
  },
  guests: {
    label: "Guests",
    singular: "guest",
    table: s.guests,
    folder: "guests",
    fields: [
      { name: "name", label: "Name", kind: "text", required: true },
      { name: "role", label: "Role / title", kind: "text", required: true },
      { name: "photo", label: "Photo", kind: "image", help: "Square photo works best." },
      order,
      active,
    ],
    columns: [
      { name: "photo", label: "" },
      { name: "name", label: "Name" },
      { name: "role", label: "Role" },
    ],
  },
  ambassadors: {
    label: "Ambassadors",
    singular: "ambassador",
    table: s.ambassadors,
    folder: "ambassadors",
    fields: [
      { name: "name", label: "Name", kind: "text", required: true },
      { name: "institute", label: "Institute", kind: "text", required: true, help: "Spell it exactly like the other ambassadors of this institute, so they show together." },
      { name: "role", label: "Role", kind: "select", required: true, options: [...AMBASSADOR_ROLES] },
      { name: "phone", label: "Phone", kind: "text", help: "Shown with a WhatsApp link for head ambassadors only, e.g. +92 315 5107753." },
      { name: "photo", label: "Photo", kind: "image", help: "Square photo works best." },
      { ...order, help: "Institutes appear in the order of their lowest number; within an institute, the head first, then by this number." },
      active,
    ],
    columns: [
      { name: "photo", label: "" },
      { name: "name", label: "Name" },
      { name: "institute", label: "Institute" },
      { name: "role", label: "Role" },
    ],
  },
  advisory: {
    label: "Board of Advisory",
    singular: "advisor",
    table: s.advisoryMembers,
    folder: "advisory",
    fields: [
      { name: "name", label: "Name", kind: "text", required: true },
      { name: "role", label: "Role / title", kind: "text", required: true },
      { name: "bio", label: "Bio", kind: "textarea", required: true },
      { name: "photo", label: "Photo", kind: "image" },
      order,
      active,
    ],
    columns: [
      { name: "photo", label: "" },
      { name: "name", label: "Name" },
      { name: "role", label: "Role" },
    ],
  },
  team: {
    label: "Team",
    singular: "team member",
    table: s.teamMembers,
    folder: "team",
    fields: [
      { name: "name", label: "Name", kind: "text", required: true },
      { name: "role", label: "Role", kind: "text", required: true },
      { name: "photo", label: "Photo", kind: "image", help: "Square head-and-shoulders photo works best." },
      { name: "featured", label: "Featured (large card at the top)", kind: "checkbox" },
      order,
      active,
    ],
    columns: [
      { name: "photo", label: "" },
      { name: "name", label: "Name" },
      { name: "role", label: "Role" },
      { name: "featured", label: "Featured" },
    ],
  },
  tiers: {
    label: "Sponsorship & Stalls",
    singular: "package",
    table: s.tiers,
    fields: [
      { name: "kind", label: "Type", kind: "select", required: true, options: ["sponsorship", "stall"] },
      { name: "name", label: "Name", kind: "text", required: true, help: "e.g. Gold or Gold Stalls" },
      { name: "price", label: "Price", kind: "text", required: true, help: "e.g. PKR 700,000" },
      { name: "benefits", label: "Benefits", kind: "list", required: true, help: "One benefit per line." },
      { name: "highlight", label: "Highlight as most popular", kind: "checkbox" },
      order,
      active,
    ],
    columns: [
      { name: "kind", label: "Type" },
      { name: "name", label: "Name" },
      { name: "price", label: "Price" },
    ],
  },
  contacts: {
    label: "Contacts",
    singular: "contact",
    table: s.contacts,
    fields: [
      { name: "label", label: "Department", kind: "text", required: true },
      { name: "phones", label: "Phone numbers", kind: "list", help: "One number per line." },
      { name: "email", label: "Email", kind: "text", required: true },
      order,
      active,
    ],
    columns: [
      { name: "label", label: "Department" },
      { name: "email", label: "Email" },
    ],
  },
} satisfies Record<string, EntityDef>;

export type EntityKey = keyof typeof ENTITIES;
export const ENTITY_KEYS = Object.keys(ENTITIES) as EntityKey[];
export const isEntity = (key: string): key is EntityKey => key in ENTITIES;
