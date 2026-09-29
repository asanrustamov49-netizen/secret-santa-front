// Languages of the interface. Safe to import anywhere (server, client, lib).

export const LOCALES = ["ru", "en", "ky"] as const;
export type Locale = (typeof LOCALES)[number];

/**
 * Used only when neither a saved choice nor the browser names ru, ky or en —
 * mostly visitors from elsewhere and bots, for whom English is the most
 * understood. English is also the reference dictionary: every key exists there.
 */
export const DEFAULT_LOCALE: Locale = "en";

/** The visitor's choice. Readable on the server, so pages render in it from the first byte. */
export const LOCALE_COOKIE = "locale";
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // a year, in seconds

export const isLocale = (value: unknown): value is Locale =>
  typeof value === "string" && (LOCALES as readonly string[]).includes(value);

/** BCP 47 tags for Intl (dates, numbers, plurals) */
export const INTL_LOCALE: Record<Locale, string> = {
  en: "en-GB",
  ru: "ru-RU",
  ky: "ky-KG",
};

/**
 * Best match for an Accept-Language header ("ru-RU,ru;q=0.9,en;q=0.8"):
 * the highest-weighted language we support, else the default.
 */
export function negotiateLocale(acceptLanguage: string | null | undefined): Locale {
  if (!acceptLanguage) return DEFAULT_LOCALE;

  const ranked = acceptLanguage
    .split(",")
    .map((part, index) => {
      const [tag, ...params] = part.trim().toLowerCase().split(";");
      const q = params.find((p) => p.trim().startsWith("q="));
      return { base: tag.split("-")[0], weight: q ? Number(q.trim().slice(2)) || 0 : 1, index };
    })
    .filter((entry) => entry.base && entry.weight > 0)
    .sort((a, b) => b.weight - a.weight || a.index - b.index);

  return ranked.find((entry) => isLocale(entry.base))?.base as Locale | undefined ?? DEFAULT_LOCALE;
}
