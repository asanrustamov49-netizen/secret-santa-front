import { NextResponse, type NextRequest } from "next/server";
import { safeNextPath } from "@/lib/auth/safeNextPath";
import { SIGNED_IP_PATHS, withSignedClientIp } from "@/lib/security/clientIp";

// Cheap routing decision only — the API still validates every request.
// "has_session" is a non-secret hint cookie set by the backend with the auth cookies.
// Sign-in and sign-up API calls also pass through here, to carry the visitor's signed IP.

const APP_PATHS = ["/dashboard", "/events", "/my-santa", "/ai", "/profile", "/settings"];
const AUTH_PATHS = ["/login", "/signup"];

const startsWithAny = (pathname: string, paths: string[]) =>
  paths.some((path) => pathname === path || pathname.startsWith(`${path}/`));

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // /api/auth/login, /api/auth/register (and the set-up check): on to the API (the /api rewrite) with the IP
  // Vercel saw, signed — the API's sign-in limits count per visitor with it
  if (SIGNED_IP_PATHS.has(pathname)) {
    const headers = await withSignedClientIp(
      request.headers,
      { secret: process.env.CLIENT_IP_SIGNING_SECRET, onVercel: process.env.VERCEL === "1" },
      Date.now(),
    );
    return NextResponse.next({ request: { headers } });
  }

  const hasSession = request.cookies.has("has_session");

  // Guest opening the app → sign in first, then come back
  if (!hasSession && startsWithAny(pathname, APP_PATHS)) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }

  // Already signed in → no point showing the login form; go where the link was heading
  if (hasSession && startsWithAny(pathname, AUTH_PATHS)) {
    const next = safeNextPath(request.nextUrl.searchParams.get("next"));
    return NextResponse.redirect(new URL(next, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/events/:path*",
    "/my-santa/:path*",
    "/ai/:path*",
    "/profile/:path*",
    "/settings/:path*",
    "/login",
    "/signup",
    "/api/auth/login",
    "/api/auth/register",
    "/api/auth/client-ip-check",
  ],
};
