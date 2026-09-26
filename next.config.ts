import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: false,
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
      { source: "/register", destination: "/competitions", permanent: false },
    ];
  },
};

export default nextConfig;
