import { INTL_LOCALE, type Locale } from "./config";

/** The word forms a language needs after a number (CLDR plural categories) */
export interface PluralForms {
  one: string;
  /** Russian: 2–4, 22–24… */
  few?: string;
  /** Russian: 0, 5–20, 25… */
  many?: string;
  other: string;
}

const rules = new Map<Locale, Intl.PluralRules>();

/** plural("ru", 5, { one: "день", few: "дня", many: "дней", other: "дня" }) → "дней" */
export function plural(locale: Locale, count: number, forms: PluralForms): string {
  let rule = rules.get(locale);
  if (!rule) {
    rule = new Intl.PluralRules(INTL_LOCALE[locale]);
    rules.set(locale, rule);
  }
  const category = rule.select(count) as keyof PluralForms;
  return forms[category] ?? forms.other;
}
