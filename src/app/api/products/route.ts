import { NextRequest, NextResponse } from "next/server";
import { adminSessionToken } from "@/lib/admin-token";

async function convexQuery(path: string, args: Record<string, unknown>) {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error("Convex not configured");
  const res = await fetch(`${url}/api/query`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path, args }),
  });
  const data = await res.json();
  if (data.status !== "success") return null;
  return data.value;
}

async function convexMutation(path: string, args: Record<string, unknown>) {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) throw new Error("Convex not configured");
  const res = await fetch(`${url}/api/mutation`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ path, args }),
  });
  const data = await res.json();
  if (data.status !== "success") {
    throw new Error(data.message || `Failed: ${path}`);
  }
  return data.value;
}

export async function GET(request: NextRequest) {
  try {
    const slug = request.nextUrl.searchParams.get("slug");

    if (slug) {
      const product = await convexQuery("products:getBySlug", { slug });
      return NextResponse.json({ product: product || null });
    } else {
      const products = await convexQuery("products:list", {});
      return NextResponse.json({ products: products || [] });
    }
  } catch (error) {
    console.error("Products error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionToken = adminSessionToken(request);
    if (!sessionToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const { name, slug, description, price, categoryId, imageUrl, stock, isFeatured } = await request.json();

    if (!name || !slug || !description === undefined || price === undefined || !categoryId || !imageUrl || stock === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const productId = await convexMutation("products:create", {
      sessionToken,
      name,
      slug,
      description,
      price,
      categoryId,
      imageUrl,
      stock,
      isFeatured: isFeatured || false,
    });

    return NextResponse.json({ id: productId });
  } catch (error) {
    console.error("Products create error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create product" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const sessionToken = adminSessionToken(request);
    if (!sessionToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const { id, name, slug, description, price, categoryId, imageUrl, stock, isActive, isFeatured } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Missing product ID" },
        { status: 400 }
      );
    }

    const updatedId = await convexMutation("products:update", {
      sessionToken,
      id,
      ...(name !== undefined && { name }),
      ...(slug !== undefined && { slug }),
      ...(description !== undefined && { description }),
      ...(price !== undefined && { price }),
      ...(categoryId !== undefined && { categoryId }),
      ...(imageUrl !== undefined && { imageUrl }),
      ...(stock !== undefined && { stock }),
      ...(isActive !== undefined && { isActive }),
      ...(isFeatured !== undefined && { isFeatured }),
    });

    return NextResponse.json({ id: updatedId });
  } catch (error) {
    console.error("Products update error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const sessionToken = adminSessionToken(request);
    if (!sessionToken) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    const id = request.nextUrl.searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Missing product ID" },
        { status: 400 }
      );
    }

    // Note: The remove mutation in products.ts sets isActive to false rather than deleting
    await convexMutation("products:remove", { sessionToken, id });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Products delete error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete product" },
      { status: 500 }
    );
  }
}
