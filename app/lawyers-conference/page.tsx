import type { Metadata } from "next";
import { LawyersConference } from "@/components/LawyersConference";
import { SiteChrome } from "@/components/SiteChrome";
import { LAWYERS_CONFERENCE } from "@/data/event";

// Seats left is re-read every minute.
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Lawyers Conference | Capital Youth Expo 2026",
  description: `${LAWYERS_CONFERENCE.topic}: a free panel discussion for law students and lawyers at Capital Youth Expo 2026. Register for your seat.`,
};

export default function LawyersConferencePage() {
  return (
    <SiteChrome>
      <main id="main">
        <LawyersConference />
      </main>
    </SiteChrome>
  );
}
