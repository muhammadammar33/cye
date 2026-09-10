import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://capitalyouthexpo.com",
      lastModified: new Date("2026-09-10"),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
