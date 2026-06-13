import { NextRequest, NextResponse } from "next/server";
import { createSession, verifyPassword } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { email, password, staffOnly } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
  }

  const user = await verifyPassword(email, password);
  if (!user) {
    return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
  }

  if (staffOnly && user.role === "USER") {
    return NextResponse.json({ error: "Staff access only." }, { status: 403 });
  }

  await createSession(user);
  const redirect = user.role === "ADMIN" || user.role === "STAFF" ? "/admin" : "/dashboard";
  return NextResponse.json({ ok: true, redirect });
}
