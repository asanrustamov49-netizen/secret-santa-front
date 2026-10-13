// The invite QR code's geometry. Runs on Node's test runner: npm test
import { test } from "node:test";
import assert from "node:assert/strict";
import { inviteQr } from "./qr.ts";

const URL_ = "https://secret-santa-project-mu.vercel.app/join/fgxm9R8zotiq";

test("finders sit in three corners", () => {
  const { size, finders } = inviteQr(URL_);
  assert.deepEqual(finders, [
    [0, 0],
    [size - 7, 0],
    [0, size - 7],
  ]);
});

test("the clear spot is centred and stays small enough for level H", () => {
  const { size, logo } = inviteQr(URL_);
  const [start, length] = logo;
  assert.equal(start * 2 + length, size);
  assert.ok(Number.isInteger(start));
  // Area under the logo: well below the 30% level H can rebuild
  assert.ok((length * length) / (size * size) < 0.08, `${length}/${size}`);
});

test("data dots are drawn, deterministically", () => {
  const a = inviteQr(URL_);
  const b = inviteQr(URL_);
  assert.ok(a.dots.length > 1000);
  assert.equal(a.dots, b.dots);
  assert.notEqual(inviteQr(URL_ + "x").dots, a.dots);
});
