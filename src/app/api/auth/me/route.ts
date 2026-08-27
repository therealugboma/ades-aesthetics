import { NextRequest, NextResponse } from "next/server";

const JWT_SECRET = process.env.ADMIN_JWT_SECRET || "ades-aesthetics-admin-secret-change-in-production";

function base64url(str: string): string {
  return Buffer.from(str).toString("base64url");
}

function verify(token: string): any | null {
  try {
    const [header, body, signature] = token.split(".");
    const expectedSig = base64url(
      require("crypto").createHmac("sha256", JWT_SECRET).update(`${header}.${body}`).digest()
    );
    if (signature !== expectedSig) return null;
    const payload = JSON.parse(Buffer.from(body, "base64url").toString());
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const token = request.cookies.get("admin-token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const payload = verify(token);
  if (!payload) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }

  return NextResponse.json({
    user: { email: payload.email, name: payload.name, role: payload.role },
  });
}
