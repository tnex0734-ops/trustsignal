import type { NextConfig } from "next";
import { getStaticSecurityHeaders } from "./src/lib/security/headers";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: getStaticSecurityHeaders(),
      },
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "default-src 'none'; frame-ancestors 'none';",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
