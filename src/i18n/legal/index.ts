import type { Locale } from "../config";
import { getLocale } from "../server";
import { enLegal, type LegalDocs } from "./en";
import { kyLegal } from "./ky";
import { ruLegal } from "./ru";

// Privacy Policy and Terms of Use, kept apart from the dictionaries in messages/:
// those ship to the browser with every page, these long texts only ever render on
// the server (app/privacy, app/terms). Import them from server components only.

export type { LegalDocs };

const legal: Record<Locale, LegalDocs> = { en: enLegal, ru: ruLegal, ky: kyLegal };

/** For server components: `const { privacy, terms } = await getLegal()` */
export async function getLegal(): Promise<LegalDocs> {
  return legal[await getLocale()];
}
