// The command palette's search. Runs on Node's test runner: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { normalize, rank } from "./commandSearch.ts";

const items = [
  { label: "Главная", keywords: "домой обзор" },
  { label: "Мой Тайный Санта", keywords: "подарок получатель" },
  { label: "Мои события", keywords: "группы обмен" },
  { label: "Создать Тайного Санту", keywords: "новое" },
  { label: "Новогодняя ёлка" },
];
const labels = (query) => rank(items, query).map((r) => r.item.label);

test("normalize ignores case and diacritics, one character for one", () => {
  assert.equal(normalize("Ёлка"), "елка");
  assert.equal(normalize("Мой"), "мои");
  assert.equal(normalize("Café"), "cafe");
  for (const text of ["Новогодняя ёлка", "Мой Тайный Санта", "Crème brûlée"]) {
    assert.equal(normalize(text).length, [...text].length);
  }
});

test("an empty query lists everything in order", () => {
  assert.deepEqual(labels("  "), items.map((i) => i.label));
});

test("every word has to match, in the label or the keywords", () => {
  assert.deepEqual(labels("тайн сант"), ["Мой Тайный Санта", "Создать Тайного Санту"]);
  assert.deepEqual(labels("подарок"), ["Мой Тайный Санта"]);
  assert.deepEqual(labels("санта xyz"), []);
});

test("a label start beats a word start, which beats a keyword", () => {
  assert.deepEqual(labels("мо"), ["Мой Тайный Санта", "Мои события"]);
  assert.deepEqual(labels("нов"), ["Новогодняя ёлка", "Создать Тайного Санту"]);
});

test("ё and й are found when typed as е and и", () => {
  assert.deepEqual(labels("елка"), ["Новогодняя ёлка"]);
  assert.deepEqual(labels("таиныи"), ["Мой Тайный Санта"]);
});

test("the match points at the original label, for highlighting", () => {
  const [first] = rank(items, "елк");
  assert.equal(first.item.label.slice(first.match.start, first.match.end), "ёлк");
  const [keywordOnly] = rank(items, "обмен");
  assert.equal(keywordOnly.match, null);
});
