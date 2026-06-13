import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { hasLessonAccess } from "@/lib/user";
import { getLesson } from "@/data/academyCourses";
import { getAiConfig } from "@/lib/ai/config";
import { AiUnavailableError } from "@/lib/ai/gemini";
import { logAiRequest } from "@/lib/ai/logging";
import { checkRateLimit } from "@/lib/ai/rateLimit";
import { summarizeLesson, summaryToDisplaySections } from "@/lib/ai/summary";

export async function POST(req: NextRequest) {
  const config = getAiConfig();
  if (!config.enabled) {
    return NextResponse.json({ error: "Fitdog AI Assist is currently unavailable." }, { status: 503 });
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Please sign in to use Fitdog AI Assist." }, { status: 401 });
  }

  const rate = checkRateLimit(`ai-summary:${user.id}`, 15);
  if (!rate.allowed) {
    return NextResponse.json({ error: "Too many summary requests. Please wait a moment." }, { status: 429 });
  }

  const { lessonId, pageUrl, forceRefresh } = await req.json();
  if (!lessonId) {
    return NextResponse.json({ error: "lessonId is required." }, { status: 400 });
  }

  const lesson = getLesson(lessonId);
  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found." }, { status: 404 });
  }

  if (!hasLessonAccess(user, lessonId, lesson.isFreePreview)) {
    return NextResponse.json({ error: "You do not have access to this lesson." }, { status: 403 });
  }

  const started = Date.now();

  try {
    const result = await summarizeLesson(lessonId, { forceRefresh: Boolean(forceRefresh) });
    await logAiRequest({
      userId: user.id,
      lessonId,
      pageUrl,
      actionType: "summarize",
      responseTimeMs: Date.now() - started,
      status: "success"
    });

    return NextResponse.json({
      summary: result.summary,
      sections: summaryToDisplaySections(result.summary),
      cached: result.cached,
      model: result.model
    });
  } catch (error) {
    const msg = error instanceof AiUnavailableError ? error.message : "Could not build your training summary.";
    await logAiRequest({
      userId: user.id,
      lessonId,
      pageUrl,
      actionType: "summarize",
      responseTimeMs: Date.now() - started,
      status: "failure",
      errorMessage: msg
    });
    return NextResponse.json({ error: msg }, { status: error instanceof AiUnavailableError ? 503 : 500 });
  }
}
