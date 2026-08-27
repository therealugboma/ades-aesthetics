import test from "node:test";
import assert from "node:assert/strict";
import { hashPassword, verifyPassword } from "../convex/password.ts";

test("admin passwords use a Convex-safe bcrypt hash", () => {
  const password = "a-secure-test-password";
  const passwordHash = hashPassword(password);

  assert.match(passwordHash, /^\$2[aby]\$12\$/);
  assert.equal(passwordHash.length, 60);
  assert.equal(verifyPassword(password, passwordHash), true);
  assert.equal(verifyPassword("incorrect-password", passwordHash), false);
});
