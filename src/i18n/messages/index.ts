import type { Locale } from "../config";
import { en, type Messages } from "./en";
import { ky } from "./ky";
import { ru } from "./ru";

export type { Messages };

/** One dictionary per language — the only place user-facing text lives */
export const messages: Record<Locale, Messages> = { en, ru, ky };

/**
 * Text chosen now but shown later (a form error): `(m) => m.validation.email`.
 * Worded at render from the current dictionary, so it follows a language switch.
 */
export type Say = (m: Messages) => string;
