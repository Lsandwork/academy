import { AccessLevel, Role } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { logError } from "@/lib/errors";
import { toSafeUser } from "@/lib/user";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireAdmin();
    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const data: Record<string, unknown> = {};

      if (body.role && Object.values(Role).includes(body.role)) data.role = body.role;
      if (body.accessLevel && Object.values(AccessLevel).includes(body.accessLevel)) data.accessLevel = body.accessLevel;
      if (typeof body.name === "string") data.name = body.name.trim() || null;
      if (Array.isArray(body.purchasedLessonIds)) data.purchasedLessonIds = JSON.stringify(body.purchasedLessonIds);
      if (Array.isArray(body.completedLessonIds)) data.completedLessonIds = JSON.stringify(body.completedLessonIds);

      if (typeof body.creditBalance === "number" && body.creditBalance >= 0 && body.creditBalance !== existing.creditBalance) {
        const delta = body.creditBalance - existing.creditBalance;
        await tx.creditTransaction.create({
          data: {
            userId: id,
            amount: delta,
            reason: delta > 0 ? "Admin balance adjustment (grant)" : "Admin balance adjustment (revoke)",
            createdById: admin.id
          }
        });
        data.creditBalance = body.creditBalance;
      }

      if (!Object.keys(data).length) {
        throw new Error("NO_FIELDS");
      }

      return tx.user.update({ where: { id }, data });
    });

    return NextResponse.json({ user: toSafeUser(updated) });
  } catch (error) {
    if (error instanceof Error && error.message === "NO_FIELDS") {
      return NextResponse.json({ error: "No valid fields to update." }, { status: 400 });
    }
    await logError({ severity: "warning", area: "Admin Users", message: String(error) });
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}
