import type { Metadata } from "next";
import { SiteChrome } from "@/components/SiteChrome";
import { TalentTribute } from "@/components/TalentTribute";

export const metadata: Metadata = {
  title: "Talent Tribute | Capital Youth Expo 2026",
  description:
    "Talent Tribute at Capital Youth Expo 2026 honours students from Class 9 to BS with 80% or above. Check your eligibility and apply with your result card.",
};

export default function TalentTributePage() {
  return (
    <SiteChrome>
      <main id="main">
        <TalentTribute />
      </main>
    </SiteChrome>
  );
}
