import { and, asc, count, eq, gte, sql, type SQL } from "drizzle-orm";
import type { NextRequest } from "next/server";
import { db, schema as s } from "@/lib/db";
import { SUBMISSION_STATUSES, type SubmissionStatus } from "@/lib/db/schema";
import { authorize, json, logPartnerCall } from "@/lib/partner";

export const dynamic = "force-dynamic";

type Member = { name?: string; email?: string; phone?: string; institution?: string; gender?: string };

/**
 * GET /api/partner/v1/registrations: competition registrations with at least one member from the
 * partner's institution (any campus). Only those members are returned; CNIC/ID, payment slips,
 * admin notes and IPs are never included.
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
    sql`exists (select 1 from jsonb_array_elements(coalesce(${s.submissions.data}->'members', '[]'::jsonb)) m where m->>'institution' ilike ${pattern})`,
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
    const data = row.data as { team?: string; size?: number; level?: string; fee?: string; members?: Member[] };
    const members = (data.members ?? []).map((m, i) => ({ ...m, isTeamLead: i === 0 })).filter(matches);
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
