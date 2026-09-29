import { NextResponse, type NextRequest } from "next/server";
import { safeNextPath } from "@/lib/auth/schemas";

// Cheap routing decision only — the API still validates every request.
// "has_session" is a non-secret hint cookie set by the backend with the auth cookies.

const APP_PATHS = ["/dashboard", "/events", "/my-santa", "/ai", "/profile", "/settings"];
const AUTH_PATHS = ["/login", "/signup"];

const startsWithAny = (pathname: string, paths: string[]) =>
  paths.some((path) => pathname === path || pathname.startsWith(`${path}/`));

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
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
  ],
};
