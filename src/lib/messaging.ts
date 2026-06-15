import { PrismaClient, Role, User } from "@prisma/client";
import { listAllUsers } from "./authProfile";
import { isApprovedContractStatus } from "./contracts";

export async function getAdminUsers(prisma: PrismaClient) {
  try {
    return await prisma.user.findMany({
      where: { role: { in: [Role.ADMIN, Role.STAFF] } },
      select: { id: true, name: true, email: true, role: true }
    });
  } catch {
    const all = await listAllUsers();
    return all
      .filter((u) => u.role === Role.ADMIN || u.role === Role.STAFF)
      .map((u) => ({ id: u.id, name: u.name, email: u.email, role: u.role }));
  }
}

export async function getMessageableRecipients(
  prisma: PrismaClient,
  currentUser: Pick<User, "id" | "role">,
  query: string
) {
  const normalized = query.toLowerCase();
  let pool: Pick<User, "id" | "name" | "email" | "role">[] = [];

  if (currentUser.role === Role.ADMIN || currentUser.role === Role.STAFF) {
    const all = await listAllUsers();
    pool = all.filter((u) => u.id !== currentUser.id);
  } else if (currentUser.role === Role.TRAINER) {
    const contracts = await prisma.trainerContract.findMany({
      where: {
        status: { in: ["approved", "active", "completed"] },
        trainer: { userId: currentUser.id }
      },
      include: { owner: { select: { id: true, name: true, email: true, role: true } } }
    });
    pool = contracts.map((c) => c.owner);
    const admins = await getAdminUsers(prisma);
    pool = [...pool, ...admins.filter((a) => a.id !== currentUser.id)];
  } else {
    const admins = await getAdminUsers(prisma);
    pool = [...admins];

    const trainerContracts = await prisma.trainerContract.findMany({
      where: {
        ownerId: currentUser.id,
        status: { in: ["approved", "active", "completed"] }
      },
      include: { trainer: { select: { userId: true, name: true, email: true } } }
    });

    for (const contract of trainerContracts) {
      if (!contract.trainer.userId) continue;
      pool.push({
        id: contract.trainer.userId,
        name: contract.trainer.name,
        email: contract.trainer.email,
        role: Role.TRAINER
      });
    }
  }

  const seen = new Set<string>();
  return pool.filter((u) => {
    if (seen.has(u.id)) return false;
    seen.add(u.id);
    const haystack = `${u.name ?? ""} ${u.email}`.toLowerCase();
    return haystack.includes(normalized);
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
