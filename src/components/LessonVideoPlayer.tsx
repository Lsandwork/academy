"use client";

import { isEmbeddableVideo } from "@/lib/lessonMedia";

export function LessonVideoPlayer({ videoUrl, title }: { videoUrl: string; title: string }) {
  if (isEmbeddableVideo(videoUrl)) {
    const embedUrl = videoUrl.includes("youtu.be")
      ? `https://www.youtube.com/embed/${videoUrl.split("/").pop()}`
      : videoUrl.includes("youtube.com/watch")
        ? `https://www.youtube.com/embed/${new URL(videoUrl).searchParams.get("v")}`
        : videoUrl.includes("vimeo.com")
          ? `https://player.vimeo.com/video/${videoUrl.split("/").pop()}`
          : videoUrl;

    return (
      <div className="aspect-video overflow-hidden rounded-2xl bg-black">
        <iframe src={embedUrl} title={title} className="h-full w-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-black">
      <video controls playsInline preload="metadata" className="aspect-video w-full" poster="">
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support video playback.
      </video>
    </div>
  );
}
