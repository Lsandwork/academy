import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { buildAcademyOverviewContext } from "@/lib/ai/academyContext";
import { buildLessonContext, searchLessonsLocal } from "@/lib/ai/context";
import { getAiConfig } from "@/lib/ai/config";
import { AiUnavailableError, callGemini } from "@/lib/ai/gemini";
import { logAiRequest } from "@/lib/ai/logging";
import { checkRateLimit } from "@/lib/ai/rateLimit";

export async function POST(req: NextRequest) {
  const config = getAiConfig();
  if (!config.enabled) {
    return NextResponse.json({ error: "Fitdog AI Assist is currently unavailable." }, { status: 503 });
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Please sign in to chat with Fitdog AI." }, { status: 401 });
  }

  const rate = checkRateLimit(`ai-chat:${user.id}`);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Too many messages. Please wait a moment and try again." }, { status: 429 });
  }

  const body = await req.json();
  const message = (body.message as string | undefined)?.trim();
  const pageUrl = (body.pageUrl as string | undefined) ?? undefined;
  const lessonId = body.lessonId as string | undefined;
  const history = Array.isArray(body.history) ? body.history.slice(-8) : [];

  if (!message) {
    return NextResponse.json({ error: "Message is required." }, { status: 400 });
  }

  const lessonCtx = lessonId ? buildLessonContext(lessonId) : null;
  const related = searchLessonsLocal(message, 5);

  const historyText = history.length
    ? `\n\nRecent chat:\n${history.map((h: { role: string; content: string }) => `${h.role}: ${h.content}`).join("\n")}`
    : "";

  const userPrompt = [
    lessonCtx
      ? `Current lesson context:\n${lessonCtx.contextText}`
      : `Academy overview:\n${buildAcademyOverviewContext(user)}`,
    related.length ? `\nPossibly relevant lessons:\n${related.map((l) => `- ${l.title} (${l.trackTitle})`).join("\n")}` : "",
    `\nOwner message: ${message}`,
    historyText,
    "\nReply as Fitdog AI Assist in a friendly messenger tone. Keep answers practical and concise unless they ask for detail. Use LIMA-aligned guidance only. Do not mention AI providers."
  ].join("");

  const started = Date.now();

  try {
    const result = await callGemini({ userPrompt, temperature: 0.55 });
    await logAiRequest({
      userId: user.id,
      lessonId: lessonId ?? null,
      pageUrl,
      actionType: "question",
      promptTokens: result.promptTokens,
      responseTokens: result.responseTokens,
      responseTimeMs: result.responseTimeMs,
      status: "success"
    });

    return NextResponse.json({
      reply: result.text,
      responseTimeMs: result.responseTimeMs
    });
  } catch (error) {
    const msg = error instanceof AiUnavailableError ? error.message : "Fitdog AI could not reply right now.";
    await logAiRequest({
      userId: user.id,
      lessonId: lessonId ?? null,
      pageUrl,
      actionType: "question",
      responseTimeMs: Date.now() - started,
      status: "failure",
      errorMessage: msg
    });
    return NextResponse.json({ error: msg }, { status: error instanceof AiUnavailableError ? 503 : 500 });
  }
}
