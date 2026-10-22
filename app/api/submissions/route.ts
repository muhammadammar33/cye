import type { NextRequest } from "next/server";
import { createSubmission } from "@/lib/createSubmission";
import { db } from "@/lib/db";
import { SUBMISSION_TYPES, type SubmissionType } from "@/lib/db/schema";

const json = (body: unknown, status = 200) => Response.json(body, { status });

export async function POST(req: NextRequest) {
  if (!db) return json({ ok: false, error: "Submissions are temporarily unavailable. Please email us instead." }, 503);

  // JSON for most forms; multipart (payload + slip image) when a competition payment slip is attached.
  let raw: string;
  let slip: File | null = null;
  if (req.headers.get("content-type")?.includes("multipart/form-data")) {
    let form: FormData;
    try {
      form = await req.formData();
    } catch {
      return json({ ok: false, error: "Invalid request." }, 400);
    }
    raw = String(form.get("payload") ?? "");
    const file = form.get("slip");
    if (file instanceof File && file.size > 0) slip = file;
  } else {
    raw = await req.text();
  }
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

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null;
  const origin = process.env.SITE_URL?.replace(/\/$/, "") || req.nextUrl.origin;
  const result = await createSubmission({ type, data: body.data, slip, ip, origin });
  if (!result.ok) return json({ ok: false, error: result.error }, result.status);
  return json({ ok: true, id: result.id });
}
