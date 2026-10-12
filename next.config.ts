import type { NextConfig } from "next";
import { assertSigningSecretForBuild } from "./src/lib/security/clientIp";
import { apiUrl } from "./src/lib/site";

// Vercel production builds stop on a missing or weak CLIENT_IP_SIGNING_SECRET (preview
// builds warn, local builds aren't checked) — see src/lib/security/clientIp.ts
assertSigningSecretForBuild(process.env);

// Where the NestJS API runs (src/lib/site.ts). The browser only ever talks to this Next app:
// /api/* is forwarded to the backend, so auth cookies are first-party and no CORS is involved.
const API_URL = apiUrl();

/**
 * Sent with every page and file. Only what can't break the app: no script/style CSP
 * (the theme script and Next's inline bootstrap would need nonces) — just "never inside
 * someone else's frame" (clickjacking), no MIME sniffing, no full URLs (invite codes)
 * in the Referer sent to other sites, and no camera/microphone/location for anyone.
 */
const SECURITY_HEADERS = [
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
];

const nextConfig: NextConfig = {
  reactCompiler: true,
  // No "X-Powered-By: Next.js"
  poweredByHeader: false,

  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },

  async rewrites() {
    return [{ source: "/api/:path*", destination: `${API_URL}/api/:path*` }];
  },
};

export default nextConfig;
