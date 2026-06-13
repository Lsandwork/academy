import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getAiConfig } from "@/lib/ai/config";
import { logAiRequest } from "@/lib/ai/logging";
import { checkRateLimit } from "@/lib/ai/rateLimit";
import { runAiTool, type ToolName } from "@/lib/ai/tools";

const ALLOWED_TOOLS: ToolName[] = [
  "getCurrentLesson",
  "summarizeLesson",
  "searchLessons",
  "recommendNextLesson",
  "getUserCourseProgress",
  "markLessonComplete",
  "createTrainerQuestionDraft",
  "comparePurchaseOptions",
  "startCheckout",
  "saveTrainingGoal"
];

export async function POST(req: NextRequest) {
  const config = getAiConfig();
  if (!config.enabled) {
    return NextResponse.json({ error: "Fitdog AI Assist is currently unavailable." }, { status: 503 });
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Please sign in to continue." }, { status: 401 });
  }

  const rate = checkRateLimit(`ai-actions:${user.id}`, 40);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Too many requests. Please wait a moment." }, { status: 429 });
  }

  const body = await req.json();
  const tool = body.tool as ToolName;
  const args = (body.args ?? {}) as Record<string, unknown>;
  const lessonId = body.lessonId as string | undefined;
  const pageUrl = body.pageUrl as string | undefined;

  if (!ALLOWED_TOOLS.includes(tool)) {
    return NextResponse.json({ error: "This action is not available." }, { status: 400 });
  }

  const started = Date.now();

  try {
    const result = await runAiTool(tool, args, { user, lessonId, pageUrl });
    await logAiRequest({
      userId: user.id,
      lessonId,
      pageUrl,
      actionType: "automation",
      responseTimeMs: Date.now() - started,
      status: "success"
    });
    return NextResponse.json({ tool, result });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Action failed.";
    await logAiRequest({
      userId: user.id,
      lessonId,
      pageUrl,
      actionType: "automation",
      responseTimeMs: Date.now() - started,
      status: "failure",
      errorMessage: msg
    });
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
