"use client";

import type { LessonSummaryJson } from "@/lib/ai/config";

type Section = { title: string; body?: string; items?: string[] };

export function LessonSummaryCard({ summary, sections, onClose }: { summary: LessonSummaryJson; sections: Section[]; onClose?: () => void }) {
  return (
    <div className="rounded-3xl border border-sky/20 bg-gradient-to-br from-white to-sky/5 p-6 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-wide text-sky">Fitdog AI Assist</p>
          <h2 className="mt-1 text-xl font-black text-charcoal">Your Lesson Summary</h2>
        </div>
        {onClose && (
          <button onClick={onClose} className="rounded-full px-3 py-1 text-sm font-bold text-muted hover:bg-gray-100" aria-label="Close summary">
            ✕
          </button>
        )}
      </div>

      {summary.trainerEscalationNeeded && (
        <p className="mt-4 rounded-2xl bg-orange/10 px-4 py-3 text-sm font-semibold text-orange">
          This topic may benefit from personalized support from a qualified trainer or veterinarian.
        </p>
      )}

      <div className="mt-5 space-y-5">
        {sections.map((section) => (
          <div key={section.title}>
            <h3 className="font-black text-charcoal">{section.title}</h3>
            {section.body && <p className="mt-2 text-sm leading-relaxed text-muted">{section.body}</p>}
            {section.items && section.items.length > 0 && (
              <ul className="mt-2 space-y-1">
                {section.items.map((item) => (
                  <li key={item} className="text-sm font-semibold text-charcoal">• {item}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
        {summary.keyTakeaways.length > 0 && (
          <div>
            <h3 className="font-black text-charcoal">Key Takeaways</h3>
            <ul className="mt-2 space-y-1">
              {summary.keyTakeaways.map((item) => (
                <li key={item} className="text-sm font-semibold text-charcoal">• {item}</li>
              ))}
            </ul>
          </div>
        )}
        {summary.recommendedNextLesson && (
          <p className="text-sm font-semibold text-sky">Suggested next step: {summary.recommendedNextLesson}</p>
        )}
      </div>
    </div>
  );
}
