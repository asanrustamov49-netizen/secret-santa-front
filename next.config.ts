import type { NextConfig } from "next";

// Where the NestJS API runs. The browser only ever talks to this Next app:
// /api/* is forwarded to the backend, so auth cookies are first-party and no CORS is involved.
const API_URL = process.env.API_URL ?? "https://secret-santa-back-k0vs.onrender.com";

const nextConfig: NextConfig = {
  reactCompiler: true,

  async rewrites() {
    return [{ source: "/api/:path*", destination: `${API_URL}/api/:path*` }];
  },
};

export default nextConfig;
