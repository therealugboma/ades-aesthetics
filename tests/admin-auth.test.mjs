import test from "node:test";
import assert from "node:assert/strict";
import { requireAdmin } from "../convex/helpers.ts";

function adminContext({ users = [], sessions = [] }) {
  let token;
  return {
    db: {
      query(table) {
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
                return table === "adminSessions"
                  ? sessions.filter((session) => session.sessionToken === token)
                  : users.filter((user) => user.sessionToken === token);
              },
            };
          },
        };
      },
      async get(id) {
        return users.find((user) => user._id === id) ?? null;
      },
    },
  };
}

test("admin access requires a session token", async () => {
  await assert.rejects(
    requireAdmin(adminContext({}), ""),
    /session required/
  );
});

test("admin access rejects unknown and expired sessions", async () => {
  const context = adminContext({ users: [
    {
      _id: "user-1",
      email: "admin@example.com",
      role: "admin",
      sessionToken: "expired",
      sessionExpiry: Date.now() - 1,
    },
  ] });

  await assert.rejects(requireAdmin(context, "unknown"), /invalid session/);
  await assert.rejects(requireAdmin(context, "expired"), /session expired/);
});

test("admin access rejects a valid non-admin session", async () => {
  const context = adminContext({ users: [
    {
      _id: "user-2",
      email: "user@example.com",
      role: "customer",
      sessionToken: "customer-token",
      sessionExpiry: Date.now() + 60_000,
    },
  ] });

  await assert.rejects(
    requireAdmin(context, "customer-token"),
    /admin access required/
  );
});

test("admin access returns the authenticated administrator", async () => {
  const context = adminContext({ users: [
    {
      _id: "user-3",
      email: "admin@example.com",
      role: "admin",
      sessionToken: "admin-token",
      sessionExpiry: Date.now() + 60_000,
    },
  ] });

  assert.deepEqual(await requireAdmin(context, "admin-token"), {
    role: "admin",
    userId: "user-3",
    email: "admin@example.com",
  });
});

test("the same administrator can keep concurrent sessions on different devices", async () => {
  const user = {
    _id: "user-4",
    email: "admin@example.com",
    role: "admin",
  };
  const context = adminContext({
    users: [user],
    sessions: [
      {
        _id: "session-laptop",
        userId: user._id,
        sessionToken: "laptop-token",
        expiresAt: Date.now() + 60_000,
      },
      {
        _id: "session-ipad",
        userId: user._id,
        sessionToken: "ipad-token",
        expiresAt: Date.now() + 60_000,
      },
    ],
  });

  const expected = {
    role: "admin",
    userId: user._id,
    email: user.email,
  };
  assert.deepEqual(await requireAdmin(context, "laptop-token"), expected);
  assert.deepEqual(await requireAdmin(context, "ipad-token"), expected);
});

test("multi-device sessions still enforce expiry and the admin role", async () => {
  const context = adminContext({
    users: [
      { _id: "admin-user", email: "admin@example.com", role: "admin" },
      { _id: "staff-user", email: "staff@example.com", role: "staff" },
    ],
    sessions: [
      {
        _id: "expired-session",
        userId: "admin-user",
        sessionToken: "expired-device-token",
        expiresAt: Date.now() - 1,
      },
      {
        _id: "staff-session",
        userId: "staff-user",
        sessionToken: "staff-device-token",
        expiresAt: Date.now() + 60_000,
      },
    ],
  });

  await assert.rejects(
    requireAdmin(context, "expired-device-token"),
    /session expired/
  );
  await assert.rejects(
    requireAdmin(context, "staff-device-token"),
    /admin access required/
  );
});
