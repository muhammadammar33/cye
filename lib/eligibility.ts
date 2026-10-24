/**
 * Talent Tribute eligibility, shared by the form (live check) and the server (final check).
 * Students qualify with 80% or more: marks obtained / total marks, or GPA / GPA scale.
 */
export const ELIGIBLE_PERCENT = 80;
export const GPA_SCALES = [4, 5] as const;
export const RESULT_TYPES = ["Marks", "GPA"] as const;
export type ResultType = (typeof RESULT_TYPES)[number];

export type ResultInput = { resultType: string; obtained?: unknown; total?: unknown; gpa?: unknown; scale?: unknown };
export type ResultCheck = { ok: true; percent: number; eligible: boolean } | { ok: false; error: string };

const num = (v: unknown) => (typeof v === "number" ? v : typeof v === "string" && v.trim() !== "" ? Number(v) : NaN);

export function checkResult(input: ResultInput): ResultCheck {
  if (input.resultType === "Marks") {
    const obtained = num(input.obtained);
    const total = num(input.total);
    if (!Number.isFinite(total) || total <= 0) return { ok: false, error: "Enter your total marks." };
    if (!Number.isFinite(obtained) || obtained < 0) return { ok: false, error: "Enter your obtained marks." };
    if (obtained > total) return { ok: false, error: "Obtained marks cannot be more than total marks." };
    const percent = Math.round((obtained / total) * 10000) / 100;
    return { ok: true, percent, eligible: percent >= ELIGIBLE_PERCENT };
  }
  if (input.resultType === "GPA") {
    const gpa = num(input.gpa);
    const scale = num(input.scale);
    if (!(GPA_SCALES as readonly number[]).includes(scale)) return { ok: false, error: "Choose your GPA scale (4.0 or 5.0)." };
    if (!Number.isFinite(gpa) || gpa < 0) return { ok: false, error: "Enter your GPA / CGPA." };
    if (gpa > scale) return { ok: false, error: `GPA cannot be more than ${scale.toFixed(1)}.` };
    const percent = Math.round((gpa / scale) * 10000) / 100;
    return { ok: true, percent, eligible: percent >= ELIGIBLE_PERCENT };
  }
  return { ok: false, error: "Choose whether you have marks or a GPA." };
}

/** Lowest qualifying GPA on a scale, e.g. 3.20 on 4.0. */
export const minGpa = (scale: number) => ((scale * ELIGIBLE_PERCENT) / 100).toFixed(2);
