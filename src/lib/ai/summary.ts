import { prisma } from "@/lib/db";
import { academyLessons } from "@/data/academyCourses";
import { buildLessonContext } from "./context";
import { getAiConfig, type LessonSummaryJson, EMPTY_SUMMARY } from "./config";
import { callGeminiJson } from "./gemini";

const SUMMARY_PROMPT = `Return ONLY valid JSON matching this schema:
{
  "quickSummary": "string",
  "keyTakeaways": ["string"],
  "simpleExplanation": "string",
  "practiceSteps": ["string"],
  "commonMistakes": ["string"],
  "homework": "string",
  "whenToMoveOn": "string",
  "safetyNote": "string",
  "recommendedNextLesson": "string",
  "trainerEscalationNeeded": boolean
}
Use warm, professional, LIMA-aligned guidance. Keep language simple for dog owners.`;

function normalizeSummary(raw: Partial<LessonSummaryJson>): LessonSummaryJson {
  return {
    quickSummary: raw.quickSummary ?? "",
    keyTakeaways: Array.isArray(raw.keyTakeaways) ? raw.keyTakeaways : [],
    simpleExplanation: raw.simpleExplanation ?? "",
    practiceSteps: Array.isArray(raw.practiceSteps) ? raw.practiceSteps : [],
    commonMistakes: Array.isArray(raw.commonMistakes) ? raw.commonMistakes : [],
    homework: raw.homework ?? "",
    whenToMoveOn: raw.whenToMoveOn ?? "",
    safetyNote: raw.safetyNote ?? "",
    recommendedNextLesson: raw.recommendedNextLesson ?? "",
    trainerEscalationNeeded: Boolean(raw.trainerEscalationNeeded)
  };
}

export async function getCachedSummary(lessonId: string) {
  return prisma.lessonAiSummary.findUnique({ where: { lessonId } });
}

export async function summarizeLesson(lessonId: string, options?: { forceRefresh?: boolean }) {
  const ctx = buildLessonContext(lessonId);
  if (!ctx) throw new Error("Lesson not found.");

  const config = getAiConfig();

  if (config.summaryCacheEnabled && !options?.forceRefresh) {
    const cached = await getCachedSummary(lessonId);
    if (cached && cached.contentHash === ctx.contentHash) {
      return {
        summary: normalizeSummary(JSON.parse(cached.summaryJson)),
        cached: true,
        model: cached.model
      };
    }
  }

  const result = await callGeminiJson<LessonSummaryJson>({
    userPrompt: `${SUMMARY_PROMPT}\n\nLesson context:\n${ctx.contextText}`
  });

  const summary = normalizeSummary(result.json);

  if (config.summaryCacheEnabled) {
    await prisma.lessonAiSummary.upsert({
      where: { lessonId },
      create: {
        lessonId,
        lessonTitle: ctx.lesson.title,
        summaryJson: JSON.stringify(summary),
        model: config.model,
        contentHash: ctx.contentHash,
        lastGeneratedAt: new Date()
      },
      update: {
        lessonTitle: ctx.lesson.title,
        summaryJson: JSON.stringify(summary),
        model: config.model,
        contentHash: ctx.contentHash,
        lastGeneratedAt: new Date()
      }
    });
  }

  return { summary, cached: false, model: config.model, tokens: result };
}

export async function clearSummaryCache() {
  await prisma.lessonAiSummary.deleteMany();
}

export async function rebuildSummaryCache() {
  const results = [];
  for (const lesson of academyLessons) {
    try {
      const r = await summarizeLesson(lesson.id, { forceRefresh: true });
      results.push({ lessonId: lesson.id, ok: true, cached: r.cached });
    } catch (error) {
      results.push({ lessonId: lesson.id, ok: false, error: error instanceof Error ? error.message : "failed" });
    }
  }
  return results;
}

export function summaryToDisplaySections(summary: LessonSummaryJson) {
  return [
    { title: "Quick Summary", body: summary.quickSummary },
    { title: "What This Means for Your Dog", body: summary.simpleExplanation },
    { title: "Practice Steps", items: summary.practiceSteps },
    { title: "Mistakes to Avoid", items: summary.commonMistakes },
    { title: "Homework", body: summary.homework },
    { title: "When to Move On", body: summary.whenToMoveOn },
    { title: "When to Get Help", body: summary.trainerEscalationNeeded ? summary.safetyNote : summary.safetyNote || "Contact a qualified trainer if progress stalls or safety is a concern." }
  ];
}

export { EMPTY_SUMMARY };
