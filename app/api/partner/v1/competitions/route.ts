import type { NextRequest } from "next/server";
import { getCompetitions, getSettings } from "@/lib/content";
import { authorize, json, logPartnerCall, siteOrigin } from "@/lib/partner";

export const dynamic = "force-dynamic";

/** GET /api/partner/v1/competitions: competitions currently shown on the website. */
export async function GET(req: NextRequest) {
  const partner = authorize(req);
  if (partner instanceof Response) return partner;

  const [competitions, settings] = await Promise.all([getCompetitions(), getSettings()]);
  const origin = siteOrigin(req);
  await logPartnerCall(partner, "/competitions", `${competitions.length} competitions`);
  return json({
    registrationOpen: settings.registration_open.competitions,
    competitions: competitions.map((c) => ({
      id: c.id ?? null,
      name: c.name,
      category: c.vertical,
      audience: c.audience,
      fee: c.fee,
      teamMin: c.teamMin,
      teamMax: c.teamMax,
      description: c.desc,
      rulebookUrl: c.rulebook ? (c.rulebook.startsWith("/") ? `${origin}${c.rulebook}` : c.rulebook) : null,
    })),
  });
}
