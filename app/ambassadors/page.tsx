import type { Metadata } from "next";
import { CampusAmbassador } from "@/components/CampusAmbassador";
import { SiteChrome } from "@/components/SiteChrome";

export const metadata: Metadata = {
  title: "Campus Ambassadors | Capital Youth Expo 2026",
  description:
    "Meet the Capital Youth Expo 2026 Campus Ambassadors at your institute and WhatsApp your head ambassador.",
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
