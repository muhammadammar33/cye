import type { Metadata } from "next";
import { SiteChrome } from "@/components/SiteChrome";
import { VolunteerForm } from "@/components/VolunteerForm";

export const metadata: Metadata = {
  title: "Volunteer Form | Capital Youth Expo 2026",
  description:
    "Sign up to volunteer at Capital Youth Expo 2026 — operations, outreach, hospitality, media, registration, and stage roles.",
};

export default function VolunteersPage() {
  return (
    <SiteChrome>
      <main id="main">
        <VolunteerForm />
      </main>
    </SiteChrome>
  );
}
