import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const verifySession = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query("adminSessions")
      .withIndex("by_sessionToken", (q) => q.eq("sessionToken", args.sessionToken))
      .collect();

    if (sessions.length > 0) {
      const session = sessions[0];
      if (session.expiresAt < Date.now()) return null;
      const user = await ctx.db.get(session.userId);
      if (!user || user.role !== "admin") return null;
      return {
        userId: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
      };
    }

    // Keep legacy cookies valid across the production rollout.
    const legacyUsers = await ctx.db
      .query("users")
      .withIndex("by_sessionToken", (q) => q.eq("sessionToken", args.sessionToken))
      .collect();

    if (legacyUsers.length === 0) return null;

    const user = legacyUsers[0];

    if (user.sessionExpiry && user.sessionExpiry < Date.now()) {
      return null;
    }

    return {
      userId: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  },
});

export const cleanupExpiredSession = mutation({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query("adminSessions")
      .withIndex("by_sessionToken", (q) => q.eq("sessionToken", args.sessionToken))
      .collect();
    const session = sessions[0];
    if (session) {
      if (session.expiresAt >= Date.now()) return null;
      await ctx.db.delete(session._id);
      return session._id;
    }

    const legacyUsers = await ctx.db
      .query("users")
      .withIndex("by_sessionToken", (q) => q.eq("sessionToken", args.sessionToken))
      .collect();
    const user = legacyUsers[0];
    if (!user || !user.sessionExpiry || user.sessionExpiry >= Date.now()) return null;
    await ctx.db.patch(user._id, {
      sessionToken: undefined,
      sessionExpiry: undefined,
    });
    return user._id;
  },
});

export const destroySession = mutation({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query("adminSessions")
      .withIndex("by_sessionToken", (q) => q.eq("sessionToken", args.sessionToken))
      .collect();
    const session = sessions[0];
    if (session) {
      await ctx.db.delete(session._id);
      return session._id;
    }

    const legacyUsers = await ctx.db
      .query("users")
      .withIndex("by_sessionToken", (q) => q.eq("sessionToken", args.sessionToken))
      .collect();
    const user = legacyUsers[0];
    if (!user) return null;
    await ctx.db.patch(user._id, {
      sessionToken: undefined,
      sessionExpiry: undefined,
    });
    return user._id;
  },
});
