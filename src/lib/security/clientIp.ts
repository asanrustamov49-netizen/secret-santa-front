// The visitor's IP, signed for the API's sign-in limits. Server-only: used by src/proxy.ts.
//
// The browser reaches the API through the /api rewrite, so the API sees Vercel's address,
// and any X-Forwarded-For it gets could have been typed by the client. Here, on Vercel,
// the IP comes from x-real-ip, which Vercel sets itself, and is signed with
// CLIENT_IP_SIGNING_SECRET (never NEXT_PUBLIC_: it must not reach the browser).
// The API checks the signature and its timestamp (backend src/auth/client-ip.ts).

// ─── The secret itself ────────────────────────────────────────────────
// Rules for CLIENT_IP_SIGNING_SECRET — the same as the API's (backend
// src/config/signing-secret.ts): 32+ random bytes as base64url (43+ characters) or hex
// (64+ characters), not visibly repetitive. No message ever holds the value.

export type SigningSecretProblem = "missing" | "bad_format" | "too_short" | "low_variety";

const BASE64URL = /^[A-Za-z0-9_-]+$/;
const HEX = /^[0-9a-fA-F]+$/;

export function signingSecretProblem(value: string | undefined): SigningSecretProblem | null {
  const secret = value?.trim();
  if (!secret) return "missing";
  if (!BASE64URL.test(secret)) return "bad_format";

  const hex = HEX.test(secret);
  if (secret.length < (hex ? 64 : 43)) return "too_short";
  if (new Set(secret).size < (hex ? 10 : 16)) return "low_variety";
  return null;
}

const DESCRIPTIONS: Record<SigningSecretProblem, string> = {
  missing: "is not set",
  bad_format: "is not base64url or hex",
  too_short: "is too short",
  low_variety: "is not random enough",
};

/** "CLIENT_IP_SIGNING_SECRET is too short (…how to make one)" — never the value */
export function describeSigningSecretProblem(problem: SigningSecretProblem): string {
  return (
    `CLIENT_IP_SIGNING_SECRET ${DESCRIPTIONS[problem]} (expected 32+ random bytes as base64url ` +
    `or hex: node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))")`
  );
}

/**
 * Build-time check, from next.config.ts. Vercel's production build stops on a missing or
 * weak secret — the failed deployment never replaces the live one — because a production
 * site that signs nothing puts every sign-in into the API's one shared "unverified" limit.
 * Preview builds only warn (they may run without it); local builds aren't checked.
 */
export function assertSigningSecretForBuild(env: Record<string, string | undefined>) {
  const problem = signingSecretProblem(env.CLIENT_IP_SIGNING_SECRET);
  if (!problem) return;
  if (env.VERCEL_ENV === "production") throw new Error(describeSigningSecretProblem(problem));
  if (env.VERCEL === "1") console.warn(`${describeSigningSecretProblem(problem)} — sign-ins won't be signed here`);
}

// ─── Signing ─────────────────────────────────────────────────────────

export const CLIENT_IP_HEADER = "x-santa-client-ip";
export const CLIENT_IP_SIGNATURE_HEADER = "x-santa-client-ip-sig";

/**
 * The only API routes that get a signed IP: the two that run the password hash, and the
 * set-up check that tells whether the API accepts the signature (it answers a status only)
 */
export const SIGNED_IP_PATHS = new Set(["/api/auth/login", "/api/auth/register", "/api/auth/client-ip-check"]);

/** One warning per server instance is enough to be seen in the logs */
let warnedAboutSecret = false;

const base64url = (bytes: ArrayBuffer) =>
  btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

/** HMAC-SHA256 over "v1\n<ts>\n<ip>" — the same string the API verifies */
export async function signClientIp(ip: string, timestampSeconds: number, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const mac = await crypto.subtle.sign("HMAC", key, encoder.encode(`v1\n${timestampSeconds}\n${ip}`));
  return base64url(mac);
}

/**
 * The request headers to send on to the API: whatever the client sent as our IP headers
 * is always dropped; a fresh signed pair is added only on Vercel (where x-real-ip is the
 * platform's own) and only when the secret is set.
 */
export async function withSignedClientIp(
  incoming: Headers,
  { secret, onVercel }: { secret: string | undefined; onVercel: boolean },
  nowMs: number,
): Promise<Headers> {
  const headers = new Headers(incoming);
  headers.delete(CLIENT_IP_HEADER);
  headers.delete(CLIENT_IP_SIGNATURE_HEADER);

  if (!onVercel) return headers;
  // A missing or weak key signs nothing (the production build refuses one: assertSigningSecretForBuild)
  const problem = signingSecretProblem(secret);
  if (problem) {
    if (!warnedAboutSecret) console.warn(`${describeSigningSecretProblem(problem)} — sign-ins are not signed`);
    warnedAboutSecret = true;
    return headers;
  }

  const ip = incoming.get("x-real-ip")?.trim();
  if (!ip || ip.length > 64 || !/^[0-9a-fA-F:.]+$/.test(ip)) return headers;

  const timestamp = Math.floor(nowMs / 1000);
  headers.set(CLIENT_IP_HEADER, ip);
  headers.set(CLIENT_IP_SIGNATURE_HEADER, `${timestamp}.${await signClientIp(ip, timestamp, secret!.trim())}`);
  return headers;
}
