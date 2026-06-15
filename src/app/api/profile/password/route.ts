import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { logUserActivity } from "@/lib/activityLog";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireUser();
    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Current and new password are required." }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ error: "New password must be at least 8 characters." }, { status: 400 });
    }

    const supabase = await createClient();
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword
    });

    if (verifyError) {
      return NextResponse.json({ error: "Current password is incorrect." }, { status: 401 });
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await logUserActivity({
      userId: user.id,
      userEmail: user.email,
      category: "profile",
      action: "password_changed",
      summary: `${user.email} changed their password`
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
