import { NextResponse } from "next/server";
import { requireTrainerApi } from "@/lib/auth";
import { PENDING_STATUSES, contractStatusLabel, isApprovedContractStatus } from "@/lib/contracts";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const user = await requireTrainerApi();

    const trainerProfile = await prisma.certifiedTrainer.findFirst({
      where: { userId: user.id, active: true }
    });

    if (!trainerProfile && user.role !== "ADMIN") {
      return NextResponse.json({ error: "No trainer profile linked to this account." }, { status: 404 });
    }

    const contracts = await prisma.trainerContract.findMany({
      where: trainerProfile ? { trainerId: trainerProfile.id } : undefined,
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        owner: { select: { id: true, name: true, email: true } },
        conversation: { select: { id: true } }
      }
    });

    const activeClients = contracts.filter((c) => isApprovedContractStatus(c.status));
    const awaitingAdmin = contracts.filter((c) => PENDING_STATUSES.includes(c.status as (typeof PENDING_STATUSES)[number]));

    return NextResponse.json({
      trainer: trainerProfile
        ? {
            id: trainerProfile.id,
            name: trainerProfile.name,
            title: trainerProfile.title,
            email: trainerProfile.email
          }
        : null,
      contracts,
      activeClients,
      awaitingAdmin,
      statusLabels: Object.fromEntries(contracts.map((c) => [c.id, contractStatusLabel(c.status)]))
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
