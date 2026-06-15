import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { buildAssessmentReport } from "@/lib/assessmentReport";
import { prisma } from "@/lib/db";
import { toTrainerProfile } from "@/lib/trainerProfile";
import TrainersClient from "./TrainersClient";

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
      trainers={trainers.map(toTrainerProfile)}
      assessmentReport={assessmentReport}
      pendingTrainerIds={pendingTrainerIds}
    />
  );
}
