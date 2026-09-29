// Regression tests for the silent session refresh in client.ts.
// Runs on Node's built-in test runner (Node strips the TypeScript types itself):
//   npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { AxiosError } from "axios";
import { api, isAuthEndpoint } from "./client.ts";

test("auth endpoints are matched by exact path, not by prefix", () => {
  for (const url of ["/auth/login", "/auth/register", "/auth/refresh", "/auth/logout", "/auth/logout?x=1"]) {
    assert.equal(isAuthEndpoint(url), true, url);
  }
  // The bug: "/auth/logout-all".startsWith("/auth/logout") was true
  for (const url of ["/auth/logout-all", "/auth/me", "/auth/loginx", "/account/preferences", undefined]) {
    assert.equal(isAuthEndpoint(url), false, String(url));
  }
});

/**
 * Stand-in for the network: `responses` maps "METHOD /path" to the statuses it
 * answers with, in order. Records every call made.
 */
function fakeServer(responses) {
  const calls = [];
  api.defaults.adapter = async (config) => {
    const key = `${config.method.toUpperCase()} ${config.url}`;
    calls.push(key);
    const status = responses[key]?.shift();
    if (status === undefined) throw new Error(`unexpected call: ${key}`);
    const response = { status, statusText: "", headers: {}, config, data: {} };
    if (status >= 400) {
      throw new AxiosError(`HTTP ${status}`, "ERR_BAD_REQUEST", config, null, response);
    }
    return response;
  };
  return calls;
}

test("an expired access token on logout-all refreshes once and retries", async () => {
  const calls = fakeServer({
    "POST /auth/logout-all": [401, 204],
    "POST /auth/refresh": [200],
  });

  const res = await api.post("/auth/logout-all");

  assert.equal(res.status, 204);
  assert.deepEqual(calls, ["POST /auth/logout-all", "POST /auth/refresh", "POST /auth/logout-all"]);
});

test("a 401 from logout is final — no refresh, no retry", async () => {
  const calls = fakeServer({ "POST /auth/logout": [401] });

  await assert.rejects(api.post("/auth/logout"), (error) => error.response?.status === 401);
  assert.deepEqual(calls, ["POST /auth/logout"]);
});

test("a regular call still refreshes and retries exactly once", async () => {
  const calls = fakeServer({
    "GET /auth/me": [401, 401],
    "POST /auth/refresh": [401],
  });

  // Session really over: the single retry fails too, and nothing loops
  await assert.rejects(api.get("/auth/me"), (error) => error.response?.status === 401);
  assert.deepEqual(calls, ["GET /auth/me", "POST /auth/refresh", "GET /auth/me"]);
});
