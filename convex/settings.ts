import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./helpers";

export const get = query({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db.query("businessSettings").collect();
    const result: Record<string, string> = {};
    for (const setting of settings) {
      result[setting.key] = setting.value;
    }
    return result;
  },
});

export const update = mutation({
  args: {
    sessionToken: v.string(),
    key: v.string(),
    value: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    const existing = await ctx.db
      .query("businessSettings")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .collect();
    if (existing.length > 0) {
      await ctx.db.patch(existing[0]._id, { value: args.value });
      return existing[0]._id;
    }
    return await ctx.db.insert("businessSettings", {
      key: args.key,
      value: args.value,
    });
  },
});

export const getByKey = query({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("businessSettings")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .collect();
    return results[0] ?? null;
  },
});
