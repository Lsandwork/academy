import { prisma } from "@/lib/db";
import { getAiConfig } from "./config";

export async function logAiRequest(input: {
  userId?: string | null;
  sessionId?: string | null;
  lessonId?: string | null;
  pageUrl?: string | null;
  actionType: string;
  promptTokens?: number | null;
  responseTokens?: number | null;
  responseTimeMs?: number | null;
  status: "success" | "failure";
  errorMessage?: string | null;
}) {
  if (!getAiConfig().loggingEnabled) return;

  try {
    await prisma.aiAssistLog.create({
      data: {
        userId: input.userId ?? null,
        sessionId: input.sessionId ?? null,
        lessonId: input.lessonId ?? null,
        pageUrl: input.pageUrl ?? null,
        actionType: input.actionType,
        promptTokens: input.promptTokens ?? null,
        responseTokens: input.responseTokens ?? null,
        responseTimeMs: input.responseTimeMs ?? null,
        status: input.status,
        errorMessage: input.errorMessage ?? null
      }
    });
  } catch {
    // Never break primary AI flows for logging failures
  }
}

export async function recordHealthCheck(input: {
  service: string;
  status: "healthy" | "warning" | "critical" | "not_configured";
  responseTimeMs?: number;
  errorMessage?: string;
  metadata?: Record<string, unknown>;
}) {
  try {
    await prisma.aiHealthCheck.create({
      data: {
        service: input.service,
        status: input.status,
        responseTimeMs: input.responseTimeMs ?? null,
        errorMessage: input.errorMessage ?? null,
        metadata: input.metadata ? JSON.stringify(input.metadata) : null
      }
    });
  } catch {
    // ignore
  }
}
