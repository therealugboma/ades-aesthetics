import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { hashPassword } from "./password";
import type { Id } from "./_generated/dataModel";

export const seed = mutation({
  args: {
    seedToken: v.string(),
    adminEmail: v.string(),
    adminPassword: v.string(),
  },
  handler: async (ctx, args) => {
    const configuredSeedToken = process.env.SEED_TOKEN;
    if (!configuredSeedToken || args.seedToken !== configuredSeedToken) {
      throw new Error("Unauthorized seed request");
    }
    if (args.adminPassword.length < 12) {
      throw new Error("Admin password must be at least 12 characters");
    }
    const existingSettings = await ctx.db.query("businessSettings").collect();
    if (existingSettings.length > 0) {
      return "Already seeded — skipping";
    }

    const services = [
      {
        name: "Classic Manicure",
        slug: "classic-manicure",
        description: "A relaxing manicure including nail shaping, cuticle care, hand massage, and polish of your choice.",
        price: 4500,
        duration: 45,
        category: "nails" as const,
        sortOrder: 1,
      },
      {
        name: "Gel Nails",
        slug: "gel-nails",
        description: "Long-lasting gel nails with a flawless finish. Includes shaping, cuticle work, and UV-cured gel polish.",
        price: 6500,
        duration: 60,
        category: "nails" as const,
        imageUrl: "/services/premium/gel-french-pink.webp",
        imageUrls: [
          "/services/premium/gel-french-pink.webp",
          "/services/premium/gel-yellow-french.webp",
        ],
        sortOrder: 2,
      },
      {
        name: "Acrylic Full Set",
        slug: "acrylic-full-set",
        description: "Full set of acrylic nails with custom shape and design. Perfect for special occasions.",
        price: 8500,
        duration: 90,
        category: "nails" as const,
        imageUrl: "/services/premium/acrylic-short.webp",
        imageUrls: [
          "/services/premium/acrylic-short.webp",
          "/services/premium/acrylic-long.webp",
        ],
        priceOptions: [
          { label: "Short Nails", price: 8500 },
          { label: "Long Nails", price: 10500 },
        ],
        sortOrder: 3,
      },
      {
        name: "BIAB Nails",
        slug: "biab-nails",
        description: "Builder gel manicure that strengthens natural nails while creating a smooth, glossy and durable finish.",
        price: 7500,
        duration: 75,
        category: "nails" as const,
        imageUrl: "/services/premium/biab-yellow-pattern.webp",
        imageUrls: [
          "/services/premium/biab-yellow-pattern.webp",
          "/services/premium/biab-yellow-pattern-two-hands.webp",
        ],
        sortOrder: 4,
      },
      {
        name: "Classic Lash Extensions",
        slug: "classic-lash-extensions",
        description: "Individual lash extensions applied one-to-one for a natural, everyday look.",
        price: 12000,
        duration: 90,
        category: "lashes" as const,
        imageUrl: "/services/premium/classic-lashes.webp",
        imageUrls: ["/services/premium/classic-lashes.webp"],
        sortOrder: 5,
      },
      {
        name: "Hybrid Set Lashes",
        slug: "hybrid-set-lashes",
        description: "A balanced blend of classic and volume lashes for textured fullness with a soft, natural finish.",
        price: 13500,
        duration: 120,
        category: "lashes" as const,
        imageUrl: "/services/premium/hybrid-lashes-front.webp",
        imageUrls: [
          "/services/premium/hybrid-lashes-front.webp",
          "/services/premium/hybrid-lashes-close.webp",
        ],
        sortOrder: 6,
      },
      {
        name: "Wispy Set Lashes",
        slug: "wispy-set-lashes",
        description: "A soft, fluttery extension set with carefully placed wispy spikes for an airy, textured look.",
        price: 14000,
        duration: 120,
        category: "lashes" as const,
        imageUrl: "/services/premium/wispy-lashes-portrait.webp",
        imageUrls: [
          "/services/premium/wispy-lashes-portrait.webp",
          "/services/premium/wispy-lashes-detail.webp",
        ],
        sortOrder: 7,
      },
      {
        name: "Volume Lash Extensions",
        slug: "volume-lash-extensions",
        description: "Multiple lightweight extensions per natural lash for a dramatic, full look.",
        price: 15000,
        duration: 120,
        category: "lashes" as const,
        sortOrder: 8,
      },
      {
        name: "Lash Lift & Tint",
        slug: "lash-lift-tint",
        description: "Semi-permanent lash curl and tint for beautifully defined eyes without extensions.",
        price: 9000,
        duration: 60,
        category: "lashes" as const,
        sortOrder: 9,
      },
      {
        name: "Brow Shaping & Tint",
        slug: "brow-shaping-tint",
        description: "Precision brow shaping with wax and tint to define and enhance your brows.",
        price: 5500,
        duration: 30,
        category: "brows" as const,
        sortOrder: 10,
      },
    ];

    for (const service of services) {
      await ctx.db.insert("services", {
        ...service,
        isActive: true,
      });
    }

    const productCategories = [
      { name: "Nail Care", slug: "nail-care", sortOrder: 1 },
      { name: "Lash Products", slug: "lash-products", sortOrder: 2 },
      { name: "Brow Products", slug: "brow-products", sortOrder: 3 },
      { name: "Accessories", slug: "accessories", sortOrder: 4 },
    ];

    const categoryIds: Record<string, Id<"productCategories">> = {};
    for (const cat of productCategories) {
      const id = await ctx.db.insert("productCategories", cat);
      categoryIds[cat.slug] = id;
    }

    const products = [
      {
        name: "Cuticle Oil",
        slug: "cuticle-oil",
        description: "Nourishing cuticle oil to keep nails and surrounding skin healthy and moisturized.",
        price: 2500,
        categoryId: categoryIds["nail-care"],
        stock: 50,
        isFeatured: true,
      },
      {
        name: "Nail Strengthener",
        slug: "nail-strengthener",
        description: "Strengthening base coat that helps prevent breakage and promotes healthy nail growth.",
        price: 3000,
        categoryId: categoryIds["nail-care"],
        stock: 35,
        isFeatured: false,
      },
      {
        name: "Lash Cleanser",
        slug: "lash-cleanser",
        description: "Gentle foaming cleanser specially formulated for eyelash extensions.",
        price: 3500,
        categoryId: categoryIds["lash-products"],
        stock: 40,
        isFeatured: true,
      },
      {
        name: "Lash Growth Serum",
        slug: "lash-growth-serum",
        description: "Peptide-rich serum to promote longer, thicker natural lashes with consistent use.",
        price: 7500,
        categoryId: categoryIds["lash-products"],
        stock: 25,
        isFeatured: true,
      },
      {
        name: "Brow Soap Kit",
        slug: "brow-soap-kit",
        description: "Natural brow soap with spoolie for achieving fluffy, laminated brow looks at home.",
        price: 2000,
        categoryId: categoryIds["brow-products"],
        stock: 60,
        isFeatured: false,
      },
      {
        name: "Brow Pencil",
        slug: "brow-pencil",
        description: "Ultra-fine tip brow pencil for precise hair-like strokes and natural definition.",
        price: 3500,
        categoryId: categoryIds["brow-products"],
        stock: 45,
        isFeatured: false,
      },
      {
        name: "Nail Art Brush Set",
        slug: "nail-art-brush-set",
        description: "Professional set of 5 nail art brushes for detailed designs and French tips.",
        price: 4500,
        categoryId: categoryIds["accessories"],
        stock: 30,
        isFeatured: false,
      },
      {
        name: "Reusable Lash Curler",
        slug: "reusable-lash-curler",
        description: "Ergonomic lash curler with silicone pad for a gentle, lasting curl.",
        price: 3000,
        categoryId: categoryIds["accessories"],
        stock: 20,
        isFeatured: true,
      },
    ];

    for (const product of products) {
      await ctx.db.insert("products", {
        ...product,
        imageUrl: "",
        imageUrls: [],
        isActive: true,
        createdAt: Date.now(),
      });
    }

    const galleryImages = [
      { url: "/services/premium/gel-french-pink.webp", alt: "Gel manicure artwork", category: "nails" as const, isFeatured: true, sortOrder: 1 },
      { url: "/services/premium/biab-yellow-pattern.webp", alt: "BIAB nail pattern", category: "nails" as const, isFeatured: true, sortOrder: 2 },
      { url: "/services/premium/acrylic-long.webp", alt: "Acrylic nail design", category: "nails" as const, isFeatured: true, sortOrder: 3 },
      { url: "/services/premium/classic-lashes.webp", alt: "Classic lash extensions", category: "lashes" as const, isFeatured: true, sortOrder: 4 },
      { url: "/services/premium/hybrid-lashes-front.webp", alt: "Hybrid lash extensions", category: "lashes" as const, isFeatured: true, sortOrder: 5 },
      { url: "/services/premium/wispy-lashes-portrait.webp", alt: "Wispy lash extensions", category: "lashes" as const, isFeatured: true, sortOrder: 6 },
    ];

    for (const img of galleryImages) {
      await ctx.db.insert("galleryImages", {
        ...img,
        createdAt: Date.now(),
      });
    }

    const settings = [
      { key: "business_name", value: "Ades Aesthetics" },
      { key: "business_hours", value: JSON.stringify({ open: "10:00", close: "19:00" }) },
      { key: "deposit_percentage", value: "30" },
      { key: "whatsapp_number", value: "+2348164695802" },
      { key: "address", value: "123 Beauty Lane, Victoria Island, Lagos, Nigeria" },
      { key: "email", value: "adesaesthetics@gmail.com" },
      { key: "phone", value: "+2348164695802" },
      { key: "instagram", value: "@ades_aesthetics" },
    ];

    for (const setting of settings) {
      await ctx.db.insert("businessSettings", setting);
    }

    await ctx.db.insert("users", {
      email: args.adminEmail.trim().toLowerCase(),
      name: "Admin",
      role: "admin",
      passwordHash: await hashPassword(args.adminPassword),
    });

    return "Seeded successfully";
  },
});

export const syncServicePortfolio = mutation({
  args: { seedToken: v.string() },
  handler: async (ctx, args) => {
    const configuredSeedToken = process.env.SEED_TOKEN;
    if (!configuredSeedToken || args.seedToken !== configuredSeedToken) {
      throw new Error("Unauthorized portfolio sync request");
    }

    const portfolioServices = [
      {
        name: "Classic Manicure",
        slug: "classic-manicure",
        description: "A relaxing manicure including nail shaping, cuticle care, hand massage, and polish of your choice.",
        price: 4500,
        priceOptions: [],
        duration: 45,
        category: "nails" as const,
        sortOrder: 1,
      },
      {
        name: "Gel Nails",
        slug: "gel-nails",
        description: "Long-lasting gel nails with a flawless finish. Includes shaping, cuticle work, and UV-cured gel polish.",
        price: 6500,
        priceOptions: [],
        duration: 60,
        category: "nails" as const,
        imageUrl: "/services/premium/gel-french-pink.webp",
        imageUrls: [
          "/services/premium/gel-french-pink.webp",
          "/services/premium/gel-yellow-french.webp",
        ],
        sortOrder: 2,
      },
      {
        name: "Acrylic Full Set",
        slug: "acrylic-full-set",
        description: "Full set of acrylic nails with your preferred length, custom shape and design.",
        price: 8500,
        priceOptions: [
          { label: "Short Nails", price: 8500 },
          { label: "Long Nails", price: 10500 },
        ],
        duration: 90,
        category: "nails" as const,
        imageUrl: "/services/premium/acrylic-short.webp",
        imageUrls: [
          "/services/premium/acrylic-short.webp",
          "/services/premium/acrylic-long.webp",
        ],
        sortOrder: 3,
      },
      {
        name: "BIAB Nails",
        slug: "biab-nails",
        description: "Builder gel manicure that strengthens natural nails while creating a smooth, glossy and durable finish.",
        price: 7500,
        priceOptions: [],
        duration: 75,
        category: "nails" as const,
        imageUrl: "/services/premium/biab-yellow-pattern.webp",
        imageUrls: [
          "/services/premium/biab-yellow-pattern.webp",
          "/services/premium/biab-yellow-pattern-two-hands.webp",
        ],
        sortOrder: 4,
      },
      {
        name: "Classic Lash Extensions",
        slug: "classic-lash-extensions",
        description: "Individual lash extensions applied one-to-one for a natural, everyday look.",
        price: 12000,
        priceOptions: [],
        duration: 90,
        category: "lashes" as const,
        imageUrl: "/services/premium/classic-lashes.webp",
        imageUrls: ["/services/premium/classic-lashes.webp"],
        sortOrder: 5,
      },
      {
        name: "Hybrid Set Lashes",
        slug: "hybrid-set-lashes",
        description: "A balanced blend of classic and volume lashes for textured fullness with a soft, natural finish.",
        price: 13500,
        priceOptions: [],
        duration: 120,
        category: "lashes" as const,
        imageUrl: "/services/premium/hybrid-lashes-front.webp",
        imageUrls: [
          "/services/premium/hybrid-lashes-front.webp",
          "/services/premium/hybrid-lashes-close.webp",
        ],
        sortOrder: 6,
      },
      {
        name: "Wispy Set Lashes",
        slug: "wispy-set-lashes",
        description: "A soft, fluttery extension set with carefully placed wispy spikes for an airy, textured look.",
        price: 14000,
        priceOptions: [],
        duration: 120,
        category: "lashes" as const,
        imageUrl: "/services/premium/wispy-lashes-portrait.webp",
        imageUrls: [
          "/services/premium/wispy-lashes-portrait.webp",
          "/services/premium/wispy-lashes-detail.webp",
        ],
        sortOrder: 7,
      },
      {
        name: "Volume Lash Extensions",
        slug: "volume-lash-extensions",
        description: "Multiple lightweight extensions per natural lash for a dramatic, full look.",
        price: 15000,
        priceOptions: [],
        duration: 120,
        category: "lashes" as const,
        sortOrder: 8,
      },
      {
        name: "Lash Lift & Tint",
        slug: "lash-lift-tint",
        description: "Semi-permanent lash curl and tint for beautifully defined eyes without extensions.",
        price: 9000,
        priceOptions: [],
        duration: 60,
        category: "lashes" as const,
        sortOrder: 9,
      },
      {
        name: "Brow Shaping & Tint",
        slug: "brow-shaping-tint",
        description: "Precision brow shaping with wax and tint to define and enhance your brows.",
        price: 5500,
        priceOptions: [],
        duration: 30,
        category: "brows" as const,
        sortOrder: 10,
      },
    ];

    let created = 0;
    let updated = 0;
    for (const service of portfolioServices) {
      const existing = await ctx.db
        .query("services")
        .withIndex("by_slug", (query) => query.eq("slug", service.slug))
        .first();
      if (existing) {
        await ctx.db.patch(existing._id, { ...service, isActive: true });
        updated += 1;
      } else {
        await ctx.db.insert("services", { ...service, isActive: true });
        created += 1;
      }
    }

    return { created, updated, total: portfolioServices.length };
  },
});
