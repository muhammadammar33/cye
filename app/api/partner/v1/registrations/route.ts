import { and, asc, count, eq, gte, sql, type SQL } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { EDUCATION_LEVELS } from "@/data/event";
import { getCompetitions } from "@/lib/content";
import { createSubmission, MAX_SLIP_BYTES } from "@/lib/createSubmission";
import { db, schema as s } from "@/lib/db";
import { SUBMISSION_STATUSES, type SubmissionStatus } from "@/lib/db/schema";
import { authorize, json, logPartnerCall, siteOrigin, sourceLabel } from "@/lib/partner";

export const dynamic = "force-dynamic";

type Member = { name?: string; email?: string; phone?: string; institution?: string; gender?: string };

/**
 * GET /api/partner/v1/registrations: competition registrations with at least one member from the
 * partner's institution (any campus), plus any the partner submitted itself through POST. For the
 * former only the partner's members are returned; for the latter, the whole team. CNIC/ID, payment
 * slips, admin notes and IPs are never included.
 */
export async function GET(req: NextRequest) {
  const partner = authorize(req);
  if (partner instanceof Response) return partner;
  if (!db) return json({ error: "Service temporarily unavailable." }, 503);

  const p = req.nextUrl.searchParams;
  const competition = p.get("competition")?.trim() || undefined;
  const status = p.get("status")?.trim() || undefined;
  const since = p.get("since")?.trim() || undefined;
  const page = p.get("page") ? Number(p.get("page")) : 1;
  const pageSize = p.get("pageSize") ? Number(p.get("pageSize")) : 50;

  if (status && !SUBMISSION_STATUSES.includes(status as SubmissionStatus)) return json({ error: `status must be one of: ${SUBMISSION_STATUSES.join(", ")}` }, 400);
  const sinceDate = since ? new Date(/^\d{4}-\d{2}-\d{2}$/.test(since) ? `${since}T00:00:00+05:00` : since) : undefined;
  if (sinceDate && Number.isNaN(sinceDate.getTime())) return json({ error: "since must be a date like 2026-10-01" }, 400);
  if (!Number.isInteger(page) || page < 1) return json({ error: "page must be a whole number from 1" }, 400);
  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 100) return json({ error: "pageSize must be between 1 and 100" }, 400);

  const pattern = `%${partner.institutionMatch}%`;
  const conditions: SQL[] = [
    eq(s.submissions.type, "competition"),
    // The partner filter comes from the key, never from the request.
    sql`(exists (select 1 from jsonb_array_elements(coalesce(${s.submissions.data}->'members', '[]'::jsonb)) m where m->>'institution' ilike ${pattern}) or ${s.submissions.data}->>'source' = ${sourceLabel(partner)})`,
  ];
  if (competition) conditions.push(sql`lower(${s.submissions.subject}) = ${competition.toLowerCase()}`);
  if (status) conditions.push(eq(s.submissions.status, status as SubmissionStatus));
  if (sinceDate) conditions.push(gte(s.submissions.createdAt, sinceDate));
  const where = and(...conditions);

  const [rows, [{ total }]] = await Promise.all([
    db.select().from(s.submissions).where(where).orderBy(asc(s.submissions.createdAt), asc(s.submissions.id)).limit(pageSize).offset((page - 1) * pageSize),
    db.select({ total: count() }).from(s.submissions).where(where),
  ]);

  const matches = (m: Member) => (m.institution ?? "").toLowerCase().includes(partner.institutionMatch);
  const registrations = rows.map((row) => {
    const data = row.data as { team?: string; size?: number; level?: string; fee?: string; members?: Member[]; source?: string };
    const own = data.source === sourceLabel(partner);
    const members = (data.members ?? []).map((m, i) => ({ ...m, isTeamLead: i === 0 })).filter((m) => own || matches(m));
    return {
      id: row.id,
      registeredAt: row.createdAt.toISOString(),
      competition: row.subject,
      teamName: data.team || null,
      teamSize: data.size ?? data.members?.length ?? null,
      level: data.level ?? null,
      fee: data.fee ?? null,
      status: row.status,
      paymentStatus: row.paymentStatus ?? "Not checked",
      paymentSlipUploaded: Boolean((row.data as { paymentSlip?: string }).paymentSlip),
      submittedVia: own ? "partner-api" : "website",
      members: members.map((m) => ({
        name: m.name ?? null,
        email: m.email ?? null,
        phone: m.phone ?? null,
        institution: m.institution ?? null,
        gender: m.gender ?? null,
        isTeamLead: m.isTeamLead,
      })),
    };
  });

  const filters = [competition && `competition=${competition}`, status && `status=${status}`, since && `since=${since}`, `page=${page}`].filter(Boolean).join(", ");
  await logPartnerCall(partner, "/registrations", `${registrations.length} of ${total} returned (${filters})`);
  return json({ page, pageSize, total, registrations });
}

type NewRegistration = {
  competition?: unknown;
  teamName?: unknown;
  level?: unknown;
  idNumber?: unknown;
  members?: unknown;
  consent?: unknown;
};

/**
 * POST /api/partner/v1/registrations: register one team for a competition from the partner's website.
 * Same rules as the CYE form (registration open, team size, required fields, payment slip, emails).
 * Body: JSON, or multipart with a "registration" JSON field and a "paymentSlip" image file.
 */
export async function POST(req: NextRequest) {
  const partner = authorize(req);
  if (partner instanceof Response) return partner;

  let raw = "";
  let slip: File | null = null;
  const contentType = req.headers.get("content-type") ?? "";
  if (contentType.includes("multipart/form-data")) {
    let form: FormData;
    try {
      form = await req.formData();
    } catch {
      return json({ error: "Could not read the form data. The request may be larger than 4.5 MB." }, 400);
    }
    raw = String(form.get("registration") ?? "");
    const file = form.get("paymentSlip");
    if (file instanceof File && file.size > 0) slip = file;
    if (slip && slip.size > MAX_SLIP_BYTES) return json({ error: "paymentSlip must be 4 MB or smaller." }, 413);
  } else if (contentType.includes("application/json")) {
    raw = await req.text();
  } else {
    return json({ error: "Send application/json, or multipart/form-data with a payment slip." }, 415);
  }
  if (!raw) return json({ error: "Missing registration details." }, 400);
  if (raw.length > 50_000) return json({ error: "Registration details are too large." }, 413);

  let body: NewRegistration;
  try {
    body = JSON.parse(raw);
  } catch {
    return json({ error: "Registration details must be valid JSON." }, 400);
  }
  if (!body || typeof body !== "object") return json({ error: "Registration details must be a JSON object." }, 400);
  if (body.consent !== true) return json({ error: "consent: must be true (the team has read and accepts the competition rules, and the details are accurate)" }, 422);
  if (!Array.isArray(body.members) || body.members.length === 0) return json({ error: "members: add at least one team member" }, 422);
  if (typeof body.idNumber !== "string" || !body.idNumber.trim()) return json({ error: "idNumber: required (the team lead's CNIC, Student ID or B-Form number)" }, 422);
  if (typeof body.level !== "string" || !EDUCATION_LEVELS.includes(body.level)) return json({ error: `level: must be one of ${EDUCATION_LEVELS.join(", ")}` }, 422);

  // Accept the competition name in any letter case; store the official spelling.
  const wanted = typeof body.competition === "string" ? body.competition.trim().toLowerCase() : "";
  const competition = (await getCompetitions()).find((c) => c.name.toLowerCase() === wanted);
  if (!competition) return json({ error: "competition: unknown competition. Use a name from GET /competitions." }, 422);

  const data = {
    competition: competition.name,
    size: body.members.length,
    team: typeof body.teamName === "string" ? body.teamName : "",
    level: body.level,
    idNumber: body.idNumber,
    members: body.members,
    consent_accuracy: "on",
    consent_rules: "on",
  };

  const result = await createSubmission({ type: "competition", data, slip, ip: null, origin: siteOrigin(req), source: sourceLabel(partner) });
  const team = typeof body.teamName === "string" && body.teamName ? body.teamName : "solo entry";
  await logPartnerCall(partner, "POST /registrations", result.ok ? `Created #${result.id}: ${competition.name}, ${team}` : `Rejected: ${result.error}`);
  if (!result.ok) return json({ error: result.error }, result.status);
  return json({ id: result.id, status: "new", paymentStatus: "Not checked", paymentSlipUploaded: result.slipStored }, 201);
}
