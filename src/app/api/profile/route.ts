import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { logUserActivity } from "@/lib/activityLog";
import { toSafeUser } from "@/lib/user";
import { prisma } from "@/lib/db";

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireUser();
    const { name } = await req.json();

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { name: name?.trim() || null }
    });

    await logUserActivity({
      userId: user.id,
      userEmail: user.email,
      category: "profile",
      action: "profile_updated",
      summary: `${user.email} updated profile name`,
      metadata: { name: name?.trim() || null }
    });

    return NextResponse.json({ user: toSafeUser(updated) });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
