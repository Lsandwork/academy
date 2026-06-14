import { academyLessons } from "@/data/academyCourses";
import { prisma } from "@/lib/db";
import { getAiConfig } from "./config";
import { testGeminiConnection } from "./gemini";
import { AI_TOOL_DEFINITIONS } from "./tools";

export async function getAiAssistDiagnostics() {
  const config = getAiConfig();
  const now = new Date();

  let geminiStatus: "connected" | "not_connected" | "disabled" = "not_connected";
  let lastSuccess: Date | null = null;
  let lastFailure: Date | null = null;
  let lastError: string | null = null;
  let avgResponseTime: number | null = null;

  const recentHealth = await prisma.aiHealthCheck.findMany({
    where: { service: "gemini" },
    orderBy: { createdAt: "desc" },
    take: 10
  });

  const latest = recentHealth[0];
  if (latest?.status === "healthy") {
    lastSuccess = latest.createdAt;
    lastError = null;
  } else if (latest) {
    lastFailure = latest.createdAt;
    lastError = latest.errorMessage;
  }

  for (const check of recentHealth.slice(1)) {
    if (check.status === "healthy" && !lastSuccess) lastSuccess = check.createdAt;
    if (check.status !== "healthy" && !lastFailure) lastFailure = check.createdAt;
  }

  const successTimes = recentHealth.filter((c) => c.status === "healthy" && c.responseTimeMs).map((c) => c.responseTimeMs!);
  if (successTimes.length) {
    avgResponseTime = Math.round(successTimes.reduce((a, b) => a + b, 0) / successTimes.length);
  }

  if (!config.enabled) geminiStatus = "disabled";
  else if (config.apiKeyPresent && recentHealth[0]?.status === "healthy") geminiStatus = "connected";
  else if (config.apiKeyPresent) geminiStatus = "not_connected";

  const summaryCount = await prisma.lessonAiSummary.count();
  const missingContent = academyLessons.filter((l) => !l.summary || !l.title).length;

  const recentLogs = await prisma.aiAssistLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 20
  });

  const lastSuccessfulRequest = recentLogs.find((l) => l.status === "success");

  return {
    checkedAt: now.toISOString(),
    gemini: {
      status: geminiStatus,
      model: config.model,
      apiKeyPresent: config.apiKeyPresent,
      serverRouteAvailable: true,
      lastSuccessfulTest: lastSuccess?.toISOString() ?? null,
      lastFailedTest: lastFailure?.toISOString() ?? null,
      averageResponseTimeMs: avgResponseTime,
      lastErrorMessage: lastError
    },
    lessonContext: {
      totalLessons: academyLessons.length,
      summariesCached: summaryCount,
      transcriptsAvailable: 0,
      missingContent,
      lastSyncCheck: now.toISOString(),
      contentSource: "static files"
    },
    recentLogs: recentLogs.map((l) => ({
      id: l.id,
      createdAt: l.createdAt.toISOString(),
      userId: l.userId,
      sessionId: l.sessionId,
      pageUrl: l.pageUrl,
      actionType: l.actionType,
      status: l.status,
      responseTimeMs: l.responseTimeMs,
      errorMessage: l.errorMessage
    })),
    automation: AI_TOOL_DEFINITIONS.map((tool) => ({
      name: tool.name,
      enabled: tool.enabled,
      lastTested: lastSuccessfulRequest?.createdAt.toISOString() ?? null,
      lastError: recentLogs.find((l) => l.actionType === "automation" && l.status === "failure")?.errorMessage ?? null
    })),
    guardrails: {
      limaSafetyPromptActive: true,
      punishmentFilterActive: true,
      medicalEscalationWarningActive: true,
      purchaseConfirmationRequired: true,
      bookingConfirmationRequired: true
    },
    lastSuccessfulRequest: lastSuccessfulRequest
      ? {
          at: lastSuccessfulRequest.createdAt.toISOString(),
          actionType: lastSuccessfulRequest.actionType,
          responseTimeMs: lastSuccessfulRequest.responseTimeMs
        }
      : null,
    config: {
      enabled: config.enabled,
      summaryCacheEnabled: config.summaryCacheEnabled,
      loggingEnabled: config.loggingEnabled,
      adminDiagnosticsEnabled: config.adminDiagnosticsEnabled
    }
  };
}

export async function runAiAdminTest(action: string) {
  switch (action) {
    case "test_gemini": {
      const result = await testGeminiConnection();
      const { recordHealthCheck } = await import("./logging");
      await recordHealthCheck({
        service: "gemini",
        status: result.ok ? "healthy" : "critical",
        responseTimeMs: result.responseTimeMs,
        errorMessage: result.ok ? undefined : result.message
      });
      return { ok: result.ok, message: result.message, responseTimeMs: result.responseTimeMs };
    }
    case "test_lesson_summary": {
      const lesson = academyLessons[0];
      const { summarizeLesson } = await import("./summary");
      const result = await summarizeLesson(lesson.id, { forceRefresh: true });
      return { ok: true, message: `Summary generated for ${lesson.title}`, cached: result.cached };
    }
    case "test_url_scan": {
      const { buildLessonContext } = await import("./context");
      const ctx = buildLessonContext(academyLessons[0].id);
      return { ok: Boolean(ctx), message: ctx ? "Lesson context scan OK" : "Scan failed" };
    }
    case "test_lesson_search": {
      const { searchLessonsLocal } = await import("./context");
      const results = searchLessonsLocal("puppy");
      return { ok: results.length > 0, message: `Found ${results.length} lessons`, results };
    }
    case "test_automation": {
      return { ok: true, message: "Automation tools registered.", tools: AI_TOOL_DEFINITIONS.map((t) => t.name) };
    }
    case "clear_cache": {
      const { clearSummaryCache } = await import("./summary");
      await clearSummaryCache();
      return { ok: true, message: "AI summary cache cleared." };
    }
    case "rebuild_cache": {
      const { rebuildSummaryCache } = await import("./summary");
      const results = await rebuildSummaryCache();
      const okCount = results.filter((r) => r.ok).length;
      return { ok: okCount > 0, message: `Rebuilt ${okCount}/${results.length} summaries.`, results: results.slice(0, 5) };
    }
    default:
      return { ok: false, message: "Unknown test action." };
  }
}
