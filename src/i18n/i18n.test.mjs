// Language detection. Runs on Node's test runner: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { DEFAULT_LOCALE, isLocale, negotiateLocale } from "./config.ts";

test("the browser's language is used when we support it", () => {
  assert.equal(negotiateLocale("ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7"), "ru");
  assert.equal(negotiateLocale("ky-KG,ky;q=0.9,ru;q=0.8"), "ky");
  assert.equal(negotiateLocale("en-GB,en;q=0.9"), "en");
});

test("the highest-weighted supported language wins, whatever the order", () => {
  assert.equal(negotiateLocale("de;q=0.9,ky;q=0.5,ru;q=0.7"), "ru");
  assert.equal(negotiateLocale("uk-UA,uk;q=0.9,ru;q=0.8"), "ru");
  assert.equal(negotiateLocale("en;q=0,ru;q=0.1"), "ru"); // q=0 means "not this one"
});

test("anything else falls back to English", () => {
  assert.equal(DEFAULT_LOCALE, "en");
  for (const header of ["de-DE,de;q=0.9", "", null, undefined, "*", "xx;q=abc"]) {
    assert.equal(negotiateLocale(header), "en", String(header));
  }
});

test("only our three languages count as a saved choice", () => {
  for (const code of ["ru", "en", "ky"]) assert.equal(isLocale(code), true);
  for (const code of ["RU", "de", "", "ru-RU", undefined, 1]) assert.equal(isLocale(code), false);
});

