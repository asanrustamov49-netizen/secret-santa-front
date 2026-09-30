// What a realtime message makes stale. Runs on Node's test runner: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { isRealtimeEvent, isRealtimePayload, REALTIME_EVENTS, targetsFor } from "./events.ts";

test("every known message refreshes something, and only named caches", () => {
  const allowed = new Set(["events", "event", "match", "myMatches"]);
  for (const name of REALTIME_EVENTS) {
    const targets = targetsFor(name);
    assert.ok(targets.length > 0, name);
    for (const target of targets) assert.ok(allowed.has(target), `${name} → ${target}`);
  }
});

test("a participant joining refreshes the event and my list — not my match", () => {
  assert.deepEqual(targetsFor("event:participant_joined").sort(), ["event", "events"]);
});

test("the draw refreshes the status and my own match — fetched through the API", () => {
  const targets = targetsFor("event:draw_completed");
  for (const target of ["event", "events", "match", "myMatches"]) assert.ok(targets.includes(target), target);
});

test("unknown messages and malformed payloads are ignored", () => {
  for (const name of ["event:recipient", "connect", "", 42, null]) assert.equal(isRealtimeEvent(name), false, String(name));
  assert.equal(isRealtimeEvent("event:updated"), true);

  assert.equal(isRealtimePayload({ eventId: "e1" }), true);
  for (const payload of [null, undefined, "e1", {}, { eventId: 7 }]) assert.equal(isRealtimePayload(payload), false);
});
