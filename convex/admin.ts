import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { hashPassword, verifyPassword } from "./password";
import { requireAdmin } from "./helpers";

const MAX_SESSION_MS = 24 * 60 * 60 * 1000;

export const startSession = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    sessionToken: v.string(),
    expiry: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    if (
      !/^[a-f0-9]{64}$/.test(args.sessionToken) ||
      args.expiry <= now ||
      args.expiry > now + MAX_SESSION_MS
    ) {
      throw new Error("Invalid session request");
    }

    const results = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.trim().toLowerCase()))
      .collect();
    const user = results[0];
    if (!user || user.role !== "admin") return null;
    if (!(await verifyPassword(args.password, user.passwordHash))) return null;

    await ctx.db.patch(user._id, {
      sessionToken: args.sessionToken,
      sessionExpiry: args.expiry,
    });

    return {
      userId: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  },
});

export const updateAdmin = mutation({
  args: {
    sessionToken: v.string(),
    userId: v.id("users"),
    email: v.optional(v.string()),
    password: v.optional(v.string()),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    const updates: Record<string, any> = {};
    if (args.email) updates.email = args.email;
    if (args.name) updates.name = args.name;
    if (args.password) updates.passwordHash = await hashPassword(args.password);
    if (Object.keys(updates).length === 0) throw new Error("Nothing to update");
    await ctx.db.patch(args.userId, updates);
    return args.userId;
  },
});

export const listUsers = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    return await ctx.db.query("users").collect();
  },
});
