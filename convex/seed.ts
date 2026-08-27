import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const seed = mutation({
  args: {},
  handler: async (ctx) => {
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
        sortOrder: 2,
      },
      {
        name: "Acrylic Full Set",
        slug: "acrylic-full-set",
        description: "Full set of acrylic nails with custom shape and design. Perfect for special occasions.",
        price: 8500,
        duration: 90,
        category: "nails" as const,
        sortOrder: 3,
      },
      {
        name: "Classic Lash Extensions",
        slug: "classic-lash-extensions",
        description: "Individual lash extensions applied one-to-one for a natural, everyday look.",
        price: 12000,
        duration: 90,
        category: "lashes" as const,
        sortOrder: 4,
      },
      {
        name: "Volume Lash Extensions",
        slug: "volume-lash-extensions",
        description: "Multiple lightweight extensions per natural lash for a dramatic, full look.",
        price: 15000,
        duration: 120,
        category: "lashes" as const,
        sortOrder: 5,
      },
      {
        name: "Lash Lift & Tint",
        slug: "lash-lift-tint",
        description: "Semi-permanent lash curl and tint for beautifully defined eyes without extensions.",
        price: 9000,
        duration: 60,
        category: "lashes" as const,
        sortOrder: 6,
      },
      {
        name: "Brow Shaping & Tint",
        slug: "brow-shaping-tint",
        description: "Precision brow shaping with wax and tint to define and enhance your brows.",
        price: 5500,
        duration: 30,
        category: "brows" as const,
        sortOrder: 7,
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

    const categoryIds: Record<string, any> = {};
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
        isActive: true,
        createdAt: Date.now(),
      });
    }

    const galleryImages = [
      { url: "/images/gallery/classic-manicure.jpg", alt: "Classic manicure result", category: "nails" as const, isFeatured: true, sortOrder: 1 },
      { url: "/images/gallery/gel-nails-pink.jpg", alt: "Pink gel nails", category: "nails" as const, isFeatured: true, sortOrder: 2 },
      { url: "/images/gallery/acrylic-nail-art.jpg", alt: "Custom acrylic nail art", category: "nails" as const, isFeatured: false, sortOrder: 3 },
      { url: "/images/gallery/classic-lashes.jpg", alt: "Classic lash extensions", category: "lashes" as const, isFeatured: true, sortOrder: 4 },
      { url: "/images/gallery/volume-lashes.jpg", alt: "Volume lash extensions", category: "lashes" as const, isFeatured: true, sortOrder: 5 },
      { url: "/images/gallery/lash-lift.jpg", alt: "Lash lift and tint result", category: "lashes" as const, isFeatured: false, sortOrder: 6 },
      { url: "/images/gallery/brow-shaping.jpg", alt: "Freshly shaped brows", category: "brows" as const, isFeatured: true, sortOrder: 7 },
      { url: "/images/gallery/brow-tint.jpg", alt: "Brow tinting result", category: "brows" as const, isFeatured: false, sortOrder: 8 },
      { url: "/images/gallery/studio-interior.jpg", alt: "Ades Aesthetics studio interior", category: "all" as const, isFeatured: true, sortOrder: 9 },
    ];

    for (const img of galleryImages) {
      await ctx.db.insert("galleryImages", {
        ...img,
        createdAt: Date.now(),
      });
    }

    const settings = [
      { key: "business_name", value: "Ades Aesthetics" },
      { key: "business_hours", value: JSON.stringify({ open: "09:00", close: "19:00" }) },
      { key: "deposit_percentage", value: "30" },
      { key: "whatsapp_number", value: "+2348000000000" },
      { key: "address", value: "123 Beauty Lane, Victoria Island, Lagos, Nigeria" },
      { key: "email", value: "hello@adesaesthetics.com" },
      { key: "phone", value: "+2348000000000" },
      { key: "instagram", value: "@adesaesthetics" },
    ];

    for (const setting of settings) {
      await ctx.db.insert("businessSettings", setting);
    }

    const bcryptHash = await hashPassword("admin123");
    await ctx.db.insert("users", {
      email: "admin@adesaesthetics.com",
      name: "Admin",
      role: "admin",
      passwordHash: bcryptHash,
    });

    return "Seeded successfully";
  },
});

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
