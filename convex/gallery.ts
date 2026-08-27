import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./helpers";

export const list = query({
  args: {
    category: v.optional(
      v.union(
        v.literal("nails"),
        v.literal("lashes"),
        v.literal("brows"),
        v.literal("skin"),
        v.literal("all")
      )
    ),
  },
  handler: async (ctx, args) => {
    if (args.category) {
      return await ctx.db
        .query("galleryImages")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .order("asc")
        .collect();
    }
    return await ctx.db.query("galleryImages").order("asc").collect();
  },
});

export const getFeatured = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("galleryImages")
      .withIndex("by_featured", (q) => q.eq("isFeatured", true))
      .order("asc")
      .collect();
  },
});

export const create = mutation({
  args: {
    url: v.string(),
    alt: v.string(),
    category: v.union(
      v.literal("nails"),
      v.literal("lashes"),
      v.literal("brows"),
      v.literal("skin"),
      v.literal("all")
    ),
    isFeatured: v.boolean(),
    sortOrder: v.number(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.insert("galleryImages", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("galleryImages"),
    url: v.optional(v.string()),
    alt: v.optional(v.string()),
    category: v.optional(
      v.union(
        v.literal("nails"),
        v.literal("lashes"),
        v.literal("brows"),
        v.literal("skin"),
        v.literal("all")
      )
    ),
    isFeatured: v.optional(v.boolean()),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { id, ...fields } = args;
    const updates: Record<string, any> = {};
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) {
        updates[key] = value;
      }
    }
    if (Object.keys(updates).length === 0) {
      throw new Error("No fields to update");
    }
    await ctx.db.patch(id, updates);
    return id;
  },
});

export const remove = mutation({
  args: { id: v.id("galleryImages") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.id);
    return args.id;
  },
});
