import { prisma } from "@/lib/db";

export type TrainerContactNotificationInput = {
  contractId: string;
  owner: { id: string; name: string | null; email: string };
  trainer: { name: string };
  ownerMessage?: string;
  reportSummary: string;
};

export async function notifyAdminsOfTrainerContact(input: TrainerContactNotificationInput) {
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: { id: true, email: true }
  });

  if (!admins.length) {
    console.warn("[admin-notify] No admin users found for trainer contact notification.");
    return { sent: false, count: 0 };
  }

  const ownerLabel = input.owner.name?.trim() || input.owner.email;
  const title = `Trainer contact: ${ownerLabel}`;
  const bodyParts = [
    `${ownerLabel} (${input.owner.email}) requested to work with a Fitdog trainer.`,
    `Selected trainer: ${input.trainer.name}`,
    input.ownerMessage ? `Owner message: ${input.ownerMessage}` : null,
    input.reportSummary
  ].filter(Boolean);

  const metadata = JSON.stringify({
    type: "trainer_contact",
    contractId: input.contractId,
    ownerId: input.owner.id
  });

  await prisma.adminNotification.createMany({
    data: admins.map((admin) => ({
      userId: admin.id,
      type: "trainer_contact",
      title,
      body: bodyParts.join("\n\n"),
      metadata
    }))
  });

  return { sent: true, count: admins.length };
}

export async function unreadAdminNotificationCount(userId: string) {
  return prisma.adminNotification.count({
    where: { userId, readAt: null }
  });
}
