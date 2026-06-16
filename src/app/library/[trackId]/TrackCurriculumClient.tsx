"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { TrackIcon } from "@/components/TrackIcon";
import { FitdogAiChatWidget } from "@/components/ai/FitdogAiChatWidget";
import { AcademyTrack, getLesson, lessonsForTrack } from "@/data/academyCourses";
import { CGC_TRACK_ID } from "@/data/akcCgcPrep";
import { getTrackAssets } from "@/assets/fitdogAcademyAssets";
import { SafeUser, hasCgcCourseAccess, hasLessonAccess, parseJsonArray, trackProgress } from "@/lib/user";

export default function TrackCurriculumClient({ track, user }: { track: AcademyTrack; user: SafeUser }) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(user);
  const [busyLesson, setBusyLesson] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const lessons = lessonsForTrack(track.id);
  const completed = parseJsonArray(currentUser.completedLessonIds);
  const progress = trackProgress(currentUser, track.lessonIds);
  const { thumbnail } = getTrackAssets(track.id);
  const isCgcTrack = track.id === CGC_TRACK_ID;
  const cgcOwned = hasCgcCourseAccess(currentUser);

  const nextLesson = useMemo(() => {
    const last = currentUser.lastOpenedLessonId ? getLesson(currentUser.lastOpenedLessonId) : undefined;
    const pool = last?.trackId === track.id ? lessons : lessons;
    return (
      pool.find((l) => !completed.includes(l.id) && hasLessonAccess(currentUser, l.id, l.isFreePreview)) ??
      lessons.find((l) => hasLessonAccess(currentUser, l.id, l.isFreePreview))
    );
  }, [currentUser, lessons, completed, track.id]);

  async function redeemCredit(lessonId: string) {
    setBusyLesson(lessonId);
    setMessage("");
    const res = await fetch("/api/credits/redeem", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId })
    });
    const data = await res.json();
    setBusyLesson(null);
    if (!res.ok) {
      setMessage(data.error || "Could not redeem credit.");
      return;
    }
    setCurrentUser(data.user);
    setMessage("Credit redeemed. Lesson unlocked.");
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-soft-bg">
      <AppHeader user={currentUser} />
      <main className="mx-auto max-w-4xl px-6 py-10">
        <Link href="/library" className="text-sm font-bold text-orange">← Back to Library</Link>

        <div className="mt-6 overflow-hidden rounded-3xl bg-white shadow-sm">
          <div className="relative h-48 w-full">
            <Image src={thumbnail} alt={`${track.title} course`} fill className="object-cover object-center" priority sizes="800px" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <div className="mb-2"><TrackIcon trackId={track.id} size={36} /></div>
              <h1 className="text-3xl font-black">{track.title}</h1>
              <p className="text-white/80">{track.subtitle}</p>
            </div>
          </div>
          <div className="p-6">
            <p className="text-muted">{track.description}</p>
            <div className="mt-4 flex flex-wrap gap-3 text-sm font-bold text-muted">
              <span>{lessons.length} lessons</span>
              <span>{Math.round(progress * 100)}% complete</span>
              {currentUser.creditBalance > 0 && <span className="text-orange">{currentUser.creditBalance} free credit(s)</span>}
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100">
              <div className="h-full rounded-full bg-orange" style={{ width: `${progress * 100}%` }} />
            </div>
            {nextLesson && (
              <Link
                href={`/library/${track.id}/lessons/${nextLesson.id}`}
                className="mt-6 inline-flex rounded-full bg-orange px-6 py-3 font-bold text-white hover:bg-orange-dark"
              >
                {completed.length ? "Continue Course" : "Start Course"}
              </Link>
            )}
          </div>
        </div>

        {message && <p className="mt-4 rounded-xl bg-orange/10 px-4 py-3 text-sm font-semibold text-orange">{message}</p>}

        {isCgcTrack && !cgcOwned && (
          <div className="mt-6 rounded-3xl border border-orange/20 bg-orange/5 p-6">
            <h2 className="text-lg font-black text-charcoal">AKC CGC Prep Program — paid course</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              All 10 CGC skill modules, premium worksheets with official criteria and test-day checklists, and trainer homework unlock when you enroll. Monthly membership does not include this certification track.
            </p>
            <Link href="/pricing/plans/akc-cgc-prep" className="mt-4 inline-flex rounded-full bg-orange px-6 py-3 text-sm font-bold text-white hover:bg-orange-dark">
              Enroll — from $249
            </Link>
          </div>
        )}

        <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black">Curriculum</h2>
          <div className="mt-4 divide-y divide-gray-100">
            {lessons.map((lesson, index) => {
              const unlocked = hasLessonAccess(currentUser, lesson.id, lesson.isFreePreview);
              const done = completed.includes(lesson.id);
              return (
                <div key={lesson.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-muted">Lesson {index + 1}</p>
                    <p className="font-bold text-charcoal">{lesson.title}</p>
                    <p className="text-sm text-muted">{lesson.durationMinutes} min {lesson.isFreePreview ? "· Free preview" : ""}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {unlocked ? (
                      <Link href={`/library/${track.id}/lessons/${lesson.id}`} className="rounded-full bg-orange px-4 py-2 text-sm font-bold text-white">
                        {done ? "Review" : "Open Lesson"}
                      </Link>
                    ) : isCgcTrack ? (
                      <Link href="/pricing/plans/akc-cgc-prep" className="rounded-full bg-orange/10 px-4 py-2 text-sm font-bold text-orange">
                        Enroll to unlock
                      </Link>
                    ) : currentUser.creditBalance > 0 ? (
                      <button
                        disabled={busyLesson === lesson.id}
                        onClick={() => redeemCredit(lesson.id)}
                        className="rounded-full border border-orange px-4 py-2 text-sm font-bold text-orange disabled:opacity-60"
                      >
                        Use 1 Free Credit
                      </button>
                    ) : (
                      <Link href={`/pricing?lesson=${lesson.id}`} className="rounded-full bg-orange/10 px-4 py-2 text-sm font-bold text-orange">
                        Unlock
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
      <FitdogAiChatWidget pageUrl={`/library/${track.id}`} />
    </div>
  );
}
