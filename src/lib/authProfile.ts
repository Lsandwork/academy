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

function isTrainerEnumError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return message.includes("TRAINER") && message.includes("enum");
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
