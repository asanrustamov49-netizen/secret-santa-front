/**
 * Only allow internal redirects after login — never an external URL ("//x", "/\x" included).
 * Control characters are refused too: URL parsers drop tabs/newlines, so "/\t/evil.com"
 * would otherwise turn into "//evil.com".
 *
 * Its own module, free of dependencies: src/proxy.ts and the Google callback page use it
 * without pulling in the form validation of lib/auth/schemas.ts.
 */
export function safeNextPath(next: string | null): string {
  return next &&
    next.startsWith("/") &&
    !next.startsWith("//") &&
    !next.includes("\\") &&
    !/[\u0000-\u001f\u007f]/.test(next)
    ? next
    : "/dashboard";
}
