import type { Messages } from "@/i18n/messages/en";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not configured");
}

/** Start URL; `next` is where the user lands afterwards */
export function googleSignInUrl(next: string): string {
  const url = new URL("/api/auth/google", window.location.origin);

  if (next !== "/dashboard") {
    url.searchParams.set("next", next);
  }

  return url.toString();
}

/** Message for a /login?error= code the API redirected with, or null for anything we don't know */
export function googleErrorMessage(
  code: string | null,
  m: Messages,
): string | null {
  return code ? (m.auth.googleErrors[code] ?? null) : null;
}

/**
 * A signed-in user confirms who they are with Google again.
 */
export const GOOGLE_REAUTH_URL = "/api/auth/google?intent=reauth";

/** Message for a failed ?reauth= result */
export function reauthErrorMessage(code: string, m: Messages): string {
  return m.auth.reauthErrors[code] ?? m.auth.reauthFailed;
}
