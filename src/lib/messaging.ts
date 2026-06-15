import { PrismaClient, Role, User } from "@prisma/client";
import { isApprovedContractStatus } from "./contracts";

export async function getAdminUsers(prisma: PrismaClient) {
  return prisma.user.findMany({
    where: { role: { in: [Role.ADMIN, Role.STAFF] } },
    select: { id: true, name: true, email: true, role: true }
  });
}

export async function ensureContractConversation(
  prisma: PrismaClient,
  contractId: string,
  ownerId: string,
  trainerUserId: string
) {
  const existing = await prisma.conversation.findUnique({
    where: { contractId }
  });
  if (existing) return existing;

  return prisma.conversation.create({
    data: {
      contractId,
      subject: "Trainer support",
      participants: {
        create: [{ userId: ownerId }, { userId: trainerUserId }]
      }
    }
  });
}

export async function getOrCreateDirectConversation(
  prisma: PrismaClient,
  userAId: string,
  userBId: string,
  subject?: string
) {
  const conversations = await prisma.conversation.findMany({
    where: {
      contractId: null,
      AND: [
        { participants: { some: { userId: userAId } } },
        { participants: { some: { userId: userBId } } }
      ]
    },
    include: { participants: true }
  });

  const match = conversations.find((c) => {
    if (c.participants.length !== 2) return false;
    const ids = c.participants.map((p) => p.userId).sort();
    const pair = [userAId, userBId].sort();
    return ids[0] === pair[0] && ids[1] === pair[1];
  });

  if (match) return match;

  return prisma.conversation.create({
    data: {
      subject: subject ?? "Fitdog Academy",
      participants: {
        create: [{ userId: userAId }, { userId: userBId }]
      }
    }
  });
}

export async function canUsersMessage(
  prisma: PrismaClient,
  sender: Pick<User, "id" | "role">,
  recipient: Pick<User, "id" | "role">
) {
  if (sender.id === recipient.id) return false;
  if (sender.role === Role.ADMIN || sender.role === Role.STAFF) return true;
  if (recipient.role === Role.ADMIN || recipient.role === Role.STAFF) return true;

  const contract = await prisma.trainerContract.findFirst({
    where: {
      status: { in: ["approved", "active", "completed"] },
      OR: [
        { ownerId: sender.id, trainer: { userId: recipient.id } },
        { ownerId: recipient.id, trainer: { userId: sender.id } }
      ]
    }
  });

  return Boolean(contract && isApprovedContractStatus(contract.status));
}

export function conversationTitle(
  participants: Array<{ userId: string; user: { name: string | null; email: string; role: Role } }>,
  currentUserId: string
) {
  const other = participants.find((p) => p.userId !== currentUserId)?.user;
  if (!other) return "Conversation";
  return other.name || other.email.split("@")[0];
}
