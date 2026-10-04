import type { Metadata } from "next";
import { Competitions } from "@/components/Competitions";
import { SiteChrome } from "@/components/SiteChrome";
import { getCompetitions, getSettings } from "@/lib/content";
import { slipModeFor } from "@/lib/payment";

export const metadata: Metadata = {
  title: "Competitions | Capital Youth Expo 2026",
  description:
    "Register for CYE 2026 competitions: robotics, hackathons, cyber security, startup pitches, design, youth parliament, and literary events at Pak-China Friendship Center, Islamabad.",
};

export default async function CompetitionsPage() {
  const [competitions, settings] = await Promise.all([getCompetitions(), getSettings()]);
  return (
    <SiteChrome>
      <main id="main">
        <Competitions
          competitions={competitions}
          open={settings.registration_open.competitions}
          inbox={settings.inboxes.competitions}
          payment={settings.payment}
          slipMode={slipModeFor(settings)}
        />
      </main>
    </SiteChrome>
  );
}
