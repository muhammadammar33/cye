import type { NextRequest } from "next/server";
import { COUPON_PERCENT } from "@/lib/coupons";
import { findCoupon } from "@/lib/couponLookup";

export const dynamic = "force-dynamic";

/** GET /api/coupons?code=CYE-NUST: whether a coupon code is valid, for the registration form. */
export async function GET(req: NextRequest) {
  const owner = await findCoupon(req.nextUrl.searchParams.get("code") ?? "");
  return Response.json(
    owner ? { valid: true, code: owner.code, percent: COUPON_PERCENT, ambassador: owner.name, institute: owner.institute } : { valid: false },
    { headers: { "Cache-Control": "no-store" } },
  );
}
