import { academyTracks, academyLessons } from "@/data/academyCourses";
import type { SafeUser } from "@/lib/user";
import { buildUserAccessContext } from "./access";

export function buildAcademyOverviewContext(user: SafeUser) {
  const tracks = academyTracks
    .map((t) => `- ${t.title} (${t.lessonIds.length} lessons): ${t.subtitle}`)
    .join("\n");

  return [
    "Fitdog Online Academy offers humane, LIMA-aligned dog training courses.",
    `Tracks:\n${tracks}`,
    `Total lessons: ${academyLessons.length}`,
    buildUserAccessContext(user)
  ].join("\n\n");
}
