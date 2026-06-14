import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

function friendlyAuthError(message: string) {
  const lower = message.toLowerCase();
  if (lower.includes("rate limit") || lower.includes("email rate limit")) {
    return "Too many signup attempts right now. Please wait a few minutes and try again, or sign in if you already have an account.";
  }
  if (lower.includes("already") || lower.includes("registered")) {
    return "An account with this email already exists. Try signing in.";
  }
  return message;
}

export async function POST(req: NextRequest) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    const displayName = typeof name === "string" ? name.trim() || null : null;

    const existingProfile = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existingProfile) {
      return NextResponse.json({ error: "An account with this email already exists. Try signing in." }, { status: 409 });
    }

    const admin = createAdminClient();
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: true,
      user_metadata: { name: displayName || "" }
    });

    if (createError) {
      return NextResponse.json({ error: friendlyAuthError(createError.message) }, { status: 400 });
    }

    const authUser = created.user;
    if (!authUser) {
      return NextResponse.json({ error: "Could not create your account." }, { status: 500 });
    }

    await prisma.user.create({
      data: {
        supabaseId: authUser.id,
        email: normalizedEmail,
        name: displayName
      }
    });

    const supabase = await createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password
    });

    if (signInError) {
      return NextResponse.json(
        {
          ok: true,
          redirect: "/login",
          message: "Account created. Please sign in with your email and password."
        },
        { status: 201 }
      );
    }

    return NextResponse.json({ ok: true, redirect: "/dashboard" });
  } catch (err) {
    console.error("auth/register", err);
    const message = err instanceof Error ? err.message : "Registration failed.";
    if (message.includes("admin is not configured")) {
      return NextResponse.json({ error: "Registration is not configured on the server." }, { status: 503 });
    }
    return NextResponse.json({ error: "Registration failed. Please try again." }, { status: 500 });
  }
}
