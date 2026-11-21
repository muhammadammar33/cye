import { EVENT } from "@/data/event";
import type { Focal } from "@/lib/focals";

/**
 * The judge invitation template. Placeholders are filled from the chosen competition and the judge's name:
 * {judge}, {competition}, {focal} (focal person(s) with phone), {date}, {venue}. Safe for server and browser.
 */
export const JUDGE_SUBJECT = "Invitation to judge {competition} at Capital Youth Expo 2026";

export const JUDGE_MESSAGE = `Dear {judge},

On behalf of Capital Youth Expo 2026, we are honoured to invite you to judge the {competition} competition at the expo on {date} at {venue}.

Your experience would help us recognise the most talented young people taking part, and your feedback would mean a great deal to them. The rule book for the competition is linked below.

For the schedule, reporting time and any arrangements, please get in touch with our focal person for the competition, whose contact details are below.

We look forward to welcoming you.`;

export function focalText(focals: Focal[]) {
  const one = (f: Focal) => (f.phone ? `${f.name} (${f.phone})` : f.name);
  return focals.length ? focals.map(one).join(" or ") : "our competitions team";
}

/**
 * Fills the placeholders; unknown ones are left as they are. With `bold`, each filled value is wrapped in
 * **double asterisks** so the email shows it in bold (used for the message, not the subject).
 */
export function fillJudgeTemplate(text: string, v: { judge: string; competition: string; focals: Focal[] }, bold = false) {
  const values: Record<string, string> = {
    judge: v.judge.trim() || "Sir / Madam",
    competition: v.competition,
    focal: focalText(v.focals),
    date: EVENT.date,
    venue: `${EVENT.venue}, ${EVENT.city}`,
  };
  return text.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? (bold ? `**${values[key]}**` : values[key]) : match));
}

/** Splits text into plain and **bold** parts. Safe for server and browser. */
export function boldParts(text: string): { text: string; bold: boolean }[] {
  return text
    .split(/(\*\*[^*\n]+?\*\*)/g)
    .filter(Boolean)
    .map((part) => (/^\*\*[^*\n]+?\*\*$/.test(part) ? { text: part.slice(2, -2), bold: true } : { text: part, bold: false }));
}

/** Email addresses typed into one field, separated by commas, semicolons or spaces. */
export function splitEmails(value: string) {
  return [...new Set(value.split(/[\s,;]+/).map((e) => e.trim().toLowerCase()).filter(Boolean))];
}
