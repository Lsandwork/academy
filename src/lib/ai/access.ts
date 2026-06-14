import { academyLessons, getLesson, getTrack, pricingPlans } from "@/data/academyCourses";
import { buildLessonContext } from "./context";
import type { SafeUser } from "@/lib/user";
import { hasFullPaidAccess, hasLessonAccess, parseJsonArray } from "@/lib/user";

export type AiChatAction = {
  type: "link";
  label: string;
  href: string;
  variant?: "primary" | "secondary";
};

const CONTENT_ACTIONS = new Set(["summarize", "explain", "homework", "quiz", "mistakes", "struggling"]);

export function isContentRevealingAction(actionType: string) {
  return CONTENT_ACTIONS.has(actionType);
}

export function pricingActions(lessonId?: string): AiChatAction[] {
  const lessonHref = lessonId ? `/pricing?lesson=${lessonId}&plan=single_lesson` : "/pricing?plan=single_lesson";
  return [
    { type: "link", label: "Monthly membership", href: "/pricing?plan=monthly", variant: "primary" },
    { type: "link", label: "Lifetime access", href: "/pricing?plan=lifetime", variant: "secondary" },
    { type: "link", label: "Buy this lesson", href: lessonHref, variant: "secondary" }
  ];
}

export function buildUserAccessContext(user: SafeUser) {
  const purchased = parseJsonArray(user.purchasedLessonIds);
  const completed = parseJsonArray(user.completedLessonIds);
  const fullAccess = hasFullPaidAccess(user);

  const accessibleCount = academyLessons.filter((l) => hasLessonAccess(user, l.id, l.isFreePreview)).length;

  const planLines = pricingPlans.map((p) => `- ${p.title} (${p.priceLabel}): ${p.subtitle}`).join("\n");

  return [
    `Access level: ${user.accessLevel}`,
    fullAccess ? "User has full library access (monthly or lifetime)." : "User does NOT have full library access.",
    purchased.length ? `Individually purchased lessons: ${purchased.join(", ")}` : "No individually purchased lessons.",
    `Free credits available: ${user.creditBalance}`,
    `Lessons user can access: ${accessibleCount} of ${academyLessons.length}`,
    `Completed lessons: ${completed.length}`,
    `\nPurchase options (only real way to unlock paid content):\n${planLines}`,
    "Pricing page: /pricing",
    "Single lesson checkout pattern: /pricing?lesson={lessonId}&plan=single_lesson"
  ]
    .filter(Boolean)
    .join("\n");
}

export function lessonAccessLabel(user: SafeUser, lessonId: string, isFreePreview: boolean) {
  if (hasLessonAccess(user, lessonId, isFreePreview)) return "ACCESSIBLE";
  return "LOCKED";
}

export function buildLockedLessonContext(user: SafeUser, lessonId: string) {
  const lesson = getLesson(lessonId);
  if (!lesson) return null;

  const track = getTrack(lesson.trackId);
  const unlocked = hasLessonAccess(user, lessonId, lesson.isFreePreview);

  if (unlocked) {
    const ctx = buildLessonContext(lessonId);
    if (!ctx) return null;
    return {
      unlocked: true as const,
      contextText: ctx.contextText,
      lesson,
      track
    };
  }

  const creditHint =
    user.creditBalance > 0
      ? `User has ${user.creditBalance} free credit(s) and can redeem one on the lesson page to unlock this lesson.`
      : "User has no free credits.";

  const contextText = [
    `Track: ${track?.title ?? "Unknown"}`,
    `Lesson: ${lesson.title}`,
    `Public description only: ${lesson.summary}`,
    `Duration: ${lesson.durationMinutes} minutes`,
    "ACCESS STATUS: LOCKED — user cannot view video, worksheets, exercises, homework, or the full lesson plan.",
    creditHint,
    "You must NOT provide exercises, step-by-step training plans, homework assignments, worksheet details, or progression steps for this lesson.",
    "You may describe what the lesson generally covers using only the public description above.",
    "If the user wants the full lesson, direct them to subscribe or purchase — never imply they already have access."
  ].join("\n\n");

  return {
    unlocked: false as const,
    contextText,
    lesson,
    track,
    actions: pricingActions(lessonId)
  };
}

export function buildAccessRulesPrompt(user: SafeUser) {
  return [
    "STRICT ACCESS RULES (never violate):",
    "- You cannot grant, unlock, or simulate paid access. Only Stripe checkout or free credits unlock lessons.",
    "- If the user lacks access to a lesson, do NOT reveal exercises, homework, worksheets, quizzes, or detailed lesson plans.",
    "- If the user HAS access, explain the full lesson plan using the provided context.",
    "- When suggesting enrollment, subscription, or purchase, you MUST tell them to use the checkout buttons shown below your message.",
    "- Never say a lesson is unlocked or available unless ACCESS STATUS is ACCESSIBLE.",
    "- Free preview lessons are accessible to all signed-in users.",
    buildUserAccessContext(user)
  ].join("\n\n");
}

export function paywallReply(lessonTitle: string, lessonId: string, user: SafeUser) {
  const creditLine =
    user.creditBalance > 0
      ? ` You can also use 1 of your ${user.creditBalance} free credit(s) on the lesson page.`
      : "";

  return {
    reply: `"${lessonTitle}" is part of our paid library.${creditLine} To get the full lesson plan, video, and worksheets, choose a plan below.`,
    actions: pricingActions(lessonId)
  };
}

export function enrichReplyWithCheckoutActions(reply: string, user: SafeUser, lessonId?: string): AiChatAction[] {
  if (hasFullPaidAccess(user)) return [];

  const lower = reply.toLowerCase();
  const mentionsPurchase =
    /\b(subscribe|subscription|membership|enroll|sign up|purchase|unlock|pricing|checkout|pay for|buy (the |this )?lesson|monthly|lifetime|single lesson)\b/.test(
      lower
    );

  if (!mentionsPurchase) return [];

  return pricingActions(lessonId);
}
