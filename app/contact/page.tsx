import type { Metadata } from "next";
import { ContactPage } from "@/components/ContactPage";
import { SiteChrome } from "@/components/SiteChrome";

export const metadata: Metadata = {
  title: "Contact | Capital Youth Expo 2026",
  description:
    "Contact the Capital Youth Expo 2026 team for competitions, sponsorship, stalls, startups, and general queries.",
};

export default function ContactRoute() {
  return (
    <SiteChrome>
      <main id="main">
        <ContactPage />
      </main>
    </SiteChrome>
  );
}
