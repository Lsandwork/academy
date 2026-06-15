import { AccessLevel, Role, User } from "@prisma/client";

export type SafeUser = Omit<User, "passwordHash">;

export function parseJsonArray(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : [];
  } catch {
    return [];
  }
}

export function isAdmin(user: Pick<SafeUser, "role">) {
  return user.role === Role.ADMIN;
}

export function isTrainer(user: Pick<SafeUser, "role">) {
  return user.role === Role.TRAINER;
}

export function isStaffOrAdmin(user: Pick<SafeUser, "role">) {
  return user.role === Role.STAFF || user.role === Role.ADMIN;
}

export function hasFullPaidAccess(user: Pick<SafeUser, "role" | "accessLevel">) {
  if (isAdmin(user) || isTrainer(user)) return true;
  return user.accessLevel === AccessLevel.MONTHLY || user.accessLevel === AccessLevel.LIFETIME;
}

export function hasLessonAccess(user: SafeUser, lessonId: string, isFreePreview: boolean) {
  if (isFreePreview) return true;
  if (isAdmin(user) || isTrainer(user)) return true;
  if (hasFullPaidAccess(user)) return true;
  return parseJsonArray(user.purchasedLessonIds).includes(lessonId);
}

export function trackProgress(user: SafeUser, lessonIds: string[]) {
  const completed = parseJsonArray(user.completedLessonIds);
  if (!lessonIds.length) return 0;
  return completed.filter((id) => lessonIds.includes(id)).length / lessonIds.length;
}

export function accessLabel(level: AccessLevel) {
  return level.replace("_", " ").toLowerCase();
}

export function toSafeUser(user: User): SafeUser {
  const { passwordHash: _, ...safe } = user;
  return safe;
}
