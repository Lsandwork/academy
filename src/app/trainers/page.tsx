import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { buildAssessmentReport } from "@/lib/assessmentReport";
import { prisma } from "@/lib/db";
import TrainersClient from "./TrainersClient";

function safeJsonArray(raw: string) {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : [];
  } catch {
    return [];
  }
}

export default async function TrainersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/trainers");

  const trainers = await prisma.certifiedTrainer.findMany({
    where: { active: true },
    orderBy: { name: "asc" }
  });

  const assessmentReport = buildAssessmentReport(user);

  const pendingContracts = await prisma.trainerContract.findMany({
    where: { ownerId: user.id, status: "pending" },
    select: { trainerId: true }
  });
  const pendingTrainerIds = pendingContracts.map((c) => c.trainerId);

  return (
    <TrainersClient
      user={user}
      trainers={trainers.map((t) => ({
        id: t.id,
        slug: t.slug,
        name: t.name,
        title: t.title,
        bio: t.bio,
        specialties: safeJsonArray(t.specialties),
        photoUrl: t.photoUrl
      }))}
      assessmentReport={assessmentReport}
      pendingTrainerIds={pendingTrainerIds}
    />
  );
}
