import { AccessLevel, Prisma, Role, User } from "@prisma/client";
import { prisma } from "@/lib/db";

const VALID_ROLES = new Set<string>(["USER", "STAFF", "ADMIN", "TRAINER"]);

type RawUserRow = {
  id: string;
  supabaseId: string | null;
  email: string;
  passwordHash: string | null;
  name: string | null;
  avatarUrl: string | null;
  role: string;
  mustChangePassword: boolean;
  accessLevel: string;
  creditBalance: number;
  purchasedLessonIds: string;
  completedLessonIds: string;
  favoriteLessonIds: string;
  lastOpenedLessonId: string | null;
  assessmentResult: string | null;
  stripeCustomerId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

function normalizeRole(role: string): Role {
  const upper = role.toUpperCase();
  if (VALID_ROLES.has(upper)) return upper as Role;
  return Role.USER;
}

function normalizeAccessLevel(level: string): AccessLevel {
  const upper = level.toUpperCase();
  if (Object.values(AccessLevel).includes(upper as AccessLevel)) return upper as AccessLevel;
  return AccessLevel.FREE;
}

function mapRawUser(row: RawUserRow): User {
  return {
    ...row,
    role: normalizeRole(row.role),
    accessLevel: normalizeAccessLevel(row.accessLevel)
  };
}

function isPrismaEnumError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes("not found in enum") || (message.includes("TRAINER") && message.includes("enum"));
}

export async function listAllUsers(options?: {
  includeRecentCredits?: boolean;
  orderBy?: "createdAt" | "email";
}) {
  const include = options?.includeRecentCredits
    ? { creditTransactions: { orderBy: { createdAt: "desc" as const }, take: 5 } }
    : undefined;

  try {
    return await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include
    });
  } catch (error) {
    if (!isPrismaEnumError(error)) throw error;
  }

  const rows = await prisma.$queryRaw<RawUserRow[]>`
    SELECT * FROM academy."User" ORDER BY "createdAt" DESC
  `;
  const users = rows.map(mapRawUser);

  if (!options?.includeRecentCredits) return users;

  const credits = await prisma.creditTransaction.findMany({
    orderBy: { createdAt: "desc" }
  });

  const creditsByUser = new Map<string, typeof credits>();
  for (const tx of credits) {
    const list = creditsByUser.get(tx.userId) ?? [];
    if (list.length < 5) {
      list.push(tx);
      creditsByUser.set(tx.userId, list);
    }
  }

  return users.map((user) => ({
    ...user,
    creditTransactions: creditsByUser.get(user.id) ?? []
  }));
}

export async function findUserById(id: string) {
  try {
    return await prisma.user.findUnique({ where: { id } });
  } catch (error) {
    if (!isPrismaEnumError(error)) throw error;
  }

  const rows = await prisma.$queryRaw<RawUserRow[]>`
    SELECT * FROM academy."User" WHERE id = ${id} LIMIT 1
  `;
  return rows[0] ? mapRawUser(rows[0]) : null;
}

function isTrainerEnumError(error: unknown) {
  return isPrismaEnumError(error);
}

export async function findUserProfile(authUser: { id: string; email?: string }) {
  const email = authUser.email?.toLowerCase().trim();

  try {
    if (email) {
      return await prisma.user.findFirst({
        where: {
          OR: [{ supabaseId: authUser.id }, { email }]
        }
      });
    }
    return await prisma.user.findFirst({ where: { supabaseId: authUser.id } });
  } catch (error) {
    if (!isTrainerEnumError(error)) throw error;
  }

  if (!email && !authUser.id) return null;

  const rows = email
    ? await prisma.$queryRaw<RawUserRow[]>`
        SELECT *
        FROM academy."User"
        WHERE "supabaseId" = ${authUser.id} OR LOWER(email) = ${email}
        LIMIT 1
      `
    : await prisma.$queryRaw<RawUserRow[]>`
        SELECT *
        FROM academy."User"
        WHERE "supabaseId" = ${authUser.id}
        LIMIT 1
      `;

  return rows[0] ? mapRawUser(rows[0]) : null;
}

export async function updateUserProfile(
  id: string,
  data: Prisma.UserUpdateInput
): Promise<User> {
  try {
    return await prisma.user.update({ where: { id }, data });
  } catch (error) {
    if (!isTrainerEnumError(error) || !data.supabaseId || typeof data.supabaseId !== "string") throw error;

    await prisma.$executeRaw`
      UPDATE academy."User"
      SET "supabaseId" = ${data.supabaseId}, "updatedAt" = NOW()
      WHERE id = ${id}
    `;

    const profile = await findUserProfile({ id, email: undefined });
    if (!profile) throw new Error("Could not reload user profile.");
    return profile;
  }
}
