// Secret Santa chat: what is accepted from the socket, and the unread divider.
// Runs on Node's test runner: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  firstUnreadIndex,
  isSantaChatRole,
  parseSantaChatPayload,
  parseSantaChatRead,
  santaChatPath,
} from "./messages.ts";

const EVENT = "11111111-1111-4111-8111-111111111111";
const CHAT = "22222222-2222-4222-8222-222222222222";
const message = (id, isMine = false) => ({ id, content: `message ${id}`, createdAt: "2026-12-01T10:00:00Z", isMine });

test("a well-formed payload is copied field by field — nothing else gets through", () => {
  const payload = {
    chatId: CHAT,
    eventId: EVENT,
    role: "recipient",
    message: { ...message("a"), authorId: "someone", author: { name: "Alice" } },
    senderId: "someone",
  };
  assert.deepEqual(parseSantaChatPayload(payload), {
    chatId: CHAT,
    eventId: EVENT,
    role: "recipient",
    message: message("a"),
  });
});

test("anything malformed is dropped", () => {
  assert.equal(parseSantaChatPayload(null), null);
  assert.equal(parseSantaChatPayload({ chatId: CHAT, eventId: EVENT, role: "recipient" }), null);
  assert.equal(parseSantaChatPayload({ chatId: CHAT, eventId: EVENT, role: "admin", message: message("a") }), null);
  assert.equal(
    parseSantaChatPayload({ chatId: CHAT, eventId: EVENT, role: "sender", message: { ...message("a"), isMine: "no" } }),
    null,
  );
  assert.equal(parseSantaChatPayload({ eventId: EVENT, role: "sender", message: message("a") }), null);
});

test("read notices carry only the event and my role", () => {
  assert.deepEqual(parseSantaChatRead({ eventId: EVENT, role: "sender", extra: 1 }), { eventId: EVENT, role: "sender" });
  assert.equal(parseSantaChatRead({ eventId: EVENT }), null);
  assert.equal(parseSantaChatRead("x"), null);
});

test("only the two roles exist, and the URL holds nothing but the event and my role", () => {
  assert.equal(isSantaChatRole("sender"), true);
  assert.equal(isSantaChatRole("recipient"), true);
  assert.equal(isSantaChatRole("santa"), false);
  assert.equal(santaChatPath(EVENT, "recipient"), `/events/${EVENT}/santa-chat/recipient`);
});

test("the unread divider sits at the earliest of the last unread messages from the other side", () => {
  const list = [message("1"), message("2", true), message("3"), message("4", true), message("5")];
  assert.equal(firstUnreadIndex(list, 0), -1);
  assert.equal(firstUnreadIndex(list, 1), 4);
  assert.equal(firstUnreadIndex(list, 2), 2);
  assert.equal(firstUnreadIndex(list, 3), 0);
  // More unread than loaded: the first loaded message from them
  assert.equal(firstUnreadIndex(list, 9), 0);
  assert.equal(firstUnreadIndex([message("m", true)], 1), -1);
});
