import test from "node:test";
import assert from "node:assert/strict";
import { requireAdmin } from "../convex/helpers.ts";

function adminContext(users) {
  let token;
  return {
    db: {
      query() {
        return {
          withIndex(_indexName, select) {
            select({
              eq(_field, value) {
                token = value;
                return value;
              },
            });
            return {
              async collect() {
                return users.filter((user) => user.sessionToken === token);
              },
            };
          },
        };
      },
    },
  };
}

test("admin access requires a session token", async () => {
  await assert.rejects(
    requireAdmin(adminContext([]), ""),
    /session required/
  );
});

test("admin access rejects unknown and expired sessions", async () => {
  const context = adminContext([
    {
      _id: "user-1",
      email: "admin@example.com",
      role: "admin",
      sessionToken: "expired",
      sessionExpiry: Date.now() - 1,
    },
  ]);

  await assert.rejects(requireAdmin(context, "unknown"), /invalid session/);
  await assert.rejects(requireAdmin(context, "expired"), /session expired/);
});

test("admin access rejects a valid non-admin session", async () => {
  const context = adminContext([
    {
      _id: "user-2",
      email: "user@example.com",
      role: "customer",
      sessionToken: "customer-token",
      sessionExpiry: Date.now() + 60_000,
    },
  ]);

  await assert.rejects(
    requireAdmin(context, "customer-token"),
    /admin access required/
  );
});

test("admin access returns the authenticated administrator", async () => {
  const context = adminContext([
    {
      _id: "user-3",
      email: "admin@example.com",
      role: "admin",
      sessionToken: "admin-token",
      sessionExpiry: Date.now() + 60_000,
    },
  ]);

  assert.deepEqual(await requireAdmin(context, "admin-token"), {
    role: "admin",
    userId: "user-3",
    email: "admin@example.com",
  });
});
