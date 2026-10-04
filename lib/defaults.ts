import { EMAILS, REGISTRATION_OPEN, SOCIAL_LINKS } from "@/data/event";

export type RegistrationKey = keyof typeof REGISTRATION_OPEN;

/** Default values for the `settings` table. Admins edit these in /admin/settings. */
export type PaymentAccount = { method: string; title: string; number: string };

/** Competition fee payment details shown on /competitions (edited in Admin → Settings). */
export type PaymentSettings = {
  /** Ask competitors to upload a payment slip when registering. */
  slipRequired: boolean;
  instructions: string;
  accounts: PaymentAccount[];
};

export const DEFAULT_SETTINGS = {
  registration_open: { ...REGISTRATION_OPEN } as Record<RegistrationKey, boolean>,
  inboxes: { ...EMAILS } as Record<keyof typeof EMAILS, string>,
  social_links: { ...SOCIAL_LINKS } as Record<keyof typeof SOCIAL_LINKS, string>,
  payment: {
    slipRequired: true,
    instructions:
      "Pay the registration fee for your competition to one of the accounts below, then upload a screenshot or photo of the payment slip with your registration. Write your team name in the payment reference if possible.",
    accounts: [],
  } as PaymentSettings,
};

export type SiteSettings = typeof DEFAULT_SETTINGS;
