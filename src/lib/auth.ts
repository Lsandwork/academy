import bcrypt from "bcryptjs";
import { User } from "@prisma/client";
import { prisma } from "./db";
import { getSession } from "./session";
import { SafeUser, toSafeUser } from "./user";

export type { SafeUser } from "./user";
export { accessLabel, hasLessonAccess, parseJsonArray, toSafeUser } from "./user";

export async function getCurrentUser(): Promise<SafeUser | null> {
  const session = await getSession();
  if (!session.userId) return null;

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  return user ? toSafeUser(user) : null;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}

export async function requireStaff() {
  const user = await requireUser();
  if (user.role !== "STAFF" && user.role !== "ADMIN") throw new Error("FORBIDDEN");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") throw new Error("FORBIDDEN");
  return user;
}

export async function verifyPassword(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });
  if (!user) return null;
  const valid = await bcrypt.compare(password, user.passwordHash);
  return valid ? user : null;
}

export async function createSession(user: User) {
  const session = await getSession();
  session.userId = user.id;
  session.email = user.email;
  session.role = user.role;
  await session.save();
}

export async function destroySession() {
  const session = await getSession();
  session.destroy();
}
