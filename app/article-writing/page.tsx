import type { Metadata } from "next";
import { ArticleWriting } from "@/components/ArticleWriting";
import { SiteChrome } from "@/components/SiteChrome";

export const metadata: Metadata = {
  title: "National Article Writing Competition 2026 | Capital Youth Expo 2026",
  description:
    "PRIZE's National Article Writing Competition 2026: themes, eligibility, prizes up to Rs. 100,000, important dates, and how to register and submit.",
};

export default function ArticleWritingPage() {
  return (
    <SiteChrome>
      <main id="main">
        <ArticleWriting />
      </main>
    </SiteChrome>
  );
}
