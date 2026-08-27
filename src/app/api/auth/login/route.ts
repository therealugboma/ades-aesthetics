import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || "ades-aesthetics-admin-secret-change-in-production";

function base64url(data: Buffer | string): string {
  const str = typeof data === "string" ? data : data.toString("latin1");
  return Buffer.from(str, "latin1").toString("base64url");
}

function sign(payload: object): string {
  const header = base64url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const body = base64url(JSON.stringify(payload));
  const signature = base64url(
    crypto.createHmac("sha256", JWT_SECRET).update(`${header}.${body}`).digest()
  );
  return `${header}.${body}.${signature}`;
}

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    return NextResponse.json({ error: "Convex not configured" }, { status: 500 });
  }

  try {
    const response = await fetch(`${convexUrl}/api/query`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: "admin:verifyAdmin",
        args: { email, password },
      }),
    });

    const data = await response.json();

    if (!data.value) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const sessionToken = crypto.randomBytes(32).toString("hex");
    const expiry = Date.now() + 24 * 60 * 60 * 1000;

    // Store session token in Convex
    await fetch(`${convexUrl}/api/mutation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: "auth:createSession",
        args: {
          userId: data.value.userId,
          sessionToken,
          expiry,
        },
      }),
    });

    const token = sign({
      sub: data.value.userId,
      email: data.value.email,
      name: data.value.name,
      role: data.value.role,
      sessionToken,
      exp: expiry,
    });

    const res = NextResponse.json({
      user: { email: data.value.email, name: data.value.name, role: data.value.role },
    });

    res.cookies.set("admin-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 24 * 60 * 60,
    });

    return res;
  } catch (error) {
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
