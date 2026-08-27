import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./helpers";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const products = await ctx.db
      .query("products")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .collect();
    return products.filter((p) => p.stock > 0);
  },
});

export const listAll = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    return await ctx.db.query("products").order("desc").collect();
  },
});

export const listCategories = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    return await ctx.db.query("productCategories").collect();
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("products")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .collect();
    return results[0] ?? null;
  },
});

export const create = mutation({
  args: {
    sessionToken: v.string(),
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    price: v.number(),
    categoryId: v.id("productCategories"),
    imageUrl: v.string(),
    stock: v.number(),
    isFeatured: v.boolean(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    const existing = await ctx.db
      .query("products")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .collect();
    if (existing.length > 0) {
      throw new Error("A product with this slug already exists");
    }
    return await ctx.db.insert("products", {
      name: args.name,
      slug: args.slug,
      description: args.description,
      price: args.price,
      categoryId: args.categoryId,
      imageUrl: args.imageUrl,
      stock: args.stock,
      isFeatured: args.isFeatured,
      isActive: true,
      createdAt: Date.now(),
    });
  },
});

export const update = mutation({
  args: {
    sessionToken: v.string(),
    id: v.id("products"),
    name: v.optional(v.string()),
    slug: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    categoryId: v.optional(v.id("productCategories")),
    imageUrl: v.optional(v.string()),
    stock: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
    isFeatured: v.optional(v.boolean()),
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
  args: { sessionToken: v.string(), id: v.id("products") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx, args.sessionToken);
    await ctx.db.patch(args.id, { isActive: false });
    return args.id;
  },
});

export const reduceStock = internalMutation({
  args: {
    productId: v.id("products"),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.productId);
    if (!product) throw new Error("Product not found");
    if (product.stock < args.quantity) {
      throw new Error(`Insufficient stock for ${product.name}`);
    }
    await ctx.db.patch(args.productId, {
      stock: product.stock - args.quantity,
    });
    return args.productId;
  },
});
