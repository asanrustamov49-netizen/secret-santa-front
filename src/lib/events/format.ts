import { INTL_LOCALE, type Locale } from "@/i18n/config";
import { messages, type Messages } from "@/i18n/messages";

const numberFormats = new Map<Locale, Intl.NumberFormat>();

/** 3000 → "3,000" (en) · "3 000" (ru, ky) */
export function formatNumber(value: number, locale: Locale): string {
  let format = numberFormats.get(locale);
  if (!format) {
    format = new Intl.NumberFormat(INTL_LOCALE[locale]);
    numberFormats.set(locale, format);
  }
  return format.format(value);
}

/** "1,000–3,000 som" · "up to 3,000 som" · "from 1,000 som" · null — in the given language */
export function formatBudget(min: number | null, max: number | null, locale: Locale): string | null {
  const f = messages[locale].format;
  const num = (value: number) => formatNumber(value, locale);
  if (min != null && max != null) {
    return min === max ? f.money(num(min)) : f.budgetRange(num(min), num(max));
  }
  if (max != null) return f.budgetUpTo(num(max));
  if (min != null) return f.budgetFrom(num(min));
  return null;
}

/** "2026-12-25" as a local calendar day — never shifted by time zones */
export function parseDay(day: string): Date {
  const [y, m, d] = day.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function toDayString(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// Many browser builds (Chrome's trimmed ICU among them) have no Kyrgyz calendar data:
// Intl silently formats "ky-KG" dates in Russian. Kyrgyz dates are therefore spelled
// out here — the same on the server and in every browser.
const KY_MONTHS = [
  "январь", "февраль", "март", "апрель", "май", "июнь",
  "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь",
];
const KY_WEEKDAYS = ["жекшемби", "дүйшөмбү", "шейшемби", "шаршемби", "бейшемби", "жума", "ишемби"];

/** "Fri, 25 Dec 2026" · "пт, 25 дек. 2026 г." · "жума, 25-декабрь, 2026-ж." */
export function formatDay(day: string, locale: Locale): string {
  const date = parseDay(day);
  if (locale === "ky") {
    return `${KY_WEEKDAYS[date.getDay()]}, ${date.getDate()}-${KY_MONTHS[date.getMonth()]}, ${date.getFullYear()}-ж.`;
  }
  return date.toLocaleDateString(INTL_LOCALE[locale], {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Today's heading: "Sunday 27 September" · "воскресенье, 27 сентября" · "жекшемби, 27-сентябрь" */
export function formatToday(date: Date, locale: Locale): string {
  if (locale === "ky") return `${KY_WEEKDAYS[date.getDay()]}, ${date.getDate()}-${KY_MONTHS[date.getMonth()]}`;
  return date.toLocaleDateString(INTL_LOCALE[locale], { weekday: "long", day: "numeric", month: "long" });
}

/** A moment as "14:05" in the reader's clock (the same digits in every language) */
export function formatTime(iso: string, locale: Locale): string {
  return new Date(iso).toLocaleTimeString(INTL_LOCALE[locale], { hour: "2-digit", minute: "2-digit" });
}

/** Whole days from today to `day` (negative = past) */
export function daysUntil(day: string | Date): number {
  const target = typeof day === "string" ? parseDay(day) : day;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const t = new Date(target);
  t.setHours(0, 0, 0, 0);
  return Math.round((t.getTime() - today.getTime()) / 86_400_000);
}

/** "in 23 days" · "tomorrow" · "today!" · "3 days ago" — in the language of `m` */
export function relativeDay(day: string, m: Messages): string {
  const d = daysUntil(day);
  if (d === 0) return m.format.today;
  if (d === 1) return m.format.tomorrow;
  if (d === -1) return m.format.yesterday;
  return d > 0 ? m.format.inDays(d) : m.format.daysAgo(-d);
}

/** Time left until the start (local midnight) of `day`; null once it has begun */
export function timeUntilDay(day: string, now: number) {
  const ms = parseDay(day).getTime() - now;
  if (ms <= 0) return null;
  const minutes = Math.floor(ms / 60_000);
  return { days: Math.floor(minutes / 1440), hours: Math.floor((minutes % 1440) / 60), minutes: minutes % 60 };
}

/** Days until the next 1 January — for the dashboard countdown */
export function daysUntilNewYear(): number {
  const now = new Date();
  // 1 January *is* New Year — 0 ("Happy New Year!"), not a year until the next one
  if (now.getMonth() === 0 && now.getDate() === 1) return 0;
  return daysUntil(new Date(now.getFullYear() + 1, 0, 1));
}

/** Full invite URL for sharing (the page's own origin) */
export function inviteUrl(code: string): string {
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  return `${origin}/join/${code}`;
}

/** Accepts a whole invite link or just the code */
export function extractInviteCode(input: string): string | null {
  const trimmed = input.trim();
  const fromUrl = trimmed.match(/\/join\/([A-Za-z0-9_-]{6,32})/);
  if (fromUrl) return fromUrl[1];
  return /^[A-Za-z0-9_-]{6,32}$/.test(trimmed) ? trimmed : null;
}
