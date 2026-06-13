import { createHash } from "crypto";
import { academyLessons, getLesson, getTrack, lessonsForTrack } from "@/data/academyCourses";
import type { AcademyLesson } from "@/data/academyCourses";

export function hashLessonContent(lesson: AcademyLesson) {
  return createHash("sha256").update(JSON.stringify(lesson)).digest("hex");
}

export function buildLessonContext(lessonId: string) {
  const lesson = getLesson(lessonId);
  if (!lesson) return null;

  const track = getTrack(lesson.trackId);
  const trackLessons = lessonsForTrack(lesson.trackId);
  const lessonIndex = trackLessons.findIndex((l) => l.id === lessonId);
  const nextLesson = trackLessons[lessonIndex + 1];

  const lines = [
    `Track: ${track?.title ?? "Unknown"}`,
    `Track description: ${track?.description ?? ""}`,
    `Lesson: ${lesson.title}`,
    `Duration: ${lesson.durationMinutes} minutes`,
    `Summary: ${lesson.summary}`,
    `Takeaway: ${lesson.takeaway}`,
    `Worksheet: ${lesson.worksheetTitle}`,
    lesson.isFreePreview ? "This is a free preview lesson." : "This is a paid lesson.",
    lesson.topics?.length ? `Topics:\n${lesson.topics.map((t) => `- ${t}`).join("\n")}` : "",
    lesson.exercise?.length ? `Exercises:\n${lesson.exercise.map((e) => `- ${e}`).join("\n")}` : "",
    lesson.progression?.length ? `Progression:\n${lesson.progression.map((p) => `- ${p}`).join("\n")}` : "",
    lesson.homework ? `Homework note: ${lesson.homework}` : "",
    nextLesson ? `Next lesson in track: ${nextLesson.title}` : "This is the last lesson in the track."
  ].filter(Boolean);

  return {
    lesson,
    track,
    nextLesson,
    contextText: lines.join("\n\n"),
    contentHash: hashLessonContent(lesson),
    contentSource: "static files" as const
  };
}

export function searchLessonsLocal(query: string, limit = 8) {
  const q = query.toLowerCase().trim();
  if (!q) return academyLessons.slice(0, limit);

  return academyLessons
    .filter((lesson) => {
      const track = getTrack(lesson.trackId);
      const blob = [lesson.title, lesson.summary, lesson.takeaway, track?.title, ...(lesson.topics ?? [])].join(" ").toLowerCase();
      return blob.includes(q);
    })
    .slice(0, limit)
    .map((lesson) => ({
      id: lesson.id,
      title: lesson.title,
      trackId: lesson.trackId,
      trackTitle: getTrack(lesson.trackId)?.title ?? ""
    }));
}
