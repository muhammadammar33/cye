import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";
import { logActivity } from "@/lib/admin/log";

/**
 * Read-only partner APIs. Each partner has its own key (env var) and only ever sees
 * registrations from its own institution; the filter is applied here, never taken from the request.
 */
export const PARTNERS = {
  bahria: { name: "Bahria University", keyEnv: "PARTNER_KEY_BAHRIA", institutionMatch: "bahria" },
} as const;
export type PartnerId = keyof typeof PARTNERS;
export type Partner = (typeof PARTNERS)[PartnerId] & { id: PartnerId };

const digest = (value: string) => createHash("sha256").update(value).digest();

/** The partner whose key is in `Authorization: Bearer <key>`, or null. */
export function partnerFromRequest(req: NextRequest): Partner | null {
  const header = req.headers.get("authorization") ?? "";
  const key = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (key.length < 32) return null;
  for (const [id, partner] of Object.entries(PARTNERS) as [PartnerId, (typeof PARTNERS)[PartnerId]][]) {
    const expected = process.env[partner.keyEnv];
    // Compare fixed-length digests so the check takes the same time whatever the key.
    if (expected && expected.length >= 32 && timingSafeEqual(digest(key), digest(expected))) return { ...partner, id };
  }
  return null;
}

// Best-effort limit per server instance: 60 requests a minute per partner.
const WINDOW_MS = 60_000;
const LIMIT = 60;
const hits = new Map<string, number[]>();
export function rateLimited(partner: PartnerId) {
  const now = Date.now();
  const recent = (hits.get(partner) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(partner, recent);
  return recent.length > LIMIT;
}

export const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } });

/** Auth + rate limit; returns the partner or the error response to send. */
export function authorize(req: NextRequest): Partner | Response {
  const partner = partnerFromRequest(req);
  if (!partner) return json({ error: "Missing or invalid API key." }, 401);
  if (rateLimited(partner.id)) return json({ error: "Too many requests. Limit: 60 per minute." }, 429);
  return partner;
}

/** Shows partner API use in Admin -> Activity log. */
export function logPartnerCall(partner: Partner, endpoint: string, details: string) {
  return logActivity({ id: null, name: `${partner.name} (API)`, email: `partner:${partner.id}` }, "Partner API call", endpoint, details);
}

/** Stored on registrations a partner submits, and shown in admin. */
export const sourceLabel = (partner: Partner) => `${partner.name} API`;

export function siteOrigin(req: NextRequest) {
  return process.env.SITE_URL?.replace(/\/$/, "") || req.nextUrl.origin;
}
