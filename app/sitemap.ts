import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date("2026-09-25");
  return [
    { url: "https://capitalyouthexpo.com", lastModified, changeFrequency: "weekly", priority: 1 },
    { url: "https://capitalyouthexpo.com/competitions", lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: "https://capitalyouthexpo.com/ambassadors", lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: "https://capitalyouthexpo.com/volunteers", lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: "https://capitalyouthexpo.com/projects", lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: "https://capitalyouthexpo.com/startups", lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: "https://capitalyouthexpo.com/visitors", lastModified, changeFrequency: "weekly", priority: 0.8 },
    { url: "https://capitalyouthexpo.com/contact", lastModified, changeFrequency: "monthly", priority: 0.6 },
  ];
}
