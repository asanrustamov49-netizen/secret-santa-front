// Google sign-in is a full-page navigation, not an API call:
// /api/auth/google → Google → /api/auth/google/callback → /auth/callback (or /login?error=…)
import type { Messages } from "@/i18n/messages/en";

/** Start URL; `next` is where the user lands afterwards (checked again by the API) */
export function googleSignInUrl(next: string): string {
  return next === "/dashboard" ? "/api/auth/google" : `/api/auth/google?next=${encodeURIComponent(next)}`;
}

/** Message for a /login?error= code the API redirected with, or null for anything we don't know */
export function googleErrorMessage(code: string | null, m: Messages): string | null {
  return code ? (m.auth.googleErrors[code] ?? null) : null;
}

/**
 * A signed-in user confirms who they are with Google again (e.g. before setting a
 * first password). Nobody gets signed in by it; the API comes back to
 * /settings?reauth=ok, or ?reauth=<code> on failure.
 */
export const GOOGLE_REAUTH_URL = "/api/auth/google?intent=reauth";

/** Message for a failed ?reauth= result */
export function reauthErrorMessage(code: string, m: Messages): string {
  return m.auth.reauthErrors[code] ?? m.auth.reauthFailed;
}
