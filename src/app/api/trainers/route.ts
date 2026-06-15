import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { toTrainerProfile } from "@/lib/trainerProfile";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Please sign in to view trainers." }, { status: 401 });
  }

  const trainers = await prisma.certifiedTrainer.findMany({
    where: { active: true },
    orderBy: { name: "asc" }
  });

  return NextResponse.json({
    trainers: trainers.map(toTrainerProfile)
  });
}
