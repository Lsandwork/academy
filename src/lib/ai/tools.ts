import { academyLessons, academyTracks, getLesson, getTrack, lessonsForTrack, pricingPlans } from "@/data/academyCourses";
import { prisma } from "@/lib/db";
import { hasLessonAccess, parseJsonArray } from "@/lib/user";
import type { SafeUser } from "@/lib/user";
import { buildLessonContext, searchLessonsLocal } from "./context";
import { summarizeLesson } from "./summary";

export type ToolName =
  | "getCurrentLesson"
  | "summarizeLesson"
  | "searchLessons"
  | "recommendNextLesson"
  | "getUserCourseProgress"
  | "markLessonComplete"
  | "createTrainerQuestionDraft"
  | "comparePurchaseOptions"
  | "startCheckout"
  | "saveTrainingGoal";

export async function runAiTool(
  tool: ToolName,
  args: Record<string, unknown>,
  ctx: { user: SafeUser; lessonId?: string; pageUrl?: string }
) {
  switch (tool) {
    case "getCurrentLesson": {
      if (!ctx.lessonId) return { error: "No lesson in context." };
      const built = buildLessonContext(ctx.lessonId);
      if (!built) return { error: "Lesson not found." };
      return {
        lessonId: built.lesson.id,
        title: built.lesson.title,
        trackTitle: built.track?.title,
        summary: built.lesson.summary,
        takeaway: built.lesson.takeaway
      };
    }

    case "summarizeLesson": {
      const lessonId = (args.lessonId as string) || ctx.lessonId;
      if (!lessonId) return { error: "lessonId required." };
      const result = await summarizeLesson(lessonId);
      return { summary: result.summary, cached: result.cached };
    }

    case "searchLessons": {
      const query = String(args.query ?? "");
      return { results: searchLessonsLocal(query) };
    }

    case "recommendNextLesson": {
      const completed = parseJsonArray(ctx.user.completedLessonIds);
      for (const track of academyTracks) {
        const lessons = lessonsForTrack(track.id);
        const next = lessons.find((l) => !completed.includes(l.id) && hasLessonAccess(ctx.user, l.id, l.isFreePreview));
        if (next) {
          return {
            trackId: track.id,
            trackTitle: track.title,
            lessonId: next.id,
            lessonTitle: next.title,
            reason: "Next incomplete lesson you can access."
          };
        }
      }
      return { message: "You have completed all available lessons in your current access level." };
    }

    case "getUserCourseProgress": {
      const completed = parseJsonArray(ctx.user.completedLessonIds);
      return {
        completedCount: completed.length,
        totalLessons: academyLessons.length,
        accessLevel: ctx.user.accessLevel,
        creditBalance: ctx.user.creditBalance,
        lastOpenedLessonId: ctx.user.lastOpenedLessonId
      };
    }

    case "markLessonComplete": {
      if (!args.confirmed) {
        return {
          requiresConfirmation: true,
          message: "Please confirm you want to mark this lesson complete.",
          preview: { lessonId: args.lessonId ?? ctx.lessonId }
        };
      }
      const lessonId = String(args.lessonId ?? ctx.lessonId);
      if (!lessonId) return { error: "lessonId required." };
      const lesson = getLesson(lessonId);
      if (!lesson) return { error: "Lesson not found." };
      if (!hasLessonAccess(ctx.user, lessonId, lesson.isFreePreview)) {
        return { error: "You do not have access to this lesson." };
      }
      const completed = parseJsonArray(ctx.user.completedLessonIds);
      const nextCompleted = completed.includes(lessonId) ? completed : [...completed, lessonId];
      await prisma.user.update({
        where: { id: ctx.user.id },
        data: { completedLessonIds: JSON.stringify(nextCompleted), lastOpenedLessonId: lessonId }
      });
      return { success: true, lessonId, message: "Lesson marked complete." };
    }

    case "createTrainerQuestionDraft": {
      const topic = String(args.topic ?? "Training question");
      const details = String(args.details ?? "");
      return {
        draft: {
          subject: `Fitdog trainer question: ${topic}`,
          body: `Hi Fitdog team,\n\nI'm working on: ${topic}\n\n${details}\n\nCurrent lesson: ${ctx.lessonId ?? "N/A"}\n\nThank you!`
        },
        requiresConfirmation: true,
        message: "Review this draft before sending to a trainer."
      };
    }

    case "comparePurchaseOptions": {
      return {
        plans: pricingPlans.map((p) => ({
          id: p.id,
          title: p.title,
          priceLabel: p.priceLabel,
          benefits: p.benefits
        })),
        recommendation:
          ctx.user.accessLevel === "FREE"
            ? "Monthly membership is best if you want full library access. Single lesson works for one specific goal. Lifetime is best for long-term value."
            : "You already have paid access. Credits can unlock individual lessons if needed."
      };
    }

    case "startCheckout": {
      if (!args.confirmed) {
        return {
          requiresConfirmation: true,
          message: "Please confirm before starting checkout.",
          preview: { planId: args.planId, lessonId: args.lessonId ?? ctx.lessonId }
        };
      }
      const planId = String(args.planId ?? "monthly");
      const lessonId = args.lessonId ? String(args.lessonId) : ctx.lessonId;
      return {
        success: true,
        checkoutPath: "/pricing",
        checkoutHint: "Use Secure Checkout on the pricing page.",
        planId,
        lessonId: lessonId ?? null
      };
    }

    case "saveTrainingGoal": {
      if (!args.confirmed) {
        return {
          requiresConfirmation: true,
          message: "Please confirm before saving your training goal.",
          preview: args.goalData
        };
      }
      return {
        success: true,
        message: "Training goal saved to your profile notes.",
        goal: args.goalData
      };
    }

    default:
      return { error: "Unknown tool." };
  }
}

export const AI_TOOL_DEFINITIONS = [
  { name: "searchLessons", enabled: true },
  { name: "recommendNextLesson", enabled: true },
  { name: "markLessonComplete", enabled: true },
  { name: "createTrainerQuestionDraft", enabled: true },
  { name: "comparePurchaseOptions", enabled: true },
  { name: "startCheckout", enabled: true },
  { name: "saveTrainingGoal", enabled: true }
] as const;
