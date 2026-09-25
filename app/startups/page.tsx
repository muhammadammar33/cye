import type { Metadata } from "next";
import { StartupArena } from "@/components/StartupArena";
import { SiteChrome } from "@/components/SiteChrome";

export const metadata: Metadata = {
  title: "Startup Arena | Capital Youth Expo 2026",
  description:
    "Pitch your startup at CYE 2026 — shortlisted startups get investor networking, mentorship, and exhibition space.",
};

export default function StartupsPage() {
  return (
    <SiteChrome>
      <main id="main">
        <StartupArena />
      </main>
    </SiteChrome>
  );
}
