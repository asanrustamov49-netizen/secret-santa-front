// The landing page's demo draw: pairs for a handful of names typed by a visitor.
// Nothing is sent anywhere. Pure functions — tested in draw.test.mjs.

export const DEMO_MIN = 3;
export const DEMO_MAX = 8;
export const DEMO_NAME_MAX = 24;

/**
 * Every name gives to exactly one other and nobody to themselves. Sattolo's shuffle
 * makes one random cycle through everyone, so a pair never closes on itself early.
 */
export function drawPairs<T>(people: readonly T[], random: () => number = Math.random): [giver: T, receiver: T][] {
  if (people.length < 2) return [];
  const target = people.map((_, i) => i);
  for (let i = target.length - 1; i > 0; i--) {
    const j = Math.floor(random() * i); // 0 ≤ j < i — never i itself
    [target[i], target[j]] = [target[j], target[i]];
  }
  return people.map((giver, i) => [giver, people[target[i]]]);
}

export type NameProblem = "empty" | "duplicate" | "full";

/** A name as it will be added: trimmed, single-spaced, cut to the limit; or why it can't be */
export function cleanName(raw: string, names: readonly string[]): { name: string } | { problem: NameProblem } {
  const name = raw.replace(/\s+/g, " ").trim().slice(0, DEMO_NAME_MAX).trim();
  if (!name) return { problem: "empty" };
  if (names.length >= DEMO_MAX) return { problem: "full" };
  const key = name.toLocaleLowerCase();
  if (names.some((other) => other.toLocaleLowerCase() === key)) return { problem: "duplicate" };
  return { name };
}
