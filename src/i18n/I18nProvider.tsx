"use client";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE, type Locale } from "./config";
import { messages, type Say } from "./messages";

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const I18nContext = createContext<I18nContextValue | null>(null);

/**
 * `locale` comes from the server (cookie / Accept-Language), so the first client
 * render matches the HTML exactly. Switching updates every client component at
 * once, saves the choice in a cookie and refreshes the server-rendered parts.
 */
export function I18nProvider({ locale: serverLocale, children }: { locale: Locale; children: ReactNode }) {
  const router = useRouter();
  const [chosen, setChosen] = useState<Locale | null>(null);
  const locale = chosen ?? serverLocale;

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = (next: Locale) => {
    document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; samesite=lax`;
    setChosen(next);
    // Server components (landing sections, page titles) render again in the new language
    router.refresh();
  };

  return <I18nContext value={{ locale, setLocale }}>{children}</I18nContext>;
}

/** For client components: `const { m, locale } = useI18n()` */
export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used inside <I18nProvider>");
  return { ...context, m: messages[context.locale] };
}

/**
 * useState for a message shown until the user acts (a form error). Kept as a
 * `Say`, not as text: an error already on screen changes language with the page.
 * `setError((m) => m.events.joinLink.invalid)` · `setError(undefined)` clears it.
 */
export function useMessage() {
  const { m } = useI18n();
  const [say, setSay] = useState<Say>();
  // A function given to a state setter would be called as an updater — wrap it
  const set = (next: Say | undefined) => setSay(() => next);
  return [say?.(m), set] as const;
}

/**
 * useMessage for a whole form: one message per field. The setter is a plain state
 * setter over `Say`s — `setErrors((current) => ({ ...current, email: undefined }))`.
 */
export function useFieldMessages<Field extends string>() {
  const { m } = useI18n();
  const [says, setSays] = useState<Partial<Record<Field, Say>>>({});
  const errors: Partial<Record<Field, string>> = {};
  for (const field of Object.keys(says) as Field[]) {
    const say = says[field];
    if (say) errors[field] = say(m);
  }
  return [errors, setSays] as const;
}
