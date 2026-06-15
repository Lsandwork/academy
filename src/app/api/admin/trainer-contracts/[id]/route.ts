import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth";
import { CONTRACT_STATUS } from "@/lib/contracts";
import { prisma } from "@/lib/db";
import { ensureContractConversation } from "@/lib/messaging";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const admin = await requireStaff();
    const { id } = await params;
    const body = await req.json();
    const action = body.action as string | undefined;

    const contract = await prisma.trainerContract.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        trainer: { select: { id: true, name: true, userId: true } }
      }
    });

    if (!contract) {
      return NextResponse.json({ error: "Contract not found." }, { status: 404 });
    }

    if (action === "approve") {
      if (!contract.trainer.userId) {
        return NextResponse.json(
          { error: "Trainer does not have a linked login account yet. Run users:repair first." },
          { status: 409 }
        );
      }

      const updated = await prisma.trainerContract.update({
        where: { id },
        data: {
          status: CONTRACT_STATUS.APPROVED,
          approvedAt: new Date(),
          approvedById: admin.id
        }
      });

      await ensureContractConversation(prisma, contract.id, contract.owner.id, contract.trainer.userId);

      return NextResponse.json({ ok: true, contract: updated, message: "Assignment approved. Trainer and owner can now message." });
    }

    if (action === "decline") {
      const updated = await prisma.trainerContract.update({
        where: { id },
        data: {
          status: CONTRACT_STATUS.DECLINED,
          approvedById: admin.id
        }
      });
      return NextResponse.json({ ok: true, contract: updated, message: "Assignment declined." });
    }

    if (action === "activate") {
      const updated = await prisma.trainerContract.update({
        where: { id },
        data: { status: CONTRACT_STATUS.ACTIVE }
      });
      return NextResponse.json({ ok: true, contract: updated });
    }

    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}
