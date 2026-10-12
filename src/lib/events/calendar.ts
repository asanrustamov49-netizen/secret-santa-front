// "Add to calendar" for the gift exchange day: an iCalendar (.ics, RFC 5545) file built in
// the browser — no server, works with Google Calendar, Apple Calendar and Outlook alike.
// An all-day event plus a reminder three days before, when there's still time to buy.

export interface CalendarEventInput {
  /** Stable per event, so importing twice updates instead of duplicating */
  id: string;
  /** YYYY-MM-DD */
  date: string;
  summary: string;
  description: string;
  url: string;
  reminder: string;
  /** Now — injectable for tests */
  now?: Date;
}

/** Text values: backslash, semicolon, comma and line breaks are escaped (RFC 5545 §3.3.11) */
export function escapeText(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/**
 * Lines longer than 75 octets are folded: CRLF + a space (§3.1). Counted in UTF-8 bytes,
 * never splitting a character — Cyrillic takes two bytes each.
 */
export function foldLine(line: string): string {
  const encoder = new TextEncoder();
  const parts: string[] = [];
  let current = "";
  let bytes = 0;
  for (const char of line) {
    const size = encoder.encode(char).length;
    const limit = parts.length === 0 ? 75 : 74; // continuation lines start with a space
    if (bytes + size > limit) {
      parts.push(current);
      current = "";
      bytes = 0;
    }
    current += char;
    bytes += size;
  }
  parts.push(current);
  return parts.join("\r\n ");
}

const compactDate = (iso: string) => iso.replace(/-/g, "");

/** The day after YYYY-MM-DD, as YYYYMMDD — DTEND of an all-day event is exclusive */
function nextDay(iso: string): string {
  const [year, month, day] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + 1));
  return date.toISOString().slice(0, 10).replace(/-/g, "");
}

/** 20261012T153000Z */
const stamp = (date: Date) => date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");

export function buildCalendarFile(event: CalendarEventInput): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Secret Santa//Gift exchange//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${event.id}@secret-santa`,
    `DTSTAMP:${stamp(event.now ?? new Date())}`,
    `DTSTART;VALUE=DATE:${compactDate(event.date)}`,
    `DTEND;VALUE=DATE:${nextDay(event.date)}`,
    `SUMMARY:${escapeText(event.summary)}`,
    `DESCRIPTION:${escapeText(`${event.description}\n${event.url}`)}`,
    `URL:${event.url}`,
    "TRANSP:TRANSPARENT",
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    "TRIGGER:-P3D",
    `DESCRIPTION:${escapeText(event.reminder)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.map(foldLine).join("\r\n") + "\r\n";
}

/** A safe file name from the event's name: letters of any script, digits, dashes */
export function calendarFileName(name: string): string {
  const base = name
    .normalize("NFKC")
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return `${base || "secret-santa"}.ics`;
}

/** Hands the file to the browser as a download */
export function downloadCalendarFile(event: CalendarEventInput, fileName: string) {
  const blob = new Blob([buildCalendarFile(event)], { type: "text/calendar;charset=utf-8" });
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  // Revoked a moment later: Safari reads the URL after click() returns
  setTimeout(() => URL.revokeObjectURL(href), 1_000);
}
