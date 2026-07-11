import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {
    root: ".",
  },
  async rewrites() {
    const backend = process.env.NEXT_PUBLIC_AOMI_BACKEND_URL || "https://api.aomi.dev";
    return [
      {
        source: "/aomi/:path*",
        destination: `${backend}/:path*`,
      },
    ];
  },
};

export default nextConfig;
