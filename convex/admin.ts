import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import bcrypt from "bcrypt";

export const verifyAdmin = query({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .collect();

    if (results.length === 0) return null;

    const user = results[0];
    if (!bcrypt.compareSync(args.password, user.passwordHash)) return null;
    if (user.role !== "admin") return null;

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
    userId: v.id("users"),
    email: v.optional(v.string()),
    password: v.optional(v.string()),
    name: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const updates: Record<string, any> = {};
    if (args.email) updates.email = args.email;
    if (args.name) updates.name = args.name;
    if (args.password) updates.passwordHash = bcrypt.hashSync(args.password, 10);
    if (Object.keys(updates).length === 0) throw new Error("Nothing to update");
    await ctx.db.patch(args.userId, updates);
    return args.userId;
  },
});

export const listUsers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});
