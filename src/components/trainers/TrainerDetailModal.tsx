"use client";

import type { TrainerProfile } from "@/lib/trainerProfile";
import { TrainerAvatar } from "./TrainerAvatar";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-black uppercase tracking-[0.18em] text-orange">{children}</p>;
}

export function TrainerDetailModal({
  trainer,
  onClose,
  onRequest,
  pending
}: {
  trainer: TrainerProfile;
  onClose: () => void;
  onRequest: () => void;
  pending: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <div className="h-2 bg-gradient-to-r from-charcoal via-orange to-sky" />
        <div className="p-6 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <TrainerAvatar name={trainer.name} photoUrl={trainer.photoUrl} size="lg" />
            <div className="flex-1">
              <p className="text-xs font-black uppercase tracking-[0.18em] text-orange">Fitdog Certified Trainer</p>
              <h2 className="mt-1 text-2xl font-black text-charcoal">{trainer.name}</h2>
              <p className="mt-2 text-sm font-semibold leading-snug text-orange">{trainer.title}</p>
              <p className="mt-3 text-sm leading-relaxed text-muted">{trainer.bio}</p>
            </div>
          </div>

          <section className="mt-8">
            <SectionLabel>About</SectionLabel>
            <p className="mt-3 text-sm leading-relaxed text-charcoal">{trainer.about || trainer.bio}</p>
          </section>

          {trainer.philosophy && (
            <section className="mt-6 rounded-2xl bg-soft-bg p-5">
              <SectionLabel>Training philosophy</SectionLabel>
              <p className="mt-3 text-sm leading-relaxed text-charcoal">{trainer.philosophy}</p>
            </section>
          )}

          {trainer.quote && (
            <blockquote className="mt-6 rounded-2xl bg-orange/5 px-5 py-4 ring-1 ring-orange/15">
              <p className="text-sm italic leading-relaxed text-charcoal">&ldquo;{trainer.quote}&rdquo;</p>
              {trainer.quoteAuthor && (
                <footer className="mt-3 text-xs font-bold uppercase tracking-wide text-orange">{trainer.quoteAuthor}</footer>
              )}
            </blockquote>
          )}

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            {trainer.specialties.length > 0 && (
              <div>
                <SectionLabel>Specialties</SectionLabel>
                <div className="mt-3 flex flex-wrap gap-2">
                  {trainer.specialties.map((item) => (
                    <span key={item} className="rounded-full bg-white px-3 py-1 text-xs font-bold text-charcoal ring-1 ring-gray-200">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {trainer.classes.length > 0 && (
              <div>
                <SectionLabel>Classes & programs</SectionLabel>
                <ul className="mt-3 space-y-2 text-sm text-charcoal">
                  {trainer.classes.map((item) => (
                    <li key={item} className="flex gap-2">
                      <span className="text-orange">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {trainer.qualifications.length > 0 && (
            <section className="mt-8 border-t border-gray-100 pt-6">
              <SectionLabel>Qualifications & certifications</SectionLabel>
              <ul className="mt-4 space-y-2 text-sm font-semibold text-charcoal">
                {trainer.qualifications.map((item) => (
                  <li key={item} className="flex gap-2">
                    <span className="text-success">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={onClose} className="flex-1 rounded-full border border-gray-200 py-3 text-sm font-bold text-charcoal">
              Close
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={onRequest}
              className="flex-1 rounded-full bg-orange py-3 text-sm font-black uppercase tracking-wide text-white disabled:opacity-50"
            >
              {pending ? "Request pending" : `Request ${trainer.name.split(" ")[0]}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
