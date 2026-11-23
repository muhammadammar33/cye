import "server-only";
import { eq, sql } from "drizzle-orm";
import { FOCAL_PERSONS } from "@/data/event";
import { getCompetitions, getSettings, type Competition } from "@/lib/content";
import { requireDb, schema as s } from "@/lib/db";
import type { SubmissionType } from "@/lib/db/schema";
import { confirmationEmail, sendEmail } from "@/lib/email";
import { INBOX, TYPE_LABELS } from "@/lib/submissions";

type Submission = typeof s.submissions.$inferSelect;

/** Who the applicant can call about their submission: the competition's focal person(s) or the form's. */
export function focalFor(type: SubmissionType, subject: string | null, competitions: Competition[]) {
  const chosen = type === "competition" ? competitions.find((c) => c.name === subject) : undefined;
  if (chosen?.focalName) {
    return { name: chosen.focalName, phone: chosen.focalPhone, topic: chosen.name, also: chosen.focalName2 ? { name: chosen.focalName2, phone: chosen.focalPhone2 ?? null } : undefined };
  }
  if (type === "talent") return { name: FOCAL_PERSONS.talentTribute.name, phone: FOCAL_PERSONS.talentTribute.phone, topic: "Talent Tribute" };
  if (type === "project") return { name: FOCAL_PERSONS.projectExhibition.name, phone: FOCAL_PERSONS.projectExhibition.phone, topic: "the Project Exhibition" };
  if (type === "volunteer") return { name: FOCAL_PERSONS.volunteers.name, phone: FOCAL_PERSONS.volunteers.phone, topic: "volunteering at the expo" };
  if (type === "lawyers") return { name: FOCAL_PERSONS.lawyersConference.name, phone: FOCAL_PERSONS.lawyersConference.phone, topic: "the Lawyers Conference" };
  return undefined;
}

/**
 * Sends the applicant's "we received your submission" email for a stored submission and records when it was sent
 * (data.confirmationSentAt), so it is never sent twice. Returns whether it was sent.
 */
export async function sendConfirmation(sub: Submission, origin: string): Promise<boolean> {
  const [settings, competitions] = await Promise.all([getSettings(), getCompetitions()]);
  const d = sub.data as Record<string, unknown>;
  const kind = TYPE_LABELS[sub.type];
  const payment =
    sub.type === "competition"
      ? {
          payment: settings.payment,
          fee: d.couponDiscount ? `${String(d.fee)} (${String(d.couponDiscount)} off with coupon ${String(d.coupon)})` : String(d.fee ?? ""),
          slipReceived: Boolean(d.paymentSlip),
        }
      : undefined;
  const sent = await sendEmail({
    to: sub.email,
    subject: `${kind} received | Capital Youth Expo 2026`,
    html: confirmationEmail({ origin, social: settings.social_links }, sub.type, sub.name, kind, sub.subject ?? "", payment, focalFor(sub.type, sub.subject, competitions)),
    replyTo: settings.inboxes[INBOX[sub.type]],
  });
  if (sent) {
    await requireDb()
      .update(s.submissions)
      .set({ data: sql`${s.submissions.data} || jsonb_build_object('confirmationSentAt', ${new Date().toISOString()}::text)` })
      .where(eq(s.submissions.id, sub.id));
  }
  return sent;
}
