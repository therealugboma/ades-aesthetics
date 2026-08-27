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
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const users = await ctx.db
      .query("users")
      .withIndex("by_sessionToken", (q) => q.eq("sessionToken", args.sessionToken))
      .collect();
    const user = users[0];
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
    const users = await ctx.db
      .query("users")
      .withIndex("by_sessionToken", (q) => q.eq("sessionToken", args.sessionToken))
      .collect();
    const user = users[0];
    if (!user) return null;
    await ctx.db.patch(user._id, {
      sessionToken: undefined,
      sessionExpiry: undefined,
    });
    return user._id;
  },
});
