import type { Metadata } from "next";
import { MedicalConference } from "@/components/MedicalConference";
import { SiteChrome } from "@/components/SiteChrome";
import { MEDICAL_CONFERENCE } from "@/data/event";

// Seats left is re-read every minute.
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Medical Conference | Capital Youth Expo 2026",
  description: `${MEDICAL_CONFERENCE.topic}: a free panel discussion for medical students and doctors at Capital Youth Expo 2026. Register for your seat.`,
};

export default function MedicalConferencePage() {
  return (
    <SiteChrome>
      <main id="main">
        <MedicalConference />
      </main>
    </SiteChrome>
  );
}
