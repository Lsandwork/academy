import { AccessLevel, Role, User } from "@prisma/client";
import { cgcLessonIds } from "@/data/akcCgcPrep";

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

export function hasCgcCourseAccess(user: Pick<SafeUser, "role" | "purchasedLessonIds">) {
  if (isAdmin(user) || isTrainer(user)) return true;
  const purchased = parseJsonArray(user.purchasedLessonIds);
  return cgcLessonIds.every((id) => purchased.includes(id));
}

export function hasLessonAccess(user: SafeUser, lessonId: string, isFreePreview: boolean) {
  if (isFreePreview) return true;
  if (isAdmin(user) || isTrainer(user)) return true;
  if (cgcLessonIds.includes(lessonId)) {
    return hasCgcCourseAccess(user);
  }
  if (hasFullPaidAccess(user)) return true;
  return parseJsonArray(user.purchasedLessonIds).includes(lessonId);
}

export function trackProgress(user: SafeUser, lessonIds: string[]) {
  const completed = parseJsonArray(user.completedLessonIds);
  if (!lessonIds.length) return 0;
  return completed.filter((id) => lessonIds.includes(id)).length / lessonIds.length;
}

export function accessLabel(level: AccessLevel) {
  switch (level) {
    case AccessLevel.FREE:
      return "Free";
    case AccessLevel.SINGLE_LESSON:
      return "Single lesson";
    case AccessLevel.MONTHLY:
      return "Monthly membership";
    case AccessLevel.LIFETIME:
      return "Lifetime access";
    default:
      return String(level).replace("_", " ").toLowerCase();
  }
}

export function roleLabel(role: Role) {
  switch (role) {
    case Role.USER:
      return "Standard user";
    case Role.ADMIN:
      return "Administrator";
    case Role.STAFF:
      return "Staff";
    case Role.TRAINER:
      return "Trainer";
    default:
      return role;
  }
}

export function toSafeUser(user: User): SafeUser {
  const { passwordHash: _, ...safe } = user;
  return safe;
}
