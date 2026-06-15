import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { buildAssessmentReport } from "@/lib/assessmentReport";
import { prisma } from "@/lib/db";
import { notifyAdminsOfTrainerContact } from "@/lib/adminNotifications";
import { notifyTrainerOfContract } from "@/lib/trainerNotify";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const body = await req.json();
    const trainerId = body.trainerId as string | undefined;
    const ownerMessage = (body.message as string | undefined)?.trim() || undefined;

    if (!trainerId) {
      return NextResponse.json({ error: "trainerId is required." }, { status: 400 });
    }

    const trainer = await prisma.certifiedTrainer.findFirst({
      where: { id: trainerId, active: true }
    });

    if (!trainer) {
      return NextResponse.json({ error: "Trainer not found." }, { status: 404 });
    }

    const existing = await prisma.trainerContract.findFirst({
      where: { ownerId: user.id, trainerId, status: "pending" }
    });

    if (existing) {
      return NextResponse.json(
        { error: "You already have a pending request with this trainer.", contractId: existing.id },
        { status: 409 }
      );
    }

    const report = buildAssessmentReport(user);
    const reportSummary = report
      ? [
          `Primary challenge: ${report.primaryChallenge}`,
          `Recommended track: ${report.recommendedTrackTitle}`,
          `Completed: ${new Date(report.completedAt).toLocaleDateString()}`
        ].join(" · ")
      : "No assessment report on file — owner should complete the Training Assessment.";

    const contract = await prisma.trainerContract.create({
      data: {
        ownerId: user.id,
        trainerId: trainer.id,
        ownerMessage,
        assessmentReport: report ? JSON.stringify(report) : null,
        reportSummary,
        status: "pending"
      }
    });

    const adminNotify = await notifyAdminsOfTrainerContact({
      contractId: contract.id,
      owner: user,
      trainer: { name: trainer.name },
      ownerMessage,
      reportSummary
    });

    const notify = await notifyTrainerOfContract({
      trainer: { name: trainer.name, email: trainer.email },
      owner: user,
      report,
      ownerMessage,
      contractId: contract.id
    });

    const updateData: { adminNotified?: boolean; trainerNotified?: boolean } = {};
    if (adminNotify.sent) updateData.adminNotified = true;
    if (notify.sent) updateData.trainerNotified = true;

    if (Object.keys(updateData).length) {
      await prisma.trainerContract.update({
        where: { id: contract.id },
        data: updateData
      });
    }

    return NextResponse.json({
      success: true,
      contractId: contract.id,
      trainerName: trainer.name,
      reportAttached: Boolean(report),
      reportSummary,
      adminNotified: adminNotify.sent,
      emailSent: notify.sent
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Please sign in to contact a trainer." }, { status: 401 });
    }
    return NextResponse.json({ error: "Could not submit trainer request." }, { status: 500 });
  }
}
