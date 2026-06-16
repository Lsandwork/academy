"use client";

import { useState } from "react";
import { fitdogAcademyAssets } from "@/assets/fitdogAcademyAssets";
import Image from "next/image";

export function LessonWorksheetDownload({
  lessonId,
  lessonTitle,
  worksheetTitle,
  unlocked
}: {
  lessonId: string;
  lessonTitle: string;
  worksheetTitle: string;
  unlocked: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function download() {
    if (!unlocked || busy) return;
    setBusy(true);
    setError("");

    try {
      const res = await fetch(`/api/lessons/${lessonId}/worksheet`, { credentials: "same-origin" });
      const contentType = res.headers.get("Content-Type") || "";

      if (!res.ok) {
        if (contentType.includes("application/json")) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Download failed.");
        }
        throw new Error(`Download failed (${res.status}). Please try again or contact support.`);
      }

      if (!contentType.includes("application/pdf")) {
        throw new Error("Worksheet download returned an unexpected response. Please try again.");
      }

      const blob = await res.blob();
      if (!blob.size) {
        throw new Error("Worksheet file was empty. Please try again.");
      }
      const disposition = res.headers.get("Content-Disposition") || "";
      const match = disposition.match(/filename="([^"]+)"/);
      const filename = match?.[1] || `fitdog-${lessonId}-worksheet.pdf`;

      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not download worksheet.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-6 overflow-hidden rounded-3xl border border-sky/20 bg-gradient-to-br from-white via-white to-sky/5 p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <Image src={fitdogAcademyAssets.logos.dogHead64} alt="Fitdog" width={36} height={36} />
            <div>
              <p className="text-xs font-black uppercase tracking-wide text-sky">Fitdog Training Academy</p>
              <p className="text-[10px] font-semibold text-muted">Branded lesson worksheet</p>
            </div>
          </div>
          <h2 className="mt-3 text-xl font-black text-charcoal">{worksheetTitle}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Download your guided worksheet to practice <strong className="font-semibold text-charcoal">{lessonTitle}</strong> at
            home, track progress, and help set your dog up for success.
          </p>
        </div>
        <Image src={fitdogAcademyAssets.logos.academyLockupLight} alt="" width={120} height={28} className="hidden shrink-0 opacity-90 sm:block" />
      </div>

      <button
        type="button"
        disabled={!unlocked || busy}
        onClick={download}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full bg-sky px-6 py-3.5 text-sm font-bold text-white shadow-sm hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
        </svg>
        {busy ? "Preparing PDF…" : "Download Worksheet"}
      </button>

      {!unlocked && (
        <p className="mt-3 text-xs font-semibold text-muted">Unlock this lesson to download the worksheet.</p>
      )}
      {error && <p className="mt-3 text-sm font-semibold text-red-600">{error}</p>}
    </section>
  );
}
