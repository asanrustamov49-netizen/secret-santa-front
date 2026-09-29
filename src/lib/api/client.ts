import axios, { AxiosError, type InternalAxiosRequestConfig } from "axios";
import type { Messages } from "@/i18n/messages/en";

// Same-origin: next.config rewrites /api/* to the NestJS backend.
export const api = axios.create({
  baseURL: "/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

/** Shape of NestJS errors ({ statusCode, message, error }) */
interface ApiErrorBody {
  statusCode?: number;
  message?: string | string[];
}

/** An API message in the reader's language: listed translations, else as the API sent it */
export function translateServerMessage(message: string, m: Messages): string {
  const exact = m.server.exact[message];
  if (exact) return exact;
  for (const { pattern, text } of m.server.patterns) {
    const match = message.match(pattern);
    if (match) return text(match);
  }
  return message;
}

/** Human-readable message out of any API error — for forms and toasts, in the language of `m` */
export function getErrorMessage(error: unknown, m: Messages, fallback: string = m.errors.generic): string {
  if (error instanceof AxiosError) {
    if (!error.response) return m.errors.offline;
    // 5xx (incl. the dev proxy failing when the API is down) — never show raw server text
    if (error.response.status >= 500) return m.errors.server;
    // Rate limits answer with a technical "ThrottlerException…" message
    if (error.response.status === 429) return m.errors.tooMany;
    const first = apiMessage(error);
    if (first) return translateServerMessage(first, m);
  }
  return fallback;
}

/** The API's own (English) message, untranslated — for telling errors apart, not for display */
export function apiMessage(error: unknown): string | undefined {
  if (!(error instanceof AxiosError)) return undefined;
  const message = (error.response?.data as ApiErrorBody | undefined)?.message;
  return Array.isArray(message) ? message[0] : message;
}

// ─── Silent session refresh ──────────────────────────────────────────
// Access tokens live 15 minutes. On a 401 we call /auth/refresh once and replay
// the request; parallel 401s share that single refresh call.

let refreshing: Promise<void> | null = null;

/**
 * Calls whose 401 means "wrong credentials / no session" — refreshing and replaying
 * them makes no sense. Matched by exact path: a prefix match would also catch
 * /auth/logout-all, an ordinary signed-in call that must refresh and retry.
 */
const AUTH_ENDPOINTS = new Set(["/auth/login", "/auth/register", "/auth/refresh", "/auth/logout"]);

export function isAuthEndpoint(url: string | undefined): boolean {
  return url !== undefined && AUTH_ENDPOINTS.has(url.split(/[?#]/)[0]);
}

api.interceptors.response.use(undefined, async (error: AxiosError) => {
  const request = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined;
  const isAuthCall = isAuthEndpoint(request?.url);

  if (error.response?.status !== 401 || !request || request._retried || isAuthCall) {
    throw error;
  }

  request._retried = true;
  refreshing ??= api
    .post("/auth/refresh")
    .then(() => undefined)
    .finally(() => {
      refreshing = null;
    });

  try {
    await refreshing;
  } catch {
    // Another tab may have rotated the token a moment earlier and already stored
    // fresh cookies in this browser — the one retry below tells. If the session
    // really is over, that retry gets a 401 of its own (it's marked _retried).
  }
  return api(request);
});
