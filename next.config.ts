import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/webp"],
    qualities: [75],
    minimumCacheTTL: 86_400,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.convex.cloud",
        pathname: "/api/storage/**",
        search: "",
      },
    ],
  },
};

export default nextConfig;
