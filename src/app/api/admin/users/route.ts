import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { toSafeUser } from "@/lib/user";

export async function GET() {
  try {
    await requireStaff();
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        creditTransactions: { orderBy: { createdAt: "desc" }, take: 5 }
      }
    });

    return NextResponse.json({
      users: users.map((u) => ({
        ...toSafeUser(u),
        recentCredits: u.creditTransactions
      }))
    });
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}
