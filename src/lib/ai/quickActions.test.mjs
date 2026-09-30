// Mini assistant suggestions per page. Runs on Node's test runner: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { ONBOARDING_QUICK, quickActionsFor } from "./quickActions.ts";

test("every page gets a few suggestions of its own", () => {
  assert.deepEqual(quickActionsFor("dashboard"), ["createSanta", "inviteFriends", "howItWorks"]);
  assert.deepEqual(quickActionsFor("events"), ["createEvent", "joinEvent", "howItWorks"]);
  assert.deepEqual(quickActionsFor("profile"), ["interests", "fillWishlist", "howWishlist"]);
  assert.deepEqual(quickActionsFor("settings"), ["changeTheme", "changeLanguage", "howItWorks"]);
  assert.deepEqual(quickActionsFor("my_santa"), ["whatToGift", "howWishlist", "whereRecipient"]);
  for (const page of ["dashboard", "events", "event_new", "event", "event_santa", "my_santa", "profile", "settings", undefined]) {
    const keys = quickActionsFor(page);
    assert.ok(keys.length >= 2 && keys.length <= 3, String(page));
  }
});

test("only the organizer is asked about drawing names, and only before the draw", () => {
  assert.ok(quickActionsFor("event", { status: "open", isOwner: true }).includes("whenDraw"));
  assert.ok(!quickActionsFor("event", { status: "open", isOwner: false }).includes("whenDraw"));
  assert.ok(!quickActionsFor("event", { status: "drawn", isOwner: true }).includes("whenDraw"));
  assert.ok(!quickActionsFor("event", { status: "completed", isOwner: true }).includes("whenDraw"));
});

test("the chat is suggested only once it exists", () => {
  assert.ok(!quickActionsFor("event", { status: "open", isOwner: true }).includes("eventChat"));
  assert.ok(quickActionsFor("event", { status: "drawn", isOwner: false }).includes("eventChat"));
});

test("first visit: the four basics", () => {
  assert.deepEqual(ONBOARDING_QUICK, ["howItWorks", "createSanta", "inviteFriends", "whereRecipient"]);
});
