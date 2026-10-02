import "server-only";
import { and, eq, ilike, or, type SQL } from "drizzle-orm";
import { schema as s } from "@/lib/db";
import { SUBMISSION_STATUSES, SUBMISSION_TYPES, type SubmissionStatus, type SubmissionType } from "@/lib/db/schema";

export type SubmissionFilters = { type?: SubmissionType; status?: SubmissionStatus; q?: string };

export function parseFilters(params: Record<string, string | string[] | undefined>): SubmissionFilters {
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const type = one(params.type);
  const status = one(params.status);
  const q = one(params.q)?.trim();
  return {
    type: SUBMISSION_TYPES.includes(type as SubmissionType) ? (type as SubmissionType) : undefined,
    status: SUBMISSION_STATUSES.includes(status as SubmissionStatus) ? (status as SubmissionStatus) : undefined,
    q: q || undefined,
  };
}

export function whereFor(f: SubmissionFilters): SQL | undefined {
  const parts: SQL[] = [];
  if (f.type) parts.push(eq(s.submissions.type, f.type));
  if (f.status) parts.push(eq(s.submissions.status, f.status));
  if (f.q) {
    const like = `%${f.q.replace(/[%_]/g, "\\$&")}%`;
    parts.push(or(ilike(s.submissions.name, like), ilike(s.submissions.email, like), ilike(s.submissions.subject, like), ilike(s.submissions.institution, like), ilike(s.submissions.phone, like))!);
  }
  return parts.length ? and(...parts) : undefined;
}

export function filterQuery(f: SubmissionFilters, extra: Record<string, string | number> = {}) {
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries({ ...f, ...extra })) if (v !== undefined && v !== "") params.set(k, String(v));
  const str = params.toString();
  return str ? `?${str}` : "";
}
