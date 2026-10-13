// The landing demo's draw. Runs on Node's test runner: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { cleanName, drawPairs, DEMO_MAX } from "./draw.ts";

/** A small seeded generator, so every run is the same */
const seeded = (seed) => () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;

test("nobody gives to themselves, everyone gives and gets exactly once", () => {
  for (let n = 2; n <= DEMO_MAX; n++) {
    const people = Array.from({ length: n }, (_, i) => `p${i}`);
    for (let seed = 1; seed <= 200; seed++) {
      const pairs = drawPairs(people, seeded(seed));
      assert.equal(pairs.length, n);
      assert.ok(pairs.every(([giver, receiver]) => giver !== receiver));
      assert.deepEqual(pairs.map(([g]) => g), people);
      assert.deepEqual([...pairs.map(([, r]) => r)].sort(), [...people].sort());
    }
  }
});

test("one cycle through everyone: following who gives to whom visits all", () => {
  const people = ["a", "b", "c", "d", "e", "f"];
  const pairs = new Map(drawPairs(people, seeded(7)));
  let current = "a";
  const seen = new Set();
  do {
    seen.add(current);
    current = pairs.get(current);
  } while (current !== "a");
  assert.equal(seen.size, people.length);
});

test("too few people: no pairs", () => {
  assert.deepEqual(drawPairs([]), []);
  assert.deepEqual(drawPairs(["solo"]), []);
});

test("names are trimmed, deduplicated ignoring case, and capped", () => {
  assert.deepEqual(cleanName("  Айгерим   Садыкова ", []), { name: "Айгерим Садыкова" });
  assert.deepEqual(cleanName("   ", []), { problem: "empty" });
  assert.deepEqual(cleanName("тимур", ["Тимур"]), { problem: "duplicate" });
  assert.deepEqual(cleanName("Ann", Array.from({ length: DEMO_MAX }, (_, i) => `n${i}`)), { problem: "full" });
  assert.equal(cleanName("x".repeat(60), []).name.length, 24);
});
