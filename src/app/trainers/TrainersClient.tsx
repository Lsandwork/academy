"use client";

import Link from "next/link";
import { useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { FitdogAiChatWidget } from "@/components/ai/FitdogAiChatWidget";
import type { AssessmentReport } from "@/lib/assessmentReport";
import type { TrainerProfile } from "@/lib/trainerProfile";
import { trainerInitials } from "@/lib/trainerProfile";
import { SafeUser } from "@/lib/user";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-black uppercase tracking-[0.18em] text-orange">{children}</p>
  );
}

function TrainerProfileCard({
  trainer,
  pending,
  onRequest
}: {
  trainer: TrainerProfile;
  pending: boolean;
  onRequest: () => void;
}) {
  return (
    <article className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-gray-100">
      <div className="h-2 bg-gradient-to-r from-charcoal via-orange to-sky" />

      <div className="grid gap-0 lg:grid-cols-[260px_minmax(0,1fr)]">
        <aside className="border-b border-gray-100 bg-soft-bg/70 p-6 lg:border-b-0 lg:border-r">
          <div className="mx-auto flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-white shadow-md ring-4 ring-orange/15">
            {trainer.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={trainer.photoUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="text-3xl font-black text-orange">{trainerInitials(trainer.name)}</span>
            )}
          </div>

          <h2 className="mt-5 text-center text-xl font-black uppercase tracking-wide text-charcoal">{trainer.name}</h2>
          <p className="mt-2 text-center text-sm font-semibold leading-snug text-orange">{trainer.title}</p>
          <p className="mt-4 text-center text-sm leading-relaxed text-muted">{trainer.bio}</p>

          {trainer.classes.length > 0 && (
            <div className="mt-6">
              <SectionLabel>Classes</SectionLabel>
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

          {trainer.specialties.length > 0 && (
            <div className="mt-6">
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

          <button
            type="button"
            disabled={pending}
            onClick={onRequest}
            className="mt-8 w-full rounded-full bg-orange py-3.5 text-sm font-black uppercase tracking-wide text-white hover:bg-orange/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? "Request Pending" : `Request ${trainer.name}`}
          </button>
        </aside>

        <div className="p-6 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_220px]">
            <div>
              <SectionLabel>About</SectionLabel>
              <p className="mt-3 text-sm leading-relaxed text-charcoal">{trainer.about || trainer.bio}</p>
            </div>

            {trainer.quote && (
              <blockquote className="rounded-2xl bg-orange/5 px-5 py-4 ring-1 ring-orange/15">
                <p className="text-4xl font-black leading-none text-orange/40">&ldquo;</p>
                <p className="mt-1 text-sm italic leading-relaxed text-charcoal">{trainer.quote}</p>
                {trainer.quoteAuthor && (
                  <footer className="mt-3 text-xs font-bold uppercase tracking-wide text-orange">{trainer.quoteAuthor}</footer>
                )}
              </blockquote>
            )}
          </div>

          {trainer.philosophy && (
            <section className="mt-8 border-t border-gray-100 pt-6">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-charcoal text-sm text-white">
                  ◎
                </span>
                <div>
                  <SectionLabel>Philosophy</SectionLabel>
                  <p className="mt-3 text-sm leading-relaxed text-charcoal">{trainer.philosophy}</p>
                </div>
              </div>
            </section>
          )}

          {trainer.qualifications.length > 0 && (
            <section className="mt-8 border-t border-gray-100 pt-6">
              <div className="flex items-start gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-charcoal text-sm text-white">
                  ★
                </span>
                <div className="w-full">
                  <SectionLabel>Qualifications & Certifications</SectionLabel>
                  <ul className="mt-4 space-y-3 text-center text-sm font-semibold text-charcoal sm:text-left">
                    {trainer.qualifications.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </article>
  );
}

export default function TrainersClient({
  user,
  trainers,
  assessmentReport,
  pendingTrainerIds
}: {
  user: SafeUser;
  trainers: TrainerProfile[];
  assessmentReport: AssessmentReport | null;
  pendingTrainerIds: string[];
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{ trainerName: string; reportAttached: boolean } | null>(null);

  const selected = trainers.find((t) => t.id === selectedId);

  async function submitContract() {
    if (!selectedId) return;
    setBusy(true);
    setError("");

    const res = await fetch("/api/trainers/contract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trainerId: selectedId, message })
    });

    const data = await res.json();
    setBusy(false);

    if (!res.ok) {
      setError(data.error || "Could not submit request.");
      return;
    }

    setSuccess({ trainerName: data.trainerName, reportAttached: data.reportAttached });
    setSelectedId(null);
    setMessage("");
  }

  if (success) {
    return (
      <div className="min-h-screen bg-soft-bg">
        <AppHeader user={user} />
        <main className="mx-auto max-w-2xl px-6 py-10 text-center">
          <p className="text-sm font-bold uppercase tracking-wide text-orange">Request Sent</p>
          <h1 className="mt-3 text-3xl font-black">We&apos;ve notified Fitdog</h1>
          <p className="mt-3 text-muted">
            {success.reportAttached
              ? `Your request to work with ${success.trainerName} was sent to the Fitdog team along with your assessment report. An admin will review it and follow up soon.`
              : `Your request to work with ${success.trainerName} was sent to the Fitdog team. Complete the Training Assessment so your recommendation report can be included.`}
          </p>
          <Link href="/dashboard" className="mt-8 inline-flex rounded-full bg-orange px-6 py-3 font-bold text-white">
            Back to Dashboard
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-soft-bg">
      <AppHeader user={user} />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <p className="text-sm font-bold uppercase tracking-wide text-orange">Fitdog Certified Network</p>
        <h1 className="mt-2 text-3xl font-black">Contact Dog Trainer</h1>
        <p className="mt-2 max-w-2xl text-muted">
          Meet Fitdog-certified trainers and request personalized support. Your message and assessment report are sent to
          the Fitdog admin team, who will follow up to connect you with the right trainer.
        </p>

        {assessmentReport ? (
          <div className="mt-6 rounded-2xl border border-sky/20 bg-sky/5 p-5">
            <p className="text-sm font-bold text-sky">Your assessment report will be included</p>
            <p className="mt-1 text-sm text-charcoal">
              <strong>Primary challenge:</strong> {assessmentReport.primaryChallenge}
            </p>
            <p className="text-sm text-charcoal">
              <strong>Recommended track:</strong> {assessmentReport.recommendedTrackTitle}
            </p>
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-orange/20 bg-orange/5 p-5">
            <p className="text-sm font-semibold text-charcoal">
              Take the Training Assessment first so your recommendation report can be sent with your trainer request.
            </p>
            <Link href="/assessment" className="mt-3 inline-flex text-sm font-bold text-orange hover:underline">
              Take Assessment →
            </Link>
          </div>
        )}

        <div className="mt-10 space-y-8">
          {trainers.map((trainer) => (
            <TrainerProfileCard
              key={trainer.id}
              trainer={trainer}
              pending={pendingTrainerIds.includes(trainer.id)}
              onRequest={() => setSelectedId(trainer.id)}
            />
          ))}
        </div>

        {trainers.length === 0 && (
          <p className="mt-8 text-center text-muted">Certified trainers are being onboarded. Check back soon.</p>
        )}
      </main>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-4 sm:items-center">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <h3 className="text-xl font-black">Request {selected.name}</h3>
            <p className="mt-2 text-sm text-muted">
              Describe your dog&apos;s situation. Your assessment report
              {assessmentReport ? " will be sent automatically." : " is not on file yet — complete the assessment for best results."}
            </p>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="Tell us about your dog, goals, and any urgent concerns…"
              className="mt-4 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange/40"
            />
            {error && <p className="mt-3 text-sm font-semibold text-red-600">{error}</p>}
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setSelectedId(null);
                  setMessage("");
                  setError("");
                }}
                className="flex-1 rounded-full border border-gray-200 py-3 text-sm font-bold text-charcoal"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={submitContract}
                className="flex-1 rounded-full bg-orange py-3 text-sm font-bold text-white disabled:opacity-60"
              >
                {busy ? "Sending…" : "Send Request"}
              </button>
            </div>
          </div>
        </div>
      )}

      <FitdogAiChatWidget pageUrl="/trainers" />
    </div>
  );
}
