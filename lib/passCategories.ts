import type { SubmissionType } from "@/lib/db/schema";

/** Every kind of event pass. Each has its own colour so gate staff can tell them apart at a glance. */
export const PASS_CATEGORIES = {
  competition: { label: "Competitor", prefix: "C", color: "#1b4694" },
  talent: { label: "Talent Tribute", prefix: "T", color: "#7c3aed" },
  visitor: { label: "Visitor", prefix: "V", color: "#ef432c" },
  ambassador: { label: "Campus Ambassador", prefix: "A", color: "#0f766e" },
  volunteer: { label: "Volunteer", prefix: "VL", color: "#15803d" },
  project: { label: "Project Exhibitor", prefix: "P", color: "#0369a1" },
  startup: { label: "Startup", prefix: "S", color: "#b45309" },
  focal: { label: "Focal Person", prefix: "F", color: "#be185d" },
  team: { label: "Event Team", prefix: "E", color: "#111827" },
} as const;

export type PassCategory = keyof typeof PASS_CATEGORIES;
export const PASS_CATEGORY_KEYS = Object.keys(PASS_CATEGORIES) as PassCategory[];

/**
 * Row order on the attendance display. Neighbouring rows are clearly different colours (checked with the
 * dataviz palette validator); every row is also labelled, so the type never depends on colour alone.
 */
export const DISPLAY_ORDER: PassCategory[] = ["competition", "visitor", "talent", "volunteer", "startup", "ambassador", "focal", "project", "team"];

/** Pass categories an admin issues by hand (no form submission behind them). */
export const MANUAL_PASS_CATEGORIES = ["focal", "team"] as const satisfies readonly PassCategory[];

/**
 * Passes held by a team lead whose team members have no passes of their own (the project and startup forms
 * don't collect them). The gate asks how many came with the lead and records the number.
 */
export const TEAM_COUNT_CATEGORIES: readonly PassCategory[] = ["project", "startup"];

/** Submission types whose approval sends passes. Sponsor and contact messages get none. */
export const PASS_FOR_TYPE: Partial<Record<SubmissionType, PassCategory>> = {
  competition: "competition",
  talent: "talent",
  visitor: "visitor",
  ambassador: "ambassador",
  volunteer: "volunteer",
  project: "project",
  startup: "startup",
};

export const isPassCategory = (value: string): value is PassCategory => value in PASS_CATEGORIES;

/** Readable pass number, e.g. CYE-V-00042. */
export const passCode = (category: PassCategory, id: number) => `CYE-${PASS_CATEGORIES[category].prefix}-${String(id).padStart(5, "0")}`;
