import test from "node:test";
import assert from "node:assert/strict";
import {
  signAdminToken,
  verifyAdminToken,
} from "../src/lib/admin-token.ts";

function payload(overrides = {}) {
  return {
    sub: "user-1",
    email: "admin@example.com",
    name: "Admin",
    role: "admin",
    sessionToken: "a".repeat(64),
    exp: Date.now() + 60_000,
    ...overrides,
  };
}

test("admin JWTs round-trip and preserve their session", () => {
  const expected = payload();
  const token = signAdminToken(expected);
  assert.ok(token);
  assert.deepEqual(verifyAdminToken(token), expected);
});

test("admin JWT verification rejects tampering", () => {
  const token = signAdminToken(payload());
  assert.ok(token);
  const [header, body, signature] = token.split(".");
  const replacement = signature.endsWith("a") ? "b" : "a";
  const tampered = `${header}.${body}.${signature.slice(0, -1)}${replacement}`;
  assert.equal(verifyAdminToken(tampered), null);
});

test("admin JWT verification rejects expired sessions", () => {
  const token = signAdminToken(payload({ exp: Date.now() - 1 }));
  assert.ok(token);
  assert.equal(verifyAdminToken(token), null);
});
