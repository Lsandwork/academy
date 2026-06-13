import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasLessonAccess, parseJsonArray, toSafeUser } from "@/lib/user";
import { getLesson } from "@/data/academyCourses";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const { lessonId, action } = await req.json();

    if (!lessonId || !action) {
      return NextResponse.json({ error: "lessonId and action are required." }, { status: 400 });
    }

    const lesson = getLesson(lessonId);
    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found." }, { status: 404 });
    }

    if ((action === "complete" || action === "open" || action === "favorite") && !hasLessonAccess(user, lessonId, lesson.isFreePreview)) {
      return NextResponse.json({ error: "You do not have access to this lesson." }, { status: 403 });
    }

    const completed = parseJsonArray(user.completedLessonIds);
    const favorites = parseJsonArray(user.favoriteLessonIds);

    let nextCompleted = completed;
    let nextFavorites = favorites;
    let lastOpenedLessonId = user.lastOpenedLessonId;

    if (action === "complete") {
      nextCompleted = completed.includes(lessonId)
        ? completed.filter((id) => id !== lessonId)
        : [...completed, lessonId];
      lastOpenedLessonId = lessonId;
    } else if (action === "favorite") {
      nextFavorites = favorites.includes(lessonId)
        ? favorites.filter((id) => id !== lessonId)
        : [...favorites, lessonId];
    } else if (action === "open") {
      lastOpenedLessonId = lessonId;
    } else {
      return NextResponse.json({ error: "Invalid action." }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        completedLessonIds: JSON.stringify(nextCompleted),
        favoriteLessonIds: JSON.stringify(nextFavorites),
        lastOpenedLessonId
      }
    });

    return NextResponse.json({ user: toSafeUser(updated) });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
