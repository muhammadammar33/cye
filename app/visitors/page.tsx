import type { Metadata } from "next";
import { VisitorPass } from "@/components/VisitorPass";
import { SiteChrome } from "@/components/SiteChrome";

export const metadata: Metadata = {
  title: "Visitor Pass | Capital Youth Expo 2026",
  description:
    "Register for your Capital Youth Expo 2026 visitor pass — 18 November 2026 at Pak-China Friendship Center, Islamabad.",
};

export default function VisitorsPage() {
  return (
    <SiteChrome>
      <main id="main">
        <VisitorPass />
      </main>
    </SiteChrome>
  );
}
