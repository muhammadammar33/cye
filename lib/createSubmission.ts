import "server-only";
import { and, eq, gt } from "drizzle-orm";
import { after } from "next/server";
import { uploadImage } from "@/lib/blob";
import { getCompetitions, getSettings } from "@/lib/content";
import { db, schema as s } from "@/lib/db";
import type { SubmissionType } from "@/lib/db/schema";
import { confirmationEmail, sendEmail, teamEmail } from "@/lib/email";
import { slipModeFor } from "@/lib/payment";
import { GATE, INBOX, normalize, TYPE_LABELS } from "@/lib/submissions";

export const MAX_SLIP_BYTES = 4 * 1024 * 1024;

export type CreateResult = { ok: true; id: number; slipStored: boolean } | { ok: false; error: string; status: number };

/**
 * Validates, stores and announces one submission. Shared by the website's forms and the partner
 * API so both follow exactly the same rules (open/closed, team sizes, slip, flood guard, emails).
 * `source` marks where it came from (e.g. "Bahria University API"); the website leaves it empty.
 */
export async function createSubmission(opts: {
  type: SubmissionType;
  data: Record<string, unknown>;
  slip: File | null;
  ip: string | null;
  origin: string;
  source?: string;
}): Promise<CreateResult> {
  const { type, slip } = opts;
  if (!db) return { ok: false, error: "Submissions are temporarily unavailable. Please email us instead.", status: 503 };

  const settings = await getSettings();
  const gate = GATE[type];
  if (gate && !settings.registration_open[gate]) return { ok: false, error: "This registration is closed.", status: 403 };

  const result = normalize(type, opts.data, await getCompetitions());
  if ("error" in result) return { ok: false, error: result.error, status: 422 };

  // Basic flood guard: one submission per email and form per minute.
  const recent = await db
    .select({ id: s.submissions.id })
    .from(s.submissions)
    .where(and(eq(s.submissions.type, type), eq(s.submissions.email, result.email), gt(s.submissions.createdAt, new Date(Date.now() - 60_000))))
    .limit(1);
  if (recent.length) return { ok: false, error: "This email just submitted this form. Please wait a minute before trying again.", status: 429 };

  if (type === "competition") {
    const mode = slipModeFor(settings);
    if (mode === "required" && !slip) return { ok: false, error: "Please upload a photo or screenshot of your payment slip.", status: 422 };
    if (slip && mode !== "off") {
      try {
        result.data.paymentSlip = await uploadImage(slip, "payment-slips", { maxBytes: MAX_SLIP_BYTES, unguessable: true });
      } catch (err) {
        return { ok: false, error: err instanceof Error ? err.message : "Could not upload the payment slip.", status: 422 };
      }
    }
  } else if (slip) {
    return { ok: false, error: "Invalid request.", status: 400 };
  }
  if (opts.source) result.data.source = opts.source;

  const [row] = await db
    .insert(s.submissions)
    .values({ type, name: result.name, email: result.email, phone: result.phone, institution: result.institution, gender: result.gender, subject: result.subject, data: result.data, ip: opts.ip })
    .returning({ id: s.submissions.id });

  const kind = TYPE_LABELS[type];
  const adminUrl = `${opts.origin}/admin/submissions/${row.id}`;
  const ctx = { origin: opts.origin, social: settings.social_links };
  after(async () => {
    await Promise.all([
      sendEmail({
        to: settings.inboxes[INBOX[type]],
        subject: `New ${kind}${opts.source ? ` (${opts.source})` : ""}: ${result.subject ?? result.name}`,
        html: teamEmail(ctx, kind, row.id, adminUrl, { name: result.name, email: result.email, ...result.data }),
        replyTo: result.email,
      }),
      sendEmail({
        to: result.email,
        subject: `${kind} received | Capital Youth Expo 2026`,
        html: confirmationEmail(ctx, type, result.name, kind, result.subject ?? "", type === "competition" ? { payment: settings.payment, fee: String(result.data.fee ?? ""), slipReceived: Boolean(result.data.paymentSlip) } : undefined),
        replyTo: settings.inboxes[INBOX[type]],
      }),
    ]);
  });

  return { ok: true, id: row.id, slipStored: Boolean(result.data.paymentSlip) };
}
