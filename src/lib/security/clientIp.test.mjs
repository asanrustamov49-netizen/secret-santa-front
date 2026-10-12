// The signed visitor IP for the API's sign-in limits. Runs on Node's test runner: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHmac, randomBytes } from "node:crypto";
import {
  assertSigningSecretForBuild,
  CLIENT_IP_HEADER,
  CLIENT_IP_SIGNATURE_HEADER,
  signClientIp,
  signingSecretProblem,
  withSignedClientIp,
} from "./clientIp.ts";

// What .env.example tells you to generate
const SECRET = randomBytes(48).toString("base64url");
const NOW = 1_800_000_000_000;

test("the signature is the one the API computes (HMAC-SHA256, base64url)", async () => {
  // Same algorithm as backend src/auth/client-ip.ts → signClientIp
  const expected = createHmac("sha256", SECRET).update("v1\n1800000000\n203.0.113.7").digest("base64url");
  assert.equal(await signClientIp("203.0.113.7", 1800000000, SECRET), expected);
});

test("on Vercel with a secret: the IP from x-real-ip goes on, signed with a timestamp", async () => {
  const incoming = new Headers({ "x-real-ip": "203.0.113.7", "content-type": "application/json" });
  const headers = await withSignedClientIp(incoming, { secret: SECRET, onVercel: true }, NOW);

  assert.equal(headers.get(CLIENT_IP_HEADER), "203.0.113.7");
  const [timestamp, mac] = headers.get(CLIENT_IP_SIGNATURE_HEADER).split(".");
  assert.equal(timestamp, "1800000000");
  assert.equal(mac, await signClientIp("203.0.113.7", 1800000000, SECRET));
  assert.equal(headers.get("content-type"), "application/json");
});

test("whatever the client sent as our headers is always dropped", async () => {
  const forged = new Headers({
    [CLIENT_IP_HEADER]: "1.2.3.4",
    [CLIENT_IP_SIGNATURE_HEADER]: "1800000000.forged",
    "x-real-ip": "203.0.113.7",
  });
  for (const options of [
    { secret: undefined, onVercel: true },
    { secret: SECRET, onVercel: false },
  ]) {
    const headers = await withSignedClientIp(forged, options, NOW);
    assert.equal(headers.get(CLIENT_IP_HEADER), null);
    assert.equal(headers.get(CLIENT_IP_SIGNATURE_HEADER), null);
  }
  const signed = await withSignedClientIp(forged, { secret: SECRET, onVercel: true }, NOW);
  assert.equal(signed.get(CLIENT_IP_HEADER), "203.0.113.7");
});

test("nothing is signed off Vercel, without x-real-ip, or for a value that isn't an IP", async () => {
  const cases = [
    [new Headers({ "x-real-ip": "203.0.113.7" }), { secret: SECRET, onVercel: false }],
    [new Headers(), { secret: SECRET, onVercel: true }],
    [new Headers({ "x-real-ip": "203.0.113.7, 1.1.1.1" }), { secret: SECRET, onVercel: true }],
  ];
  for (const [incoming, options] of cases) {
    const headers = await withSignedClientIp(incoming, options, NOW);
    assert.equal(headers.get(CLIENT_IP_SIGNATURE_HEADER), null);
  }
});

test("the secret rules match the API's: 32+ random bytes, base64url or hex", () => {
  assert.equal(signingSecretProblem(SECRET), null);
  assert.equal(signingSecretProblem(randomBytes(32).toString("hex")), null);
  assert.equal(signingSecretProblem(undefined), "missing");
  assert.equal(signingSecretProblem("  "), "missing");
  assert.equal(signingSecretProblem("unit-test-client-ip-secret"), "too_short");
  assert.equal(signingSecretProblem(randomBytes(31).toString("hex")), "too_short");
  assert.equal(signingSecretProblem(`${SECRET}=`), "bad_format");
  assert.equal(signingSecretProblem("a".repeat(64)), "low_variety");
});

test("a missing or short secret on Vercel signs nothing — and the warning never shows the value", async () => {
  const warnings = [];
  const original = console.warn;
  console.warn = (message) => warnings.push(String(message));
  try {
    for (const secret of [undefined, "", "short-but-private-value"]) {
      const headers = await withSignedClientIp(new Headers({ "x-real-ip": "203.0.113.7" }), { secret, onVercel: true }, NOW);
      assert.equal(headers.get(CLIENT_IP_HEADER), null);
      assert.equal(headers.get(CLIENT_IP_SIGNATURE_HEADER), null);
    }
  } finally {
    console.warn = original;
  }
  assert.ok(warnings.length <= 1, "one warning per instance at most");
  for (const warning of warnings) assert.ok(!warning.includes("short-but-private-value"));
});

test("only the same secret on both sides produces the signature the API expects", async () => {
  const headers = await withSignedClientIp(new Headers({ "x-real-ip": "203.0.113.7" }), { secret: SECRET, onVercel: true }, NOW);
  const mac = headers.get(CLIENT_IP_SIGNATURE_HEADER).split(".")[1];
  const payload = "v1\n1800000000\n203.0.113.7"; // what backend src/auth/client-ip.ts verifies
  const apiWithSameKey = createHmac("sha256", SECRET).update(payload).digest("base64url");
  const apiWithOtherKey = createHmac("sha256", randomBytes(48).toString("base64url")).update(payload).digest("base64url");
  assert.equal(mac, apiWithSameKey);
  assert.notEqual(mac, apiWithOtherKey);
});

test("the Vercel production build refuses a missing or weak secret; preview and local builds don't", () => {
  for (const value of [undefined, "short-but-private-value", "a".repeat(64)]) {
    assert.throws(
      () => assertSigningSecretForBuild({ VERCEL: "1", VERCEL_ENV: "production", CLIENT_IP_SIGNING_SECRET: value }),
      (error) => /^CLIENT_IP_SIGNING_SECRET /.test(error.message) && !error.message.includes("short-but-private-value"),
    );
  }
  assert.doesNotThrow(() => assertSigningSecretForBuild({ VERCEL: "1", VERCEL_ENV: "production", CLIENT_IP_SIGNING_SECRET: SECRET }));

  const original = console.warn;
  console.warn = () => {};
  try {
    assert.doesNotThrow(() => assertSigningSecretForBuild({ VERCEL: "1", VERCEL_ENV: "preview" }));
    assert.doesNotThrow(() => assertSigningSecretForBuild({}));
  } finally {
    console.warn = original;
  }
});
