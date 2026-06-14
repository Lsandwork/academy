"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { TrackIcon } from "@/components/TrackIcon";
import { FitdogAiChatWidget } from "@/components/ai/FitdogAiChatWidget";
import { academyTracks, lessonsForTrack } from "@/data/academyCourses";
import { getTrackAssets } from "@/assets/fitdogAcademyAssets";
import { SafeUser, parseJsonArray, trackProgress } from "@/lib/user";

const filters = ["All", "Puppy", "Obedience", "Behavior", "Lifestyle"] as const;

export default function LibraryClient({ user }: { user: SafeUser }) {
  const [filter, setFilter] = useState<(typeof filters)[number]>("All");

  const tracks = useMemo(() => {
    if (filter === "All") return academyTracks;
    const map: Record<string, string[]> = {
      Puppy: ["puppy"],
      Obedience: ["obedience"],
      Behavior: ["calm", "separation", "reactivity"],
      Lifestyle: ["enrichment"]
    };
    return academyTracks.filter((t) => (map[filter] || []).includes(t.category));
  }, [filter]);

  return (
    <div className="min-h-screen bg-soft-bg">
      <AppHeader user={user} />
      <main className="mx-auto max-w-7xl px-6 py-10">
        <h1 className="text-3xl font-black">Course Library</h1>
        <p className="mt-2 text-muted">Browse all Fitdog Academy training tracks and lessons.</p>
        {user.creditBalance > 0 && (
          <p className="mt-3 rounded-2xl bg-orange/10 px-4 py-3 text-sm font-semibold text-orange">
            You have {user.creditBalance} free credit{user.creditBalance === 1 ? "" : "s"}. Each credit unlocks one paid lesson.
          </p>
        )}

        <div className="mt-6 flex flex-wrap gap-2">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-2 text-sm font-bold ${filter === f ? "bg-orange text-white" : "bg-white text-charcoal border border-gray-200"}`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {tracks.map((track) => {
            const lessons = lessonsForTrack(track.id);
            const progress = trackProgress(user, track.lessonIds);
            const { thumbnail } = getTrackAssets(track.id);

            return (
              <Link
                key={track.id}
                href={`/library/${track.id}`}
                className="group overflow-hidden rounded-3xl bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="relative h-40 overflow-hidden">
                  <Image src={thumbnail} alt={`${track.title} course`} fill className="object-cover transition group-hover:scale-105" sizes="400px" />
                  <div className="absolute left-4 top-4 rounded-xl bg-white/95 p-2 shadow">
                    <TrackIcon trackId={track.id} size={28} />
                  </div>
                </div>
                <div className="p-5">
                  <h2 className="text-xl font-black text-charcoal">{track.title}</h2>
                  <p className="mt-1 text-sm text-muted">{track.subtitle}</p>
                  <p className="mt-3 text-xs font-bold text-muted">{lessons.length} lessons · {Math.round(progress * 100)}% complete</p>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-gray-100">
                    <div className="h-full rounded-full bg-orange" style={{ width: `${progress * 100}%` }} />
                  </div>
                  <span className="mt-4 inline-flex text-sm font-bold text-orange">View Curriculum →</span>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
      <FitdogAiChatWidget pageUrl="/library" />
    </div>
  );
}
