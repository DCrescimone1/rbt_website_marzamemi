import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      { source: "/favicon.ico", destination: "/favicon_io/favicon.ico" },
      { source: "/apple-touch-icon.png", destination: "/favicon_io/apple-touch-icon.png" },
      { source: "/favicon-32x32.png", destination: "/favicon_io/favicon-32x32.png" },
      { source: "/favicon-16x16.png", destination: "/favicon_io/favicon-16x16.png" },
    ];
  },
};

export default nextConfig;
