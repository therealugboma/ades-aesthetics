import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./helpers";
import type { Doc } from "./_generated/dataModel";

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
    sessionToken: v.string(),
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
    await requireAdmin(ctx, args.sessionToken);
    return await ctx.db.insert("galleryImages", {
      url: args.url,
      alt: args.alt,
      category: args.category,
      isFeatured: args.isFeatured,
      sortOrder: args.sortOrder,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    sessionToken: v.string(),
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
    await requireAdmin(ctx, args.sessionToken);
    const updates: Partial<
      Pick<
        Doc<"galleryImages">,
        "url" | "alt" | "category" | "isFeatured" | "sortOrder"
      >
    > = {};
    if (args.url !== undefined) updates.url = args.url;
    if (args.alt !== undefined) updates.alt = args.alt;
    if (args.category !== undefined) updates.category = args.category;
    if (args.isFeatured !== undefined) updates.isFeatured = args.isFeatured;
    if (args.sortOrder !== undefined) updates.sortOrder = args.sortOrder;
    if (Object.keys(updates).length === 0) {
      throw new Error("No fields to update");
    }
    await ctx.db.patch(args.id, updates);
    return args.id;
  },
});

export const remove = mutation({
  args: { sessionToken: v.string(), id: v.id("galleryImages") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    await ctx.db.delete(args.id);
    return args.id;
  },
});
