import "server-only";
import { and, eq } from "drizzle-orm";
import { db, schema as s } from "@/lib/db";
import { normalizeCoupon } from "@/lib/coupons";

export type CouponOwner = { code: string; name: string; institute: string };

/** The head ambassador a coupon code belongs to, or null if the code is unknown or hidden. */
export async function findCoupon(input: string): Promise<CouponOwner | null> {
  const code = normalizeCoupon(input);
  if (!db || !code || code.length > 40) return null;
  const [row] = await db
    .select({ code: s.ambassadors.coupon, name: s.ambassadors.name, institute: s.ambassadors.institute })
    .from(s.ambassadors)
    .where(and(eq(s.ambassadors.coupon, code), eq(s.ambassadors.active, true)))
    .limit(1);
  return row?.code ? { code: row.code, name: row.name, institute: row.institute } : null;
}
