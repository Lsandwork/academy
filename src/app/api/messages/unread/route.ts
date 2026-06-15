import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const user = await requireUser();

    const memberships = await prisma.conversationParticipant.findMany({
      where: { userId: user.id },
      select: { conversationId: true, lastReadAt: true }
    });

    let unread = 0;
    for (const m of memberships) {
      unread += await prisma.message.count({
        where: {
          conversationId: m.conversationId,
          senderId: { not: user.id },
          ...(m.lastReadAt ? { createdAt: { gt: m.lastReadAt } } : {})
        }
      });
    }

    return NextResponse.json({ unread });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ unread: 0 });
  }
}
