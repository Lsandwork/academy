import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getLesson } from "@/data/academyCourses";
import { logError } from "@/lib/errors";
import { hasLessonAccess, parseJsonArray, toSafeUser } from "@/lib/user";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const { lessonId } = await req.json();

    if (!lessonId) {
      return NextResponse.json({ error: "lessonId is required." }, { status: 400 });
    }

    const lesson = getLesson(lessonId);
    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found." }, { status: 404 });
    }

    if (hasLessonAccess(user, lessonId, lesson.isFreePreview)) {
      return NextResponse.json({ error: "You already have access to this lesson." }, { status: 409 });
    }

    if (user.creditBalance < 1) {
      return NextResponse.json({ error: "You do not have any free credits." }, { status: 400 });
    }

    const purchased = parseJsonArray(user.purchasedLessonIds);
    if (purchased.includes(lessonId)) {
      return NextResponse.json({ error: "This lesson is already unlocked." }, { status: 409 });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const current = await tx.user.findUniqueOrThrow({ where: { id: user.id } });
      if (current.creditBalance < 1) throw new Error("INSUFFICIENT_CREDITS");

      await tx.creditTransaction.create({
        data: {
          userId: user.id,
          amount: -1,
          reason: "Redeemed for lesson unlock",
          lessonId
        }
      });

      return tx.user.update({
        where: { id: user.id },
        data: {
          creditBalance: { decrement: 1 },
          accessLevel: current.accessLevel === "FREE" ? "SINGLE_LESSON" : current.accessLevel,
          purchasedLessonIds: JSON.stringify([...parseJsonArray(current.purchasedLessonIds), lessonId])
        }
      });
    });

    return NextResponse.json({ user: toSafeUser(updated) });
  } catch (error) {
    if (error instanceof Error && error.message === "INSUFFICIENT_CREDITS") {
      return NextResponse.json({ error: "You do not have any free credits." }, { status: 400 });
    }
    await logError({ severity: "warning", area: "Credits", message: String(error) });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
