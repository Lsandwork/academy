import { NextRequest, NextResponse } from "next/server";
import { ensureProfileForAuthUser, redirectForRole, signOutCurrentUser } from "@/lib/auth";
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

    const profile = await ensureProfileForAuthUser(user);

    if (staffOnly && profile.role === "USER") {
      await signOutCurrentUser();
      return NextResponse.json({ error: "Staff access only." }, { status: 403 });
    }

    return NextResponse.json({ ok: true, redirect: redirectForRole(profile.role) });
  } catch (err) {
    console.error("auth/sync", err);
    const message = err instanceof Error ? err.message : "Server error during login.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
