// Assistant UI actions: only the allowlist, never shown as text. Runs on Node's test runner: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { actionParts, isAiAction, splitAiActions } from "./actions.ts";

test("an allowlisted marker becomes an action and leaves the text", () => {
  const { text, actions } = splitAiActions("Sure — press the button below.\n[[action:theme:dark]]");
  assert.equal(text, "Sure — press the button below.");
  assert.deepEqual(actions, ["theme:dark"]);
});

test("anything outside the allowlist is dropped, and never shown", () => {
  const { text, actions } = splitAiActions(
    "Done.\n[[action:delete:event]]\n[[action:javascript:alert(1)]]\n[[action:language:ky]]\n[[ACTION:Language:KY]]",
  );
  assert.equal(text, "Done.");
  assert.deepEqual(actions, ["language:ky"]);
});

test("a marker still streaming in is hidden until it completes", () => {
  assert.equal(splitAiActions("Press it [[acti", true).text, "Press it");
  assert.equal(splitAiActions("Press it [", true).text, "Press it");
  // Finished replies keep ordinary brackets
  assert.equal(splitAiActions("Use [brackets] freely").text, "Use [brackets] freely");
});

test("text without markers is untouched", () => {
  assert.deepEqual(splitAiActions("Settings → Appearance."), { text: "Settings → Appearance.", actions: [] });
});

test("only the six actions are allowed", () => {
  for (const ok of ["theme:light", "theme:dark", "theme:system", "language:ru", "language:en", "language:ky"]) {
    assert.equal(isAiAction(ok), true, ok);
  }
  for (const bad of ["theme:neon", "language:de", "password:reset", "", null, 1]) {
    assert.equal(isAiAction(bad), false, String(bad));
  }
  assert.deepEqual(actionParts("theme:system"), ["theme", "system"]);
  assert.deepEqual(actionParts("language:en"), ["language", "en"]);
});
