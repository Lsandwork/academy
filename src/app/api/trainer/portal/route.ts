import { NextResponse } from "next/server";
import { requireTrainerPortalApi } from "@/lib/trainerPortalAccess";
import { PENDING_STATUSES, isApprovedContractStatus } from "@/lib/contracts";
import { academyLessons } from "@/data/academyCourses";
import { cgcLessonIds } from "@/data/akcCgcPrep";
import { prisma } from "@/lib/db";
import { parseJsonArray } from "@/lib/user";

export async function GET() {
  try {
    const user = await requireTrainerPortalApi();

    const trainerProfile = await prisma.certifiedTrainer.findFirst({
      where: { userId: user.id, active: true }
    });

    const contracts = await prisma.trainerContract.findMany({
      where: trainerProfile ? { trainerId: trainerProfile.id } : user.role === "ADMIN" || user.role === "STAFF" ? undefined : { id: "none" },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            completedLessonIds: true,
            lastOpenedLessonId: true,
            purchasedLessonIds: true
          }
        },
        conversation: { select: { id: true } }
      }
    });

    const activeClients = contracts.filter((c) => isApprovedContractStatus(c.status));
    const awaitingAdmin = contracts.filter((c) => PENDING_STATUSES.includes(c.status as (typeof PENDING_STATUSES)[number]));

    const ownerIds = [...new Set(activeClients.map((c) => c.ownerId))];
    const ownerProgress = activeClients.map((c) => {
      const completed = parseJsonArray(c.owner.completedLessonIds);
      const purchased = parseJsonArray(c.owner.purchasedLessonIds);
      const cgcAccess = cgcLessonIds.every((id) => purchased.includes(id));
      return {
        ownerId: c.owner.id,
        email: c.owner.email,
        name: c.owner.name,
        completedCount: completed.length,
        totalLessons: academyLessons.length,
        lastOpenedLessonId: c.owner.lastOpenedLessonId,
        cgcAccess
      };
    });

    return NextResponse.json({
      trainer: trainerProfile
        ? { id: trainerProfile.id, name: trainerProfile.name, title: trainerProfile.title, email: trainerProfile.email }
        : user.role === "ADMIN"
          ? { id: user.id, name: user.name || "Admin", title: "Administrator", email: user.email }
          : null,
      activeClients,
      awaitingAdmin,
      ownerProgress,
      ownerIds
    });
  } catch (error) {
    if (error instanceof Error && error.message === "PASSWORD_CHANGE_REQUIRED") {
      return NextResponse.json({ error: "Password change required.", code: "PASSWORD_CHANGE_REQUIRED" }, { status: 403 });
    }
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}
