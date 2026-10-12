// zod/mini: the same validation as "zod", but tree-shakeable — the sign-in pages ship
// only the few checks used here instead of the whole library (~90 kB gzip).
import * as z from "zod/mini";
import { en } from "@/i18n/messages/en";
import type { Messages, Say } from "@/i18n/messages";

// Mirrors the backend DTOs so most mistakes are caught before a request is sent.
// Rules carry message *keys*, not text: fieldMessages() turns them into Says,
// worded at render in whatever language the page is in at that moment.

type ValidationKey = keyof Messages["validation"];
const v = Object.fromEntries(Object.keys(en.validation).map((key) => [key, key])) as {
  [K in ValidationKey]: K;
};

const email = z.pipe(z.string().check(z.trim(), z.toLowerCase()), z.email(v.email));

/** The one password rule: sign-up, password change and set-password all use it */
const newPassword = z.string().check(z.minLength(8, v.passwordMin), z.maxLength(128, v.passwordMax));

export const loginSchema = z.object({
  email,
  password: z.string().check(z.minLength(1, v.password)),
});

export const registerSchema = z.object({
  name: z.string().check(z.trim(), z.minLength(2, v.nameMin), z.maxLength(60, v.nameMax)),
  email,
  password: newPassword,
});

const confirmMatches = (value: { newPassword: string; confirmPassword: string }) =>
  value.newPassword === value.confirmPassword;
const mismatch = { error: v.passwordsMismatch, path: ["confirmPassword"] };

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().check(z.minLength(1, v.currentPassword)),
    newPassword,
    confirmPassword: z.string(),
  })
  .check(
    z.refine((value) => value.newPassword !== value.currentPassword, {
      error: v.passwordSame,
      path: ["newPassword"],
    }),
    z.refine(confirmMatches, mismatch),
  );

export const setPasswordSchema = z
  .object({ newPassword, confirmPassword: z.string() })
  .check(z.refine(confirmMatches, mismatch));

const isValidationKey = (key: string): key is ValidationKey => key in en.validation;

/** First error per field, as Says for useFieldMessages — ready to show under inputs */
export function fieldMessages<T>(error: z.core.$ZodError<T>): Partial<Record<keyof T, Say>> {
  const result: Partial<Record<keyof T, Say>> = {};
  for (const issue of error.issues) {
    const key = issue.path[0] as keyof T;
    const message = issue.message;
    // A rule without its own key falls back to zod's (English) text
    result[key] ??= isValidationKey(message) ? (m) => m.validation[message] : () => message;
  }
  return result;
}
