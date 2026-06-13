"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FitdogAiAssist } from "@/components/ai/FitdogAiAssist";
import { AppHeader } from "@/components/AppHeader";
import { LessonVideoPlayer } from "@/components/LessonVideoPlayer";
import { AcademyLesson, AcademyTrack } from "@/data/academyCourses";
import { fitdogAcademyAssets } from "@/assets/fitdogAcademyAssets";
import { getLessonThumbnail, getLessonVideoUrl } from "@/lib/lessonMedia";
import { SafeUser, parseJsonArray } from "@/lib/user";

export default function LessonClient({
  track,
  lesson,
  user,
  unlocked
}: {
  track: AcademyTrack;
  lesson: AcademyLesson;
  user: SafeUser;
  unlocked: boolean;
}) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(user);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const completed = parseJsonArray(currentUser.completedLessonIds).includes(lesson.id);
  const favorited = parseJsonArray(currentUser.favoriteLessonIds).includes(lesson.id);
  const videoUrl = getLessonVideoUrl(lesson);
  const thumbnail = getLessonThumbnail(lesson);

  async function postProgress(action: "complete" | "favorite" | "open") {
    setBusy(true);
    const res = await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId: lesson.id, action })
    });
    const data = await res.json();
    setBusy(false);
    if (res.ok) setCurrentUser(data.user);
  }

  async function redeemCredit() {
    setBusy(true);
    setMessage("");
    const res = await fetch("/api/credits/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId: lesson.id })
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setMessage(data.error || "Could not redeem credit.");
      return;
    }
    setCurrentUser(data.user);
    setMessage("Credit redeemed. Lesson unlocked.");
    router.refresh();
  }

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-soft-bg">
        <AppHeader user={currentUser} />
        <main className="mx-auto max-w-3xl px-6 py-10">
          <Link href={`/library/${track.id}`} className="text-sm font-bold text-orange">← Back to {track.title}</Link>
          <div className="mt-8 rounded-3xl bg-white p-8 text-center shadow-sm">
            <img src={fitdogAcademyAssets.icons.ui.lock} alt="" width={40} height={40} className="mx-auto" />
            <h1 className="mt-4 text-2xl font-black">{lesson.title}</h1>
            <p className="mt-2 text-muted">This lesson requires access.</p>
            {currentUser.creditBalance > 0 ? (
              <>
                <p className="mt-4 text-sm font-semibold text-charcoal">Use 1 free credit to unlock this course.</p>
                <button disabled={busy} onClick={redeemCredit} className="mt-4 rounded-full bg-orange px-6 py-3 font-bold text-white disabled:opacity-60">
                  Use 1 Free Credit
                </button>
              </>
            ) : (
              <Link href={`/pricing?lesson=${lesson.id}`} className="mt-6 inline-flex rounded-full bg-orange px-6 py-3 font-bold text-white">
                View Pricing
              </Link>
            )}
            {message && <p className="mt-4 text-sm font-semibold text-red-600">{message}</p>}
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-soft-bg">
      <AppHeader user={currentUser} />
      <main className="mx-auto max-w-3xl px-6 py-10">
        <Link href={`/library/${track.id}`} className="text-sm font-bold text-orange">← Back to {track.title}</Link>

        <div className="mt-6 rounded-3xl bg-white p-8 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-wide text-orange">{track.title}</p>
          <h1 className="mt-2 text-3xl font-black">{lesson.title}</h1>
          <p className="mt-2 text-muted">{lesson.durationMinutes} min · {lesson.summary}</p>

          <div className="mt-6 rounded-2xl bg-charcoal/5 p-6">
            {videoUrl ? (
              <LessonVideoPlayer videoUrl={videoUrl} title={lesson.title} />
            ) : (
              <div className="flex items-center gap-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={thumbnail} alt="" className="h-20 w-32 rounded-xl object-cover" />
                <div className="flex items-center gap-3">
                  <img src={fitdogAcademyAssets.icons.ui.play} alt="" width={28} height={28} />
                  <p className="text-muted">Video hosting not configured for this lesson yet. Set FITDOG_VIDEO_CDN to enable hosted videos.</p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-6">
            <h2 className="font-black">Topics</h2>
            <ul className="mt-2 space-y-1">
              {lesson.topics.map((topic) => (
                <li key={topic} className="text-sm font-semibold text-charcoal">• {topic}</li>
              ))}
            </ul>
          </div>

          <div className="mt-6 rounded-2xl bg-soft-bg p-4">
            <h2 className="font-black">Takeaway</h2>
            <p className="mt-2 text-sm text-muted">{lesson.takeaway}</p>
          </div>

          <div className="mt-6 rounded-2xl border border-gray-100 p-4">
            <h2 className="font-black">Worksheet</h2>
            <p className="mt-1 text-sm text-muted">{lesson.worksheetTitle}</p>
          </div>

          <p className="mt-6 text-xs text-muted">
            This course is educational and does not replace veterinary care or individualized behavior support.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              disabled={busy}
              onClick={() => postProgress("complete")}
              className="rounded-full bg-orange px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
            >
              {completed ? "Mark Incomplete" : "Mark Complete"}
            </button>
            <button
              disabled={busy}
              onClick={() => postProgress("favorite")}
              className="rounded-full border border-gray-200 px-5 py-2.5 text-sm font-bold text-charcoal disabled:opacity-60"
            >
              {favorited ? "Remove Favorite" : "Save Favorite"}
            </button>
          </div>

          <FitdogAiAssist
            lessonId={lesson.id}
            lessonTitle={lesson.title}
            trackTitle={track.title}
            pageUrl={`/library/${track.id}/lessons/${lesson.id}`}
          />
        </div>
      </main>
    </div>
  );
}
