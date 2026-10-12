/**
 * Public address of the site, for absolute links that leave the page: social previews
 * (og:image must be reachable by a crawler — never localhost in production), robots.txt
 * and the sitemap.
 *   NEXT_PUBLIC_SITE_URL / SITE_URL — set explicitly (e.g. a custom domain)
 *   VERCEL_PROJECT_PRODUCTION_URL   — set by Vercel on every deployment: the production domain, no protocol
 *   http://localhost:3000           — local development
 */
export function siteUrl(): string {
  const explicit = (process.env.NEXT_PUBLIC_SITE_URL ?? process.env.SITE_URL)?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}

/** The NestJS API, as the server reaches it (next.config rewrites /api/* here too). Read at build and run time. */
export function apiUrl(): string {
  return (process.env.API_URL ?? "https://secret-santa-back-k0vs.onrender.com").replace(/\/+$/, "");
}
