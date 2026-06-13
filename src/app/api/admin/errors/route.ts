import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    await requireAdmin();
    const errors = await prisma.errorLog.findMany({ orderBy: { createdAt: "desc" }, take: 50 });
    return NextResponse.json({ errors });
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}
