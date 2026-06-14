import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const user = await requireUser();

    const contracts = await prisma.trainerContract.findMany({
      where: { ownerId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        trainer: {
          select: { id: true, name: true, title: true, email: true }
        }
      }
    });

    return NextResponse.json({ contracts });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
