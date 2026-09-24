import type { Metadata } from "next";
import { Competitions } from "@/components/Competitions";
import { SiteChrome } from "@/components/SiteChrome";

export const metadata: Metadata = {
  title: "Competitions | Capital Youth Expo 2026",
  description:
    "Register for CYE 2026 competitions — hackathons, pitches, exhibitions, debates, and school talent events at Pak-China Friendship Center, Islamabad.",
};

export default function CompetitionsPage() {
  return (
    <SiteChrome>
      <main id="main">
        <Competitions />
      </main>
    </SiteChrome>
  );
}
