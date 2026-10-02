import { EMAILS, REGISTRATION_OPEN, SOCIAL_LINKS } from "@/data/event";

export type RegistrationKey = keyof typeof REGISTRATION_OPEN;

/** Default values for the `settings` table. Admins edit these in /admin/settings. */
export const DEFAULT_SETTINGS = {
  registration_open: { ...REGISTRATION_OPEN } as Record<RegistrationKey, boolean>,
  inboxes: { ...EMAILS } as Record<keyof typeof EMAILS, string>,
  social_links: { ...SOCIAL_LINKS } as Record<keyof typeof SOCIAL_LINKS, string>,
};

export type SiteSettings = typeof DEFAULT_SETTINGS;
