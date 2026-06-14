import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "This login endpoint is deprecated. Use the login page with Supabase auth." },
    { status: 410 }
  );
}
