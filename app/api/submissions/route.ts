import { and, eq, gt } from "drizzle-orm";
import { after, type NextRequest } from "next/server";
import { getCompetitions, getSettings } from "@/lib/content";
import { db, schema as s } from "@/lib/db";
import { SUBMISSION_TYPES, type SubmissionType } from "@/lib/db/schema";
import { confirmationEmail, sendEmail, teamEmail } from "@/lib/email";
import { GATE, INBOX, normalize, TYPE_LABELS } from "@/lib/submissions";

const json = (body: unknown, status = 200) => Response.json(body, { status });

export async function POST(req: NextRequest) {
  if (!db) return json({ ok: false, error: "Submissions are temporarily unavailable. Please email us instead." }, 503);

  const raw = await req.text();
  if (raw.length > 50_000) return json({ ok: false, error: "Submission is too large." }, 413);
  let body: { type?: string; data?: Record<string, unknown>; hp?: string };
  try {
    body = JSON.parse(raw);
  } catch {
    return json({ ok: false, error: "Invalid request." }, 400);
  }

  const type = body.type as SubmissionType;
  if (!SUBMISSION_TYPES.includes(type) || !body.data || typeof body.data !== "object") {
    return json({ ok: false, error: "Invalid request." }, 400);
  }
  // Honeypot: bots fill the hidden field; pretend success.
  if (body.hp) return json({ ok: true });

  const settings = await getSettings();
  const gate = GATE[type];
  if (gate && !settings.registration_open[gate]) return json({ ok: false, error: "This registration is closed." }, 403);

  const result = normalize(type, body.data, await getCompetitions());
  if ("error" in result) return json({ ok: false, error: result.error }, 422);

  // Basic flood guard: one submission per email and form per minute.
  const recent = await db
    .select({ id: s.submissions.id })
    .from(s.submissions)
    .where(and(eq(s.submissions.type, type), eq(s.submissions.email, result.email), gt(s.submissions.createdAt, new Date(Date.now() - 60_000))))
    .limit(1);
  if (recent.length) return json({ ok: false, error: "You just submitted this form. Please wait a minute before trying again." }, 429);

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
  const [row] = await db
    .insert(s.submissions)
    .values({ type, name: result.name, email: result.email, phone: result.phone, institution: result.institution, subject: result.subject, data: result.data, ip })
    .returning({ id: s.submissions.id });

  const kind = TYPE_LABELS[type];
  const adminUrl = new URL(`/admin/submissions/${row.id}`, req.nextUrl.origin).toString();
  after(async () => {
    await Promise.all([
      sendEmail({
        to: settings.inboxes[INBOX[type]],
        subject: `New ${kind}: ${result.subject ?? result.name}`,
        html: teamEmail(kind, row.id, adminUrl, { name: result.name, email: result.email, ...result.data }),
        replyTo: result.email,
      }),
      sendEmail({
        to: result.email,
        subject: `${kind} received | Capital Youth Expo 2026`,
        html: confirmationEmail(result.name, kind, result.subject ?? ""),
        replyTo: settings.inboxes[INBOX[type]],
      }),
    ]);
  });

  return json({ ok: true, id: row.id });
}
