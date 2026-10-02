import { VERTICALS } from "@/data/event";
import { schema as s } from "@/lib/db";

export type FieldKind = "text" | "textarea" | "number" | "checkbox" | "select" | "list" | "image";
export type FieldDef = { name: string; label: string; kind: FieldKind; required?: boolean; options?: string[]; help?: string };

type EntityDef = {
  label: string;
  singular: string;
  table:
    | typeof s.competitions
    | typeof s.guests
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
