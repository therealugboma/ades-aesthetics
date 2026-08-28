import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { signAdminToken } from "@/lib/admin-token";

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }

  if (process.env.NODE_ENV === "production" && !process.env.ADMIN_JWT_SECRET) {
    return NextResponse.json(
      { error: "Admin authentication is not configured" },
      { status: 500 }
    );
  }

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    return NextResponse.json({ error: "Convex not configured" }, { status: 500 });
  }

  try {
    const sessionToken = crypto.randomBytes(32).toString("hex");
    const expiry = Date.now() + 24 * 60 * 60 * 1000;

    const response = await fetch(`${convexUrl}/api/mutation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: "admin:startSession",
        args: { email: email.trim().toLowerCase(), password, sessionToken, expiry },
      }),
    });

    const data = await response.json();

    if (!data.value) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = signAdminToken({
      sub: data.value.userId,
      email: data.value.email,
      name: data.value.name,
      role: data.value.role,
      sessionToken,
      exp: expiry,
    });
    if (!token) {
      return NextResponse.json(
        { error: "Admin authentication is not configured" },
        { status: 500 }
      );
    }

    const res = NextResponse.json({
      user: { email: data.value.email, name: data.value.name, role: data.value.role },
    });

    res.cookies.set("admin-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: new Date(expiry),
      maxAge: 24 * 60 * 60,
      priority: "high",
    });
    res.headers.set("Cache-Control", "no-store");

    return res;
  } catch (error) {
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
