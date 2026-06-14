import { academyTracks, academyLessons } from "@/data/academyCourses";
import type { SafeUser } from "@/lib/user";
import { parseJsonArray } from "@/lib/user";

export function buildAcademyOverviewContext(user?: Pick<SafeUser, "accessLevel" | "completedLessonIds" | "creditBalance">) {
  const tracks = academyTracks
    .map((t) => `- ${t.title} (${t.lessonIds.length} lessons): ${t.subtitle}`)
    .join("\n");

  const completed = user ? parseJsonArray(user.completedLessonIds).length : 0;

  return [
    "Fitdog Online Academy offers humane, LIMA-aligned dog training courses.",
    `Tracks:\n${tracks}`,
    `Total lessons: ${academyLessons.length}`,
    user
      ? `Owner access: ${user.accessLevel}. Completed lessons: ${completed}. Free credits: ${user.creditBalance}.`
      : ""
  ]
    .filter(Boolean)
    .join("\n\n");
}
