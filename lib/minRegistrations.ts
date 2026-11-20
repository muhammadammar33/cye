/**
 * Registrations needed for the registration fees to cover the prize pool (pool ÷ fee, rounded up), e.g. Naat:
 * PKR 30,000 ÷ PKR 500 = 60. Null when the pool or the fee has no single amount.
 */
export function minRegistrations(prizes: string[], fee: string) {
  const amounts = prizes.map((p) => Number(p.replace(/[^\d]/g, "")));
  if (amounts.length < 2 || amounts.some((n) => !n)) return null;
  const fees = fee.match(/\d[\d,]*/g);
  const perEntry = fees?.length === 1 ? Number(fees[0].replace(/,/g, "")) : 0;
  return perEntry ? Math.ceil(amounts.reduce((a, b) => a + b, 0) / perEntry) : null;
}

/** Share of the minimum at which the "minimum registrations" note is no longer shown. */
export const MIN_NOTICE_HIDE_AT = 0.8;
