import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Please sign in to view trainers." }, { status: 401 });
  }

  const trainers = await prisma.certifiedTrainer.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    select: {
      id: true,
      slug: true,
      name: true,
      title: true,
      bio: true,
      specialties: true,
      photoUrl: true
    }
  });

  return NextResponse.json({
    trainers: trainers.map((t) => ({
      ...t,
      specialties: safeJsonArray(t.specialties)
    }))
  });
}

function safeJsonArray(raw: string) {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : [];
  } catch {
    return [];
  }
}
