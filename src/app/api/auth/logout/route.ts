import { NextResponse } from "next/server";
import { signOutCurrentUser } from "@/lib/auth";

export async function POST(req: Request) {
  await signOutCurrentUser();

  const origin = req.headers.get("origin");
  const base = process.env.NEXT_PUBLIC_APP_URL || origin || "http://localhost:3000";
  return NextResponse.redirect(new URL("/", base), 303);
}
