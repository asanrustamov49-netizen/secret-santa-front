// Search for the command palette. Forgiving the way people type: case, ё/е and й/и
// don't matter, every word of the query has to be found, and the label beats the
// hidden keywords (which match only from a word's start). Pure functions — tested in commandSearch.test.mjs.

export interface Searchable {
  label: string;
  /** Extra words that find the item without being shown (synonyms, the other language) */
  keywords?: string;
}

export interface Ranked<T> {
  item: T;
  /** Where the first query word sits in the label, for highlighting; null when it matched a keyword */
  match: { start: number; end: number } | null;
}

/**
 * Lower case without diacritics: "Ёлка" → "елка", "Мой" → "мои". Each character maps to one
 * character, so positions found in the result are positions in the original label.
 */
export function normalize(text: string): string {
  let out = "";
  for (const char of text) {
    const base = char.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");
    out += base.length === 1 ? base : char.toLowerCase().slice(0, 1) || char;
  }
  return out;
}

const isWordStart = (text: string, index: number) => index === 0 || /[\s\-–—«“"'(]/.test(text[index - 1]);

/** Best place of `word` in `text`: a word start wins over the middle of a word */
function find(text: string, word: string): { index: number; atWordStart: boolean } | null {
  let index = text.indexOf(word);
  let first: number | null = null;
  while (index !== -1) {
    if (isWordStart(text, index)) return { index, atWordStart: true };
    first ??= index;
    index = text.indexOf(word, index + 1);
  }
  return first === null ? null : { index: first, atWordStart: false };
}

/** 0 = no match. Higher is better. */
function score(item: Searchable, words: string[]): { score: number; match: Ranked<Searchable>["match"] } {
  const label = normalize(item.label);
  const keywords = normalize(item.keywords ?? "");
  let total = 0;
  let match: Ranked<Searchable>["match"] = null;

  for (const [i, word] of words.entries()) {
    const inLabel = find(label, word);
    if (inLabel) {
      total += inLabel.index === 0 ? 100 : inLabel.atWordStart ? 70 : 40;
      if (i === 0) match = { start: inLabel.index, end: inLabel.index + word.length };
      continue;
    }
    // Hidden words count only from their start: "мо" must not find "домой"
    const inKeywords = find(keywords, word);
    if (!inKeywords?.atWordStart) return { score: 0, match: null };
    total += 25;
  }
  return { score: total, match };
}

/** The items that match every word of the query, best first; ties keep their order */
export function rank<T extends Searchable>(items: T[], query: string): Ranked<T>[] {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return items.map((item) => ({ item, match: null }));

  return items
    .map((item, order) => ({ item, order, ...score(item, words) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || a.order - b.order)
    .map(({ item, match }) => ({ item, match }));
}
