// SSE parsing for the AI reply stream. Runs on Node's test runner: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { parseSse } from "./sse.ts";

test("complete events are returned, the unfinished tail is kept", () => {
  const { events, rest } = parseSse('event: delta\ndata: {"text":"Hi"}\n\nevent: delta\ndata: {"te');
  assert.deepEqual(events, [{ event: "delta", data: '{"text":"Hi"}' }]);
  assert.equal(rest, 'event: delta\ndata: {"te');
});

test("an event split across chunks is parsed once it completes", () => {
  const first = parseSse('event: done\ndata: {"a":');
  assert.deepEqual(first.events, []);
  const second = parseSse(first.rest + "1}\n\n");
  assert.deepEqual(second.events, [{ event: "done", data: '{"a":1}' }]);
  assert.equal(second.rest, "");
});

test("several events in one chunk keep their order", () => {
  const { events } = parseSse("event: delta\ndata: 1\n\nevent: delta\ndata: 2\n\nevent: done\ndata: {}\n\n");
  assert.deepEqual(
    events.map((e) => [e.event, e.data]),
    [
      ["delta", "1"],
      ["delta", "2"],
      ["done", "{}"],
    ],
  );
});

test("comments, CRLF and default event names are handled", () => {
  const { events } = parseSse(": keep-alive\r\n\r\ndata: plain\r\n\r\n");
  assert.deepEqual(events, [{ event: "message", data: "plain" }]);
});

test("multi-line data is joined with newlines", () => {
  const { events } = parseSse("event: delta\ndata: one\ndata: two\n\n");
  assert.deepEqual(events, [{ event: "delta", data: "one\ntwo" }]);
});
