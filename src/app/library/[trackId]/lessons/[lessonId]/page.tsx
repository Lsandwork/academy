import { notFound, redirect } from "next/navigation";
import { getLesson, getTrack } from "@/data/academyCourses";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { hasLessonAccess } from "@/lib/user";
import LessonClient from "./LessonClient";

export default async function LessonPage({
  params
}: {
  params: Promise<{ trackId: string; lessonId: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { trackId, lessonId } = await params;
  const track = getTrack(trackId);
  const lesson = getLesson(lessonId);
  if (!track || !lesson || lesson.trackId !== track.id) notFound();

  const unlocked = hasLessonAccess(user, lessonId, lesson.isFreePreview);

  if (unlocked) {
    await prisma.user.update({
      where: { id: user.id },
      data: { lastOpenedLessonId: lessonId }
    });
  }

  return (
    <LessonClient
      track={track}
      lesson={lesson}
      user={unlocked ? { ...user, lastOpenedLessonId: lessonId } : user}
      unlocked={unlocked}
    />
  );
}
