import type { Metadata } from "next";
import { CampusAmbassador } from "@/components/CampusAmbassador";
import { SiteChrome } from "@/components/SiteChrome";

export const metadata: Metadata = {
  title: "Campus Ambassador Registration | Capital Youth Expo 2026",
  description:
    "Apply to become a Capital Youth Expo 2026 Campus Ambassador and represent CYE at your institution.",
};

export default function AmbassadorsPage() {
  return (
    <SiteChrome>
      <main id="main">
        <CampusAmbassador />
      </main>
    </SiteChrome>
  );
}
