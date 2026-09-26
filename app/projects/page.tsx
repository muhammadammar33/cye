import type { Metadata } from "next";
import { ProjectExhibition } from "@/components/ProjectExhibition";
import { SiteChrome } from "@/components/SiteChrome";

export const metadata: Metadata = {
  title: "Project Exhibition | Capital Youth Expo 2026",
  description:
    "Submit your project to the CYE 2026 Project Exhibition — compete for the prize pool and showcase your work at Pak-China Friendship Center, Islamabad.",
};

export default function ProjectsPage() {
  return (
    <SiteChrome>
      <main id="main">
        <ProjectExhibition />
      </main>
    </SiteChrome>
  );
}
