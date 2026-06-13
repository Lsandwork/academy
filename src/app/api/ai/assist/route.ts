import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { buildLessonContext } from "@/lib/ai/context";
import { getAiConfig, type AiActionType } from "@/lib/ai/config";
import { AiUnavailableError, callGemini } from "@/lib/ai/gemini";
import { logAiRequest } from "@/lib/ai/logging";
import { checkRateLimit } from "@/lib/ai/rateLimit";

const ACTION_PROMPTS: Record<string, string> = {
  summarize: "Provide a clear, warm summary of this lesson for a dog owner. Include main takeaway, practice focus, and a safety note if relevant.",
  explain: "Explain this lesson in the simplest possible words for a busy dog owner. Use short paragraphs.",
  homework: "Create a practical homework assignment based on this lesson. Keep it achievable in 10-15 minutes per day.",
  quiz: "Create a short 5-question quiz to check understanding. Include the answers at the end.",
  mistakes: "List the most common mistakes owners make with this lesson and how to avoid them.",
  struggling: "The owner says their dog is struggling with this lesson. Give supportive, LIMA-aligned troubleshooting steps and when to seek professional help."
};

export async function POST(req: NextRequest) {
  const config = getAiConfig();
  if (!config.enabled) {
    return NextResponse.json({ error: "Fitdog AI Assist is currently unavailable." }, { status: 503 });
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Please sign in to use Fitdog AI Assist." }, { status: 401 });
  }

  const rateKey = `ai:${user.id}`;
  const rate = checkRateLimit(rateKey);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Too many requests. Please wait a moment and try again." }, { status: 429 });
  }

  const body = await req.json();
  const lessonId = body.lessonId as string | undefined;
  const pageUrl = body.pageUrl as string | undefined;
  const message = (body.message as string | undefined)?.trim();
  const actionType = (body.actionType as AiActionType) || "question";
  const history = Array.isArray(body.history) ? body.history.slice(-6) : [];

  if (!lessonId) {
    return NextResponse.json({ error: "lessonId is required." }, { status: 400 });
  }

  const ctx = buildLessonContext(lessonId);
  if (!ctx) {
    return NextResponse.json({ error: "Lesson not found." }, { status: 404 });
  }

  const instruction = ACTION_PROMPTS[actionType] ?? "Answer the owner's question using the lesson context.";
  const historyText = history.length
    ? `\n\nRecent conversation:\n${history.map((h: { role: string; content: string }) => `${h.role}: ${h.content}`).join("\n")}`
    : "";

  const userPrompt = [
    `Lesson context:\n${ctx.contextText}`,
    `\nAction: ${actionType}`,
    `\nInstruction: ${instruction}`,
    message ? `\nOwner question: ${message}` : "",
    historyText,
    "\nRespond as Fitdog AI Assist. Be warm, professional, and practical. Do not mention AI providers."
  ].join("");

  const started = Date.now();

  try {
    const result = await callGemini({ userPrompt });
    await logAiRequest({
      userId: user.id,
      lessonId,
      pageUrl,
      actionType,
      promptTokens: result.promptTokens,
      responseTokens: result.responseTokens,
      responseTimeMs: result.responseTimeMs,
      status: "success"
    });

    return NextResponse.json({
      reply: result.text,
      actionType,
      responseTimeMs: result.responseTimeMs
    });
  } catch (error) {
    const msg = error instanceof AiUnavailableError ? error.message : "Fitdog AI Assist could not complete your request.";
    await logAiRequest({
      userId: user.id,
      lessonId,
      pageUrl,
      actionType,
      responseTimeMs: Date.now() - started,
      status: "failure",
      errorMessage: msg
    });
    return NextResponse.json({ error: msg }, { status: error instanceof AiUnavailableError ? 503 : 500 });
  }
}
