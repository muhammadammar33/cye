import type { SubmissionType } from "@/lib/db/schema";

export type SubmitResult = { ok: true; id?: number } | { ok: false; error: string };

/** Client helper: posts a form to /api/submissions. `hp` is the honeypot field value. */
export async function submitForm(type: SubmissionType, data: Record<string, unknown>, hp = "", slip?: File): Promise<SubmitResult> {
  try {
    let init: RequestInit;
    if (slip) {
      // Multipart when a payment slip is attached: JSON payload + the image.
      const body = new FormData();
      body.set("payload", JSON.stringify({ type, data, hp }));
      body.set("slip", slip);
      init = { method: "POST", body };
    } else {
      init = { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type, data, hp }) };
    }
    const res = await fetch("/api/submissions", init);
    if (res.status === 413) return { ok: false, error: "The payment slip image is too large. Please upload a smaller photo or a screenshot." };
    const body = (await res.json().catch(() => null)) as SubmitResult | null;
    if (body) return body;
    return { ok: false, error: "Something went wrong. Please try again." };
  } catch {
    return { ok: false, error: "Network error. Check your connection and try again." };
  }
}
