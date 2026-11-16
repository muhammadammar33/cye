/** Coupon rules shared by the registration form and the server. */

/** Discount a head ambassador's coupon gives on a competition registration fee. */
export const COUPON_PERCENT = 10;

/** Codes are stored and compared in capitals without spaces, e.g. " cye-nust " -> "CYE-NUST". */
export const normalizeCoupon = (code: string) => code.trim().toUpperCase().replace(/\s+/g, "");

/**
 * The fee after the coupon, keeping the fee's own wording ("PKR 2,500" -> "PKR 2,250").
 * Null when the fee has no single amount to discount.
 */
export function discountedFee(fee: string, percent = COUPON_PERCENT) {
  const amounts = fee.match(/\d[\d,]*/g);
  if (!amounts || amounts.length !== 1) return null;
  const amount = Number(amounts[0].replace(/,/g, ""));
  if (!amount) return null;
  const after = Math.round((amount * (100 - percent)) / 100);
  return fee.replace(amounts[0], after.toLocaleString("en-US"));
}
