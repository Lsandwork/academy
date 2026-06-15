import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category")?.trim();
    const q = searchParams.get("q")?.trim().toLowerCase();
    const limit = Math.min(Number(searchParams.get("limit") || 100), 500);

    const logs = await prisma.userActivityLog.findMany({
      where: {
        ...(category && category !== "all" ? { category } : {}),
        ...(q
          ? {
              OR: [
                { userEmail: { contains: q, mode: "insensitive" } },
                { actorEmail: { contains: q, mode: "insensitive" } },
                { summary: { contains: q, mode: "insensitive" } },
                { action: { contains: q, mode: "insensitive" } }
              ]
            }
          : {})
      },
      orderBy: { createdAt: "desc" },
      take: limit
    });

    return NextResponse.json({ logs });
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}
