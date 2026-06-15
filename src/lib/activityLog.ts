import { prisma } from "./db";

export type ActivityCategory =
  | "auth"
  | "profile"
  | "lesson"
  | "message"
  | "admin"
  | "payment"
  | "trainer"
  | "credits"
  | "assessment";

export type ActivityActor = {
  id: string;
  email: string;
  name?: string | null;
};

export async function logUserActivity(input: {
  userId?: string | null;
  userEmail?: string | null;
  actor?: ActivityActor | null;
  category: ActivityCategory;
  action: string;
  summary: string;
  metadata?: Record<string, unknown>;
  targetType?: string;
  targetId?: string;
}) {
  try {
    await prisma.userActivityLog.create({
      data: {
        userId: input.userId ?? null,
        userEmail: input.userEmail ?? null,
        actorId: input.actor?.id ?? null,
        actorEmail: input.actor?.email ?? null,
        category: input.category,
        action: input.action,
        summary: input.summary,
        metadata: input.metadata ? JSON.stringify(input.metadata) : null,
        targetType: input.targetType ?? null,
        targetId: input.targetId ?? null
      }
    });
  } catch {
    // Avoid breaking primary flows if logging fails
  }
}

export function truncateText(text: string, max = 120) {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return `${trimmed.slice(0, max - 1)}…`;
}
