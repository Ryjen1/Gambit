import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {
    root: ".",
  },
  async rewrites() {
    const backend = "https://chat.aomi.dev";
    return [
      {
        source: "/aomi/:path*",
        destination: `${backend}/:path*`,
      },
    ];
  },
};

export default nextConfig;
