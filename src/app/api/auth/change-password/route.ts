import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser, requireUser } from "@/lib/auth";
import { logUserActivity } from "@/lib/activityLog";
import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const { newPassword } = await req.json();

    if (!newPassword || String(newPassword).length < 8) {
      return NextResponse.json({ error: "New password must be at least 8 characters." }, { status: 400 });
    }

    if (!user.mustChangePassword) {
      return NextResponse.json({ error: "Password change is not required for this account." }, { status: 400 });
    }

    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({ password: String(newPassword) });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { mustChangePassword: false }
    });

    await logUserActivity({
      userId: user.id,
      userEmail: user.email,
      category: "auth",
      action: "password_reset_required",
      summary: `${user.email} completed required password change`
    });

    const redirect =
      user.role === "TRAINER" ? "/trainer" : user.role === "ADMIN" || user.role === "STAFF" ? "/admin" : "/dashboard";

    return NextResponse.json({ ok: true, redirect });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
    }
    return NextResponse.json({ error: "Could not update password." }, { status: 500 });
  }
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ mustChangePassword: user.mustChangePassword });
}
