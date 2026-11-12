/** Digits for wa.me / tel links from a Pakistani number as typed, e.g. "+92 349 9181998" or "0349-9181998". */
export function phoneDigits(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("0")) return `92${digits.slice(1)}`;
  return digits;
}

export const whatsappLink = (phone: string) => `https://wa.me/${phoneDigits(phone)}`;
export const telLink = (phone: string) => `tel:+${phoneDigits(phone)}`;
