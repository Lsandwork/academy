import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
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

    return NextResponse.json({ user: toSafeUser(updated) });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
