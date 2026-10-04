import "server-only";
import type { SlipMode } from "@/components/competitions/TeamRegistrationForm";
import { blobConfigured } from "@/lib/blob";
import type { SiteSettings } from "@/lib/defaults";

/** Payment slip upload: hidden without a Blob store, required when accounts are published and the admin requires it. */
export function slipModeFor(settings: SiteSettings): SlipMode {
  if (!blobConfigured()) return "off";
  return settings.payment.slipRequired && settings.payment.accounts.length > 0 ? "required" : "optional";
}
