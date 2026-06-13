import { AcademyLesson } from "@/data/academyCourses";
import { getTrackAssets } from "@/assets/fitdogAcademyAssets";

/** Resolve lesson thumbnail from track photo when not set on the lesson. */
export function getLessonThumbnail(lesson: AcademyLesson): string {
  if (lesson.thumbnailUrl) return lesson.thumbnailUrl;
  return getTrackAssets(lesson.trackId).thumbnail;
}

/**
 * Video URLs come from FITDOG_VIDEO_CDN when configured (e.g. https://cdn.example.com/lessons).
 * Without env, lessons have no hosted video — diagnostics should report not configured.
 */
export function getLessonVideoUrl(lesson: AcademyLesson): string | undefined {
  if (lesson.videoUrl) return lesson.videoUrl;
  const base = process.env.FITDOG_VIDEO_CDN?.replace(/\/$/, "");
  if (!base) return undefined;
  return `${base}/${lesson.id}.mp4`;
}

export function isEmbeddableVideo(url: string) {
  return /youtube\.com|youtu\.be|vimeo\.com/.test(url);
}
