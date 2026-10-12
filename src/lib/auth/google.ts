import type { Messages } from "@/i18n/messages/en";

/**
 * Start URL; `next` is where the user lands afterwards. Relative (same origin, through
 * the /api rewrite) — so it renders on the server as well, where there is no window.
 */
export function googleSignInUrl(next: string): string {
  const start = "/api/auth/google";
  return next === "/dashboard" ? start : `${start}?${new URLSearchParams({ next })}`;
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
