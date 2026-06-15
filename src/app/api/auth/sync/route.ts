import { NextRequest, NextResponse } from "next/server";
import { ensureProfileForAuthUser, redirectForRole, signOutCurrentUser } from "@/lib/auth";
import { logUserActivity } from "@/lib/activityLog";
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
    const trainerOnly = Boolean(body.trainerOnly);

    const profile = await ensureProfileForAuthUser(user);

    if (staffOnly && profile.role === "USER") {
      await signOutCurrentUser();
      return NextResponse.json({ error: "Staff access only." }, { status: 403 });
    }

    if (trainerOnly && profile.role !== "TRAINER" && profile.role !== "ADMIN") {
      await signOutCurrentUser();
      return NextResponse.json({ error: "Trainer access only." }, { status: 403 });
    }

    if (profile.mustChangePassword) {
      await logUserActivity({
        userId: profile.id,
        userEmail: profile.email,
        category: "auth",
        action: "login",
        summary: `${profile.email} signed in (password change required)`,
        metadata: { role: profile.role }
      });
      return NextResponse.json({ ok: true, redirect: "/change-password?required=1", mustChangePassword: true });
    }

    await logUserActivity({
      userId: profile.id,
      userEmail: profile.email,
      category: "auth",
      action: "login",
      summary: `${profile.email} signed in`,
      metadata: { role: profile.role, redirect: redirectForRole(profile.role) }
    });

    return NextResponse.json({ ok: true, redirect: redirectForRole(profile.role) });
  } catch (err) {
    console.error("auth/sync", err);
    const message = err instanceof Error ? err.message : "Server error during login.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
