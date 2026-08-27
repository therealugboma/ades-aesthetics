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
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const images = await convexQuery("gallery:list", {
      category: category || undefined
    });

    return NextResponse.json({ images: images || [] });
  } catch (error) {
    console.error("Gallery error:", error);
    return NextResponse.json(
      { error: "Failed to fetch gallery" },
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
    const { url, alt, category, isFeatured, sortOrder } = await request.json();

    if (!url || !alt || !category) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const imageId = await convexMutation("gallery:create", {
      sessionToken,
      url,
      alt,
      category,
      isFeatured: isFeatured || false,
      sortOrder: sortOrder || 0,
    });

    return NextResponse.json({ id: imageId });
  } catch (error) {
    console.error("Gallery create error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create gallery item" },
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
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Missing image ID" },
        { status: 400 }
      );
    }

    await convexMutation("gallery:remove", { sessionToken, id });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Gallery delete error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete gallery item" },
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
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const { url, alt, category, isFeatured, sortOrder } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Missing image ID" },
        { status: 400 }
      );
    }

    const updatedId = await convexMutation("gallery:update", {
      sessionToken,
      id,
      ...(url !== undefined && { url }),
      ...(alt !== undefined && { alt }),
      ...(category !== undefined && { category }),
      ...(isFeatured !== undefined && { isFeatured }),
      ...(sortOrder !== undefined && { sortOrder }),
    });

    return NextResponse.json({ id: updatedId });
  } catch (error) {
    console.error("Gallery update error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update gallery item" },
      { status: 500 }
    );
  }
}
