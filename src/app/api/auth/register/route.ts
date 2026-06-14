import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "This registration endpoint is deprecated. Use the register page with Supabase auth." },
    { status: 410 }
  );
}
