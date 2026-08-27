import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./helpers";

export const send = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    subject: v.string(),
    message: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("contactMessages", {
      ...args,
      isRead: false,
      createdAt: Date.now(),
    });
  },
});

export const list = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    return await ctx.db.query("contactMessages").order("desc").collect();
  },
});

export const markRead = mutation({
  args: { sessionToken: v.string(), id: v.id("contactMessages") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    await ctx.db.patch(args.id, { isRead: true });
    return args.id;
  },
});

export const remove = mutation({
  args: { sessionToken: v.string(), id: v.id("contactMessages") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    await ctx.db.delete(args.id);
    return args.id;
  },
});
