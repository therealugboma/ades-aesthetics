import { query } from "./_generated/server";
import { v } from "convex/values";

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
    if (user.passwordHash !== args.password) return null;
    if (user.role !== "admin") return null;

    return {
      userId: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  },
});
