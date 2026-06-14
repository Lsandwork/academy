"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { fitdogAcademyAssets } from "@/assets/fitdogAcademyAssets";
import type { LessonSummaryJson } from "@/lib/ai/config";
import { LessonSummaryCard } from "./LessonSummaryCard";
import { FitdogAiChatWidget } from "./FitdogAiChatWidget";

const LOADING_MESSAGES = [
  "Reading the lesson…",
  "Building your training summary…",
  "Finding the clearest answer…"
];

export function FitdogAiAssist({
  lessonId,
  lessonTitle,
  trackTitle,
  pageUrl
}: {
  lessonId: string;
  lessonTitle: string;
  trackTitle: string;
  pageUrl: string;
}) {
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [loadingText, setLoadingText] = useState(LOADING_MESSAGES[0]);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState<LessonSummaryJson | null>(null);
  const [summarySections, setSummarySections] = useState<Array<{ title: string; body?: string; items?: string[] }>>([]);
  const [showSummary, setShowSummary] = useState(false);

  useEffect(() => {
    if (!summaryLoading) return;
    let i = 0;
    const timer = setInterval(() => {
      i = (i + 1) % LOADING_MESSAGES.length;
      setLoadingText(LOADING_MESSAGES[i]);
    }, 1800);
    return () => clearInterval(timer);
  }, [summaryLoading]);

  async function summarizeLesson() {
    setSummaryLoading(true);
    setError("");
    setShowSummary(true);
    try {
      const res = await fetch("/api/ai/summarize-lesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId, pageUrl })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not summarize lesson.");
      setSummary(data.summary);
      setSummarySections(data.sections ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Summary unavailable.");
      setShowSummary(false);
    } finally {
      setSummaryLoading(false);
    }
  }

  return (
    <>
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={summarizeLesson}
          disabled={summaryLoading}
          className="inline-flex items-center gap-2 rounded-full bg-sky px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:brightness-105 disabled:opacity-60"
        >
          <Image src={fitdogAcademyAssets.icons.benefits.videoLessons} alt="" width={18} height={18} aria-hidden />
          {summaryLoading ? loadingText : "Summarize This Lesson"}
        </button>
      </div>

      {error && <p className="mt-3 text-sm font-semibold text-red-600">{error}</p>}

      {showSummary && (
        <div className="mt-6">
          {summaryLoading ? (
            <div className="rounded-3xl border border-sky/20 bg-white p-6 text-sm font-semibold text-sky">{loadingText}</div>
          ) : summary ? (
            <LessonSummaryCard summary={summary} sections={summarySections} onClose={() => setShowSummary(false)} />
          ) : null}
        </div>
      )}

      <FitdogAiChatWidget
        pageUrl={pageUrl}
        lessonId={lessonId}
        lessonTitle={lessonTitle}
        trackTitle={trackTitle}
      />
    </>
  );
}
