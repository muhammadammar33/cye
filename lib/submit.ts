import type { SubmissionType } from "@/lib/db/schema";

export type SubmitResult = { ok: true; id?: number } | { ok: false; error: string };

/** Client helper: posts a form to /api/submissions. `hp` is the honeypot field value. */
export async function submitForm(type: SubmissionType, data: Record<string, unknown>, hp = ""): Promise<SubmitResult> {
  try {
    const res = await fetch("/api/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, data, hp }),
    });
    const body = (await res.json().catch(() => null)) as SubmitResult | null;
    if (body) return body;
    return { ok: false, error: "Something went wrong. Please try again." };
  } catch {
    return { ok: false, error: "Network error. Check your connection and try again." };
  }
}
