// The .ics file for "Add to calendar". Runs on Node's test runner: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildCalendarFile, calendarFileName, escapeText, foldLine } from "./calendar.ts";

const EVENT = {
  id: "3f0c2a52-1111-4222-8333-444455556666",
  date: "2026-12-31",
  summary: "Тайный Санта: Офис, 2026",
  description: "День обмена подарками · бюджет 1 000–3 000 сом",
  url: "https://example.com/events/3f0c2a52-1111-4222-8333-444455556666",
  reminder: "Тайный Санта через 3 дня — пора купить подарок",
  now: new Date("2026-10-12T15:30:00.123Z"),
};

test("an all-day event that ends the next day — across a year boundary too", () => {
  const ics = buildCalendarFile(EVENT);
  assert.match(ics, /\r\nDTSTART;VALUE=DATE:20261231\r\n/);
  assert.match(ics, /\r\nDTEND;VALUE=DATE:20270101\r\n/);
  assert.match(ics, /\r\nDTSTAMP:20261012T153000Z\r\n/);
  assert.match(ics, /\r\nUID:3f0c2a52-1111-4222-8333-444455556666@secret-santa\r\n/);
});

test("a reminder three days before, and CRLF line endings throughout", () => {
  const ics = buildCalendarFile(EVENT);
  assert.match(ics, /BEGIN:VALARM\r\nACTION:DISPLAY\r\nTRIGGER:-P3D\r\n/);
  assert.ok(ics.startsWith("BEGIN:VCALENDAR\r\n") && ics.endsWith("END:VCALENDAR\r\n"));
  assert.equal(ics.replace(/\r\n/g, "").includes("\n"), false);
});

test("text is escaped: commas, semicolons, backslashes, line breaks", () => {
  assert.equal(escapeText("a,b;c\\d\ne"), "a\\,b\\;c\\\\d\\ne");
  assert.match(buildCalendarFile(EVENT), /SUMMARY:Тайный Санта: Офис\\, 2026/);
});

test("long lines fold at 75 bytes without splitting a Cyrillic letter", () => {
  const line = `DESCRIPTION:${"й".repeat(80)}`;
  const folded = foldLine(line).split("\r\n");
  const encoder = new TextEncoder();
  assert.ok(folded.length > 1);
  folded.forEach((part, i) => {
    assert.ok(encoder.encode(part).length <= 75, `line ${i} too long`);
    if (i > 0) assert.ok(part.startsWith(" "));
  });
  assert.equal(folded.map((part, i) => (i ? part.slice(1) : part)).join(""), line);
});

test("file names keep any script and drop the rest", () => {
  assert.equal(calendarFileName("Офисный Санта 2026!"), "Офисный-Санта-2026.ics");
  assert.equal(calendarFileName("../../etc/passwd"), "etc-passwd.ics");
  assert.equal(calendarFileName("🎁🎄"), "secret-santa.ics");
});
