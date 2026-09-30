// Event chat cache + unread logic. Runs on Node's test runner: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { addChatMessage, firstUnreadIndex, flattenChat, isChatMessagePayload, unreadCount } from "./messages.ts";

const EVENT = "11111111-1111-4111-8111-111111111111";
const message = (id, createdAt, authorId = "u-other") => ({
  id,
  eventId: EVENT,
  content: `message ${id}`,
  createdAt,
  author: { id: authorId, name: "Asan", avatarUrl: null },
});

test("only a well-formed payload for its own event is accepted", () => {
  assert.equal(isChatMessagePayload({ eventId: EVENT, message: message("a", "2026-12-01T10:00:00Z") }), true);
  assert.equal(isChatMessagePayload({ eventId: "other", message: message("a", "2026-12-01T10:00:00Z") }), false);
  assert.equal(isChatMessagePayload({ eventId: EVENT }), false);
  assert.equal(isChatMessagePayload({ eventId: EVENT, message: { id: "a" } }), false);
  assert.equal(isChatMessagePayload(null), false);
  assert.equal(isChatMessagePayload("chat"), false);
});

test("a new message lands at the end of the newest page, once", () => {
  const data = {
    pages: [
      { messages: [message("c", "2026-12-01T10:02:00Z")], hasMore: true },
      { messages: [message("a", "2026-12-01T10:00:00Z"), message("b", "2026-12-01T10:01:00Z")], hasMore: false },
    ],
    pageParams: [undefined, "c"],
  };
  const added = addChatMessage(data, message("d", "2026-12-01T10:03:00Z"));
  assert.deepEqual(
    flattenChat(added).map((m) => m.id),
    ["a", "b", "c", "d"],
  );
  // The same message again (my own, back from the socket) changes nothing
  assert.equal(addChatMessage(added, message("d", "2026-12-01T10:03:00Z")), added);
  assert.equal(addChatMessage(added, message("b", "2026-12-01T10:01:00Z")), added);
  // Nothing cached yet: nothing to merge into (the next fetch brings it)
  assert.equal(addChatMessage(undefined, message("e", "2026-12-01T10:04:00Z")), undefined);
});

test("a late message is sorted into place", () => {
  const data = {
    pages: [{ messages: [message("a", "2026-12-01T10:00:00Z"), message("c", "2026-12-01T10:02:00Z")], hasMore: false }],
    pageParams: [undefined],
  };
  assert.deepEqual(
    flattenChat(addChatMessage(data, message("b", "2026-12-01T10:01:00Z"))).map((m) => m.id),
    ["a", "b", "c"],
  );
});

test("unread: messages from others after my last visit", () => {
  const messages = [
    message("a", "2026-12-01T10:00:00Z"),
    message("b", "2026-12-01T10:01:00Z", "me"),
    message("c", "2026-12-01T10:02:00Z"),
    message("d", "2026-12-01T10:03:00Z", "me"),
    message("e", "2026-12-01T10:04:00Z"),
  ];
  assert.equal(firstUnreadIndex(messages, "2026-12-01T10:01:30Z", "me"), 2);
  assert.equal(unreadCount(messages, "2026-12-01T10:01:30Z", "me"), 2);
  assert.equal(firstUnreadIndex(messages, "2026-12-01T10:05:00Z", "me"), -1);
  assert.equal(unreadCount(messages, "2026-12-01T10:05:00Z", "me"), 0);
  // Never opened: no "new" wall on the first visit
  assert.equal(firstUnreadIndex(messages, null, "me"), -1);
  // My own messages are never unread
  assert.equal(unreadCount([message("x", "2026-12-01T11:00:00Z", "me")], "2026-12-01T10:00:00Z", "me"), 0);
});
