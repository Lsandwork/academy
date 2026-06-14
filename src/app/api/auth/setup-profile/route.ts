import { NextRequest, NextResponse } from "next/server";
import { ensureProfileForAuthUser, redirectForRole } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error
    } = await supabase.auth.getUser();

    if (error || !user?.email) {
      return NextResponse.json({ error: error?.message || "Not authenticated." }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const name = typeof body.name === "string" ? body.name.trim() || null : user.user_metadata?.name || null;

    let profile = await ensureProfileForAuthUser(user);

    if (name && !profile.name) {
      profile = await prisma.user.update({
        where: { id: profile.id },
        data: { name }
      });
    }

    return NextResponse.json({ ok: true, redirect: redirectForRole(profile.role) });
  } catch (err) {
    console.error("auth/setup-profile", err);
    return NextResponse.json({ error: "Could not set up your account profile." }, { status: 500 });
  }
}
