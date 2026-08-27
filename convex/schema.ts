import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    name: v.string(),
    role: v.union(v.literal("admin"), v.literal("staff")),
    passwordHash: v.string(),
    sessionToken: v.optional(v.string()),
    sessionExpiry: v.optional(v.number()),
  }).index("by_email", ["email"])
    .index("by_sessionToken", ["sessionToken"]),

  customers: defineTable({
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_email", ["email"]),

  services: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    price: v.number(),
    duration: v.number(),
    category: v.union(v.literal("nails"), v.literal("lashes"), v.literal("brows"), v.literal("skin"), v.literal("other")),
    imageUrl: v.optional(v.string()),
    isActive: v.boolean(),
    sortOrder: v.number(),
  }).index("by_slug", ["slug"])
    .index("by_category", ["category"])
    .index("by_active", ["isActive", "sortOrder"]),

  appointments: defineTable({
    customerId: v.id("customers"),
    serviceId: v.id("services"),
    date: v.string(),
    time: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("completed"),
      v.literal("cancelled"),
      v.literal("no_show")
    ),
    depositAmount: v.number(),
    totalAmount: v.number(),
    notes: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_date", ["date"])
    .index("by_customer", ["customerId"])
    .index("by_status", ["status"])
    .index("by_service", ["serviceId"]),

  payments: defineTable({
    reference: v.string(),
    appointmentId: v.optional(v.id("appointments")),
    orderId: v.optional(v.id("orders")),
    amount: v.number(),
    currency: v.string(),
    status: v.union(v.literal("pending"), v.literal("success"), v.literal("failed"), v.literal("abandoned")),
    metadata: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_reference", ["reference"])
    .index("by_status", ["status"]),

  galleryImages: defineTable({
    url: v.string(),
    alt: v.string(),
    category: v.union(v.literal("nails"), v.literal("lashes"), v.literal("brows"), v.literal("skin"), v.literal("all")),
    isFeatured: v.boolean(),
    sortOrder: v.number(),
    createdAt: v.number(),
  }).index("by_category", ["category"])
    .index("by_featured", ["isFeatured"]),

  productCategories: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    sortOrder: v.number(),
  }).index("by_slug", ["slug"]),

  products: defineTable({
    name: v.string(),
    slug: v.string(),
    description: v.string(),
    price: v.number(),
    categoryId: v.id("productCategories"),
    imageUrl: v.string(),
    stock: v.number(),
    isActive: v.boolean(),
    isFeatured: v.boolean(),
    createdAt: v.number(),
  }).index("by_slug", ["slug"])
    .index("by_category", ["categoryId"])
    .index("by_active", ["isActive"])
    .index("by_featured", ["isFeatured"]),

  orders: defineTable({
    customerId: v.id("customers"),
    status: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("processing"),
      v.literal("shipped"),
      v.literal("delivered"),
      v.literal("cancelled")
    ),
    totalAmount: v.number(),
    subtotal: v.optional(v.number()),
    deliveryFee: v.optional(v.number()),
    deliveryCost: v.optional(v.number()),
    deliveryAddress: v.string(),
    deliveryNotes: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_customer", ["customerId"])
    .index("by_status", ["status"]),

  orderItems: defineTable({
    orderId: v.id("orders"),
    productId: v.id("products"),
    quantity: v.number(),
    price: v.number(),
  }).index("by_order", ["orderId"]),

  blockedTimes: defineTable({
    date: v.string(),
    startTime: v.string(),
    endTime: v.string(),
    reason: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_date", ["date"]),

  businessSettings: defineTable({
    key: v.string(),
    value: v.string(),
  }).index("by_key", ["key"]),

  contactMessages: defineTable({
    name: v.string(),
    email: v.string(),
    subject: v.string(),
    message: v.string(),
    isRead: v.boolean(),
    createdAt: v.number(),
  }).index("by_read", ["isRead"]),
});
