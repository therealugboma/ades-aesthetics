import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./helpers";

export const list = query({
  args: {
    date: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.date) {
      return await ctx.db
        .query("blockedTimes")
        .withIndex("by_date", (q) => q.eq("date", args.date!))
        .collect();
    }
    return await ctx.db.query("blockedTimes").collect();
  },
});

export const create = mutation({
  args: {
    sessionToken: v.string(),
    date: v.string(),
    startTime: v.string(),
    endTime: v.string(),
    reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    if (args.startTime >= args.endTime) {
      throw new Error("End time must be after start time");
    }
    return await ctx.db.insert("blockedTimes", {
      date: args.date,
      startTime: args.startTime,
      endTime: args.endTime,
      reason: args.reason,
      createdAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { sessionToken: v.string(), id: v.id("blockedTimes") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    await ctx.db.delete(args.id);
    return args.id;
  },
});
