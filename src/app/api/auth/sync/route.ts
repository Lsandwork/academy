import { NextRequest, NextResponse } from "next/server";
import { findProfileForAuthUser, redirectForRole, signOutCurrentUser } from "@/lib/auth";
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
    const staffOnly = Boolean(body.staffOnly);

    let profile = await findProfileForAuthUser(user);

    if (!profile) {
      return NextResponse.json(
        {
          error: "Login worked, but your account profile is not set up yet.",
          code: "NO_PROFILE"
        },
        { status: 404 }
      );
    }

    if (!profile.supabaseId) {
      profile = await prisma.user.update({
        where: { id: profile.id },
        data: { supabaseId: user.id }
      });
    }

    if (staffOnly && profile.role === "USER") {
      await signOutCurrentUser();
      return NextResponse.json({ error: "Staff access only." }, { status: 403 });
    }

    return NextResponse.json({ ok: true, redirect: redirectForRole(profile.role) });
  } catch (err) {
    console.error("auth/sync", err);
    return NextResponse.json({ error: "Server error during login." }, { status: 500 });
  }
}
