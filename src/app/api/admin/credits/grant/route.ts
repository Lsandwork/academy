import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { logUserActivity } from "@/lib/activityLog";
import { prisma } from "@/lib/db";
import { toSafeUser } from "@/lib/user";

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const { userId, amount, reason } = await req.json();

    if (!userId || !amount || amount < 1) {
      return NextResponse.json({ error: "userId and positive amount are required." }, { status: 400 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      await tx.creditTransaction.create({
        data: {
          userId,
          amount,
          reason: reason || "Admin grant",
          createdById: admin.id
        }
      });

      return tx.user.update({
        where: { id: userId },
        data: { creditBalance: { increment: amount } }
      });
    });

    await logUserActivity({
      userId,
      userEmail: updated.email,
      actor: admin,
      category: "credits",
      action: "credits_granted",
      summary: `Admin granted ${amount} credit(s) to ${updated.email}`,
      metadata: { amount, reason: reason || "Admin grant" },
      targetType: "user",
      targetId: userId
    });

    return NextResponse.json({ user: toSafeUser(updated) });
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}
