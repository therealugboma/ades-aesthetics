import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./helpers";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("services")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("services")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .collect();
    return results[0] ?? null;
  },
});

export const getAll = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    return await ctx.db.query("services").collect();
  },
});

export const create = mutation({
  args: {
    sessionToken: v.string(),
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    price: v.number(),
    duration: v.number(),
    category: v.union(
      v.literal("nails"),
      v.literal("lashes"),
      v.literal("brows"),
      v.literal("skin"),
      v.literal("other")
    ),
    imageUrl: v.optional(v.string()),
    sortOrder: v.number(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    const existing = await ctx.db
      .query("services")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .collect();
    if (existing.length > 0) {
      throw new Error("A service with this slug already exists");
    }
    return await ctx.db.insert("services", {
      name: args.name,
      slug: args.slug,
      description: args.description,
      price: args.price,
      duration: args.duration,
      category: args.category,
      imageUrl: args.imageUrl,
      sortOrder: args.sortOrder,
      isActive: true,
    });
  },
});

export const update = mutation({
  args: {
    sessionToken: v.string(),
    id: v.id("services"),
    name: v.optional(v.string()),
    slug: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    duration: v.optional(v.number()),
    category: v.optional(
      v.union(
        v.literal("nails"),
        v.literal("lashes"),
        v.literal("brows"),
        v.literal("skin"),
        v.literal("other")
      )
    ),
    imageUrl: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
    sortOrder: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    const fields: Partial<typeof args> = { ...args };
    delete fields.id;
    delete fields.sessionToken;
    const updates: Record<string, any> = {};
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) {
        updates[key] = value;
      }
    }
    if (Object.keys(updates).length === 0) {
      throw new Error("No fields to update");
    }
    await ctx.db.patch(args.id, updates);
    return args.id;
  },
});

export const remove = mutation({
  args: { sessionToken: v.string(), id: v.id("services") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    await ctx.db.patch(args.id, { isActive: false });
    return args.id;
  },
});

export const reorder = mutation({
  args: {
    sessionToken: v.string(),
    items: v.array(
      v.object({
        id: v.id("services"),
        sortOrder: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    for (const item of args.items) {
      await ctx.db.patch(item.id, { sortOrder: item.sortOrder });
    }
  },
});
