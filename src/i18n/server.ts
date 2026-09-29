import { cache } from "react";
import { cookies, headers } from "next/headers";
import { isLocale, LOCALE_COOKIE, negotiateLocale, type Locale } from "./config";
import { messages } from "./messages";

/**
 * The language of this request: the visitor's saved choice (cookie), else what
 * their browser asks for, else the default. Read on the server, so the HTML
 * arrives in the right language — no flash, no hydration mismatch.
 */
export const getLocale = cache(async (): Promise<Locale> => {
  const saved = (await cookies()).get(LOCALE_COOKIE)?.value;
  if (isLocale(saved)) return saved;
  return negotiateLocale((await headers()).get("accept-language"));
});

/** For server components: `const { m } = await getI18n()` */
export async function getI18n() {
  const locale = await getLocale();
  return { locale, m: messages[locale] };
}

/** `export const generateMetadata = pageTitle("dashboard")` */
export function pageTitle(key: keyof Omit<typeof messages.en.meta, "siteTitle" | "siteDescription" | "title">) {
  return async () => {
    const { m } = await getI18n();
    return { title: m.meta.title(m.meta[key]) };
  };
}
