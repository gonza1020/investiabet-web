import type { NextConfig } from "next";

const apiProxyTarget =
  process.env.API_PROXY_TARGET ?? "http://localhost:8000";

const nextConfig: NextConfig = {
  async rewrites() {
    if (process.env.NODE_ENV === "development") {
      return [
        {
          source: "/api/:path*",
          destination: `${apiProxyTarget}/api/:path*`,
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
