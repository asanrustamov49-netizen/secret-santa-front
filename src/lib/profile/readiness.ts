// "Is my Secret Santa going to have enough to go on?" — shown on the profile and dashboard.
import type { Locale } from "@/i18n/config";
import { messages, type Messages } from "@/i18n/messages";
import { formatNumber } from "@/lib/events/format";

export const MIN_INTERESTS = 3;

export interface ReadinessStep {
  key: "name" | "interests" | "wishlist";
  done: boolean;
}

export function profileReadiness(interestCount: number, wishlistCount: number) {
  const steps: ReadinessStep[] = [
    { key: "name", done: true },
    { key: "interests", done: interestCount >= MIN_INTERESTS },
    { key: "wishlist", done: wishlistCount > 0 },
  ];
  const done = steps.filter((step) => step.done).length;
  return { steps, done, total: steps.length, complete: done === steps.length };
}

/** The label of a readiness step, in the language of `m` */
export function readinessLabel(key: ReadinessStep["key"], m: Messages): string {
  if (key === "interests") return m.readiness.interests(MIN_INTERESTS);
  return m.readiness[key];
}

/** 1500 → "≈ 1,500 som" · "≈ 1 500 сом" */
export function formatPrice(price: number, locale: Locale): string {
  return messages[locale].format.price(formatNumber(price, locale));
}
