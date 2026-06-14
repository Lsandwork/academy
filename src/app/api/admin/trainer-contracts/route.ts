import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    await requireStaff();

    const contracts = await prisma.trainerContract.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        owner: { select: { id: true, name: true, email: true } },
        trainer: { select: { id: true, name: true, email: true, title: true } }
      }
    });

    return NextResponse.json({ contracts });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}
