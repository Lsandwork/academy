"use client";

import Link from "next/link";
import { useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { FitdogAiChatWidget } from "@/components/ai/FitdogAiChatWidget";
import type { AssessmentReport } from "@/lib/assessmentReport";
import { SafeUser } from "@/lib/user";

type Trainer = {
  id: string;
  slug: string;
  name: string;
  title: string;
  bio: string;
  specialties: string[];
  photoUrl: string | null;
};

export default function TrainersClient({
  user,
  trainers,
  assessmentReport,
  pendingTrainerIds
}: {
  user: SafeUser;
  trainers: Trainer[];
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
          <h1 className="mt-3 text-3xl font-black">You&apos;re connected with {success.trainerName}</h1>
          <p className="mt-3 text-muted">
            {success.reportAttached
              ? "Your training assessment report was sent automatically so your trainer can review your recommended track and primary challenge before reaching out."
              : "Your trainer will receive your request. Complete the Training Assessment so your recommendation report can be included next time."}
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
      <main className="mx-auto max-w-5xl px-6 py-10">
        <p className="text-sm font-bold uppercase tracking-wide text-orange">Fitdog Certified Network</p>
        <h1 className="mt-2 text-3xl font-black">Contact Dog Trainer</h1>
        <p className="mt-2 max-w-2xl text-muted">
          Work hand-in-hand with Fitdog-certified trainers on the issues your assessment recommends. When you request a
          trainer, your assessment report is sent to them automatically.
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
              Take the Training Assessment first so your recommendation report can be sent to your trainer automatically.
            </p>
            <Link href="/assessment" className="mt-3 inline-flex text-sm font-bold text-orange hover:underline">
              Take Assessment →
            </Link>
          </div>
        )}

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {trainers.map((trainer) => {
            const pending = pendingTrainerIds.includes(trainer.id);
            return (
              <article key={trainer.id} className="rounded-3xl bg-white p-6 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-orange/10 text-xl font-black text-orange">
                    {trainer.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg font-black">{trainer.name}</h2>
                    <p className="text-sm font-semibold text-orange">{trainer.title}</p>
                  </div>
                </div>
                <p className="mt-4 text-sm text-muted">{trainer.bio}</p>
                {trainer.specialties.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {trainer.specialties.map((s) => (
                      <span key={s} className="rounded-full bg-soft-bg px-3 py-1 text-xs font-bold text-charcoal">
                        {s}
                      </span>
                    ))}
                  </div>
                )}
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => setSelectedId(trainer.id)}
                  className="mt-5 w-full rounded-full bg-charcoal py-3 text-sm font-bold text-white hover:bg-charcoal/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {pending ? "Request Pending" : "Request to Work Together"}
                </button>
              </article>
            );
          })}
        </div>

        {trainers.length === 0 && (
          <p className="mt-8 text-center text-muted">Certified trainers are being onboarded. Check back soon.</p>
        )}
      </main>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-4 sm:items-center">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <h3 className="text-xl font-black">Work with {selected.name}</h3>
            <p className="mt-2 text-sm text-muted">
              Describe your dog&apos;s situation. Your assessment report
              {assessmentReport ? " will be sent automatically." : " is not on file yet — complete the assessment for best results."}
            </p>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="Tell the trainer about your dog, goals, and any urgent concerns…"
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
