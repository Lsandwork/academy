import { AcademyLesson } from "@/data/academyCourses";
import { getTrackAssets } from "@/assets/fitdogAcademyAssets";

/** Resolve lesson thumbnail from track photo when not set on the lesson. */
export function getLessonThumbnail(lesson: AcademyLesson): string {
  if (lesson.thumbnailUrl) return lesson.thumbnailUrl;
  return getTrackAssets(lesson.trackId).thumbnail;
}

/**
 * Interim preview embeds per track until FITDOG_VIDEO_CDN hosts full lesson MP4s.
 * Replace by setting FITDOG_VIDEO_CDN (e.g. Supabase Storage or a CDN bucket).
 */
const TRACK_PREVIEW_VIDEOS: Record<string, string> = {
  "puppy-foundations": "https://www.youtube.com/watch?v=6OyFA6lyfik",
  "everyday-obedience": "https://www.youtube.com/watch?v=DPNzDewU7L4",
  "calm-home-skills": "https://www.youtube.com/watch?v=8HaC8h9PSAI",
  "separation-support": "https://www.youtube.com/watch?v=K5NYtvlodlE",
  "leash-reactivity-reset": "https://www.youtube.com/watch?v=6_2T6615jNk",
  "fitdog-enrichment-at-home": "https://www.youtube.com/watch?v=Qj0iN4qEYqs"
};

export function isEmbeddableVideo(url: string) {
  return /youtube\.com|youtu\.be|vimeo\.com/.test(url);
}

export function isVideoCdnConfigured() {
  return Boolean(process.env.FITDOG_VIDEO_CDN?.trim());
}

export type LessonVideoSource = "lesson" | "cdn" | "preview" | "none";

/**
 * Resolve hosted MP4 from FITDOG_VIDEO_CDN on the server (e.g. lesson page loader).
 * Falls back to track preview embeds when CDN is not configured.
 */
export function getLessonVideoUrl(lesson: AcademyLesson): string | undefined {
  if (lesson.videoUrl) return lesson.videoUrl;

  const base = process.env.FITDOG_VIDEO_CDN?.replace(/\/$/, "");
  if (base) return `${base}/${lesson.id}.mp4`;

  return TRACK_PREVIEW_VIDEOS[lesson.trackId];
}

export function getLessonVideoMeta(lesson: AcademyLesson) {
  if (lesson.videoUrl) {
    return { videoUrl: lesson.videoUrl, source: "lesson" as const, isPreview: false };
  }

  const base = process.env.FITDOG_VIDEO_CDN?.replace(/\/$/, "");
  if (base) {
    return {
      videoUrl: `${base}/${lesson.id}.mp4`,
      source: "cdn" as const,
      isPreview: false
    };
  }

  const preview = TRACK_PREVIEW_VIDEOS[lesson.trackId];
  if (preview) {
    return { videoUrl: preview, source: "preview" as const, isPreview: true };
  }

  return { videoUrl: undefined, source: "none" as const, isPreview: false };
}
