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
    ];
  },
};

export default nextConfig;
