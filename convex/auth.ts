import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const verifySession = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("users")
      .withIndex("by_sessionToken", (q) => q.eq("sessionToken", args.sessionToken))
      .collect();

    if (results.length === 0) return null;

    const user = results[0];

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
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      sessionToken: undefined,
      sessionExpiry: undefined,
    });
    return args.userId;
  },
});

export const createSession = mutation({
  args: {
    userId: v.id("users"),
    sessionToken: v.string(),
    expiry: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      sessionToken: args.sessionToken,
      sessionExpiry: args.expiry,
    });
    return args.userId;
  },
});

export const destroySession = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      sessionToken: undefined,
      sessionExpiry: undefined,
    });
    return args.userId;
  },
});
