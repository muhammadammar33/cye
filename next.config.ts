import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: false,
    // Admin-uploaded photos are stored in Vercel Blob.
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
  },
  experimental: {
    // Room for admin photo uploads (images are capped at 3 MB in the upload action).
    serverActions: { bodySizeLimit: "4mb" },
  },
  agentRules: false,
  async redirects() {
    return [
      { source: "/competition", destination: "/competitions", permanent: true },
      { source: "/ambassador", destination: "/ambassadors", permanent: true },
      { source: "/volunteer", destination: "/volunteers", permanent: true },
      { source: "/project", destination: "/projects", permanent: true },
      { source: "/startup", destination: "/startups", permanent: true },
      { source: "/visitor", destination: "/visitors", permanent: true },
      { source: "/article", destination: "/article-writing", permanent: true },
      { source: "/register", destination: "/competitions", permanent: false },
    ];
  },
};

export default nextConfig;
