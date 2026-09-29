import { z } from "zod";
import { en } from "@/i18n/messages/en";
import type { Messages, Say } from "@/i18n/messages";

// Mirrors the backend DTOs so most mistakes are caught before a request is sent.
// Rules carry message *keys*, not text: fieldMessages() turns them into Says,
// worded at render in whatever language the page is in at that moment.

type ValidationKey = keyof Messages["validation"];
const v = Object.fromEntries(Object.keys(en.validation).map((key) => [key, key])) as {
  [K in ValidationKey]: K;
};

const email = z.string().trim().toLowerCase().pipe(z.email(v.email));

/** The one password rule: sign-up, password change and set-password all use it */
const newPassword = z.string().min(8, v.passwordMin).max(128, v.passwordMax);

export const loginSchema = z.object({
  email,
  password: z.string().min(1, v.password),
});

export const registerSchema = z.object({
  name: z.string().trim().min(2, v.nameMin).max(60, v.nameMax),
  email,
  password: newPassword,
});

const confirmMatches = (value: { newPassword: string; confirmPassword: string }) =>
  value.newPassword === value.confirmPassword;
const mismatch = { message: v.passwordsMismatch, path: ["confirmPassword"] };

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, v.currentPassword),
    newPassword,
    confirmPassword: z.string(),
  })
  .refine((value) => value.newPassword !== value.currentPassword, {
    message: v.passwordSame,
    path: ["newPassword"],
  })
  .refine(confirmMatches, mismatch);

export const setPasswordSchema = z
  .object({ newPassword, confirmPassword: z.string() })
  .refine(confirmMatches, mismatch);

const isValidationKey = (key: string): key is ValidationKey => key in en.validation;

/** First error per field, as Says for useFieldMessages — ready to show under inputs */
export function fieldMessages<T>(error: z.ZodError<T>): Partial<Record<keyof T, Say>> {
  const result: Partial<Record<keyof T, Say>> = {};
  for (const issue of error.issues) {
    const key = issue.path[0] as keyof T;
    const message = issue.message;
    // A rule without its own key falls back to zod's (English) text
    result[key] ??= isValidationKey(message) ? (m) => m.validation[message] : () => message;
  }
  return result;
}

/**
 * Only allow internal redirects after login — never an external URL ("//x", "/\x" included).
 * Control characters are refused too: URL parsers drop tabs/newlines, so "/\t/evil.com"
 * would otherwise turn into "//evil.com".
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
