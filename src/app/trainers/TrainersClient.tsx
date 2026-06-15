"use client";

import Link from "next/link";
import { useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { FitdogAiChatWidget } from "@/components/ai/FitdogAiChatWidget";
import { TrainerDetailModal } from "@/components/trainers/TrainerDetailModal";
import { TrainerNetworkCard } from "@/components/trainers/TrainerNetworkCard";
import type { AssessmentReport } from "@/lib/assessmentReport";
import type { TrainerProfile } from "@/lib/trainerProfile";
import { SafeUser } from "@/lib/user";

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
  const [profileTrainer, setProfileTrainer] = useState<TrainerProfile | null>(null);
  const [requestTrainerId, setRequestTrainerId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [dogName, setDogName] = useState("");
  const [dogBreed, setDogBreed] = useState("");
  const [dogAge, setDogAge] = useState("");
  const [dogNotes, setDogNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<{ trainerName: string; reportAttached: boolean } | null>(null);

  const requestTrainer = trainers.find((t) => t.id === requestTrainerId);

  function openRequest(trainerId: string) {
    setProfileTrainer(null);
    setRequestTrainerId(trainerId);
    setError("");
  }

  async function submitContract() {
    if (!requestTrainerId) return;
    setBusy(true);
    setError("");

    const res = await fetch("/api/trainers/contract", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        trainerId: requestTrainerId,
        message,
        dogName,
        dogBreed,
        dogAge,
        dogNotes
      })
    });

    const data = await res.json();
    setBusy(false);

    if (!res.ok) {
      setError(data.error || "Could not submit request.");
      return;
    }

    setSuccess({ trainerName: data.trainerName, reportAttached: data.reportAttached });
    setRequestTrainerId(null);
    setMessage("");
    setDogName("");
    setDogBreed("");
    setDogAge("");
    setDogNotes("");
  }

  if (success) {
    return (
      <div className="min-h-screen bg-soft-bg">
        <AppHeader user={user} />
        <main className="mx-auto max-w-2xl px-6 py-10 text-center">
          <p className="text-sm font-bold uppercase tracking-wide text-orange">Request sent</p>
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
        <div className="max-w-3xl">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-orange">Fitdog Certified Network</p>
          <h1 className="mt-2 text-3xl font-black text-charcoal md:text-4xl">Work with a Fitdog Certified Trainer</h1>
          <p className="mt-3 text-base leading-relaxed text-muted">
            Every trainer below is part of the Fitdog certified network — vetted, experienced, and committed to
            force-free, results-driven training. Choose the trainer who fits your goals and request personalized support.
          </p>
        </div>

        {assessmentReport ? (
          <div className="mt-8 rounded-2xl border border-sky/20 bg-sky/5 p-5">
            <p className="text-sm font-bold text-sky">Your assessment report will be included</p>
            <p className="mt-1 text-sm text-charcoal">
              <strong>Primary challenge:</strong> {assessmentReport.primaryChallenge}
            </p>
            <p className="text-sm text-charcoal">
              <strong>Recommended track:</strong> {assessmentReport.recommendedTrackTitle}
            </p>
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-orange/20 bg-orange/5 p-5">
            <p className="text-sm font-semibold text-charcoal">
              Take the Training Assessment first so your recommendation report can be sent with your trainer request.
            </p>
            <Link href="/assessment" className="mt-3 inline-flex text-sm font-bold text-orange hover:underline">
              Take Assessment →
            </Link>
          </div>
        )}

        {trainers.length > 0 ? (
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {trainers.map((trainer) => (
              <TrainerNetworkCard
                key={trainer.id}
                trainer={trainer}
                pending={pendingTrainerIds.includes(trainer.id)}
                onViewProfile={() => setProfileTrainer(trainer)}
                onRequest={() => openRequest(trainer.id)}
              />
            ))}
          </div>
        ) : (
          <p className="mt-10 text-center text-muted">Certified trainers are being onboarded. Check back soon.</p>
        )}

        <div className="mt-12 rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-black text-charcoal">What happens after you request a trainer?</h2>
          <ol className="mt-4 space-y-3 text-sm text-muted">
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange/10 text-xs font-black text-orange">1</span>
              <span>Your request and assessment report go to the Fitdog admin team for review.</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange/10 text-xs font-black text-orange">2</span>
              <span>Once approved, you and your trainer can message directly through the academy.</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange/10 text-xs font-black text-orange">3</span>
              <span>Your trainer helps you build a plan using Fitdog lessons, worksheets, and live coaching.</span>
            </li>
          </ol>
        </div>
      </main>

      {profileTrainer && (
        <TrainerDetailModal
          trainer={profileTrainer}
          pending={pendingTrainerIds.includes(profileTrainer.id)}
          onClose={() => setProfileTrainer(null)}
          onRequest={() => openRequest(profileTrainer.id)}
        />
      )}

      {requestTrainer && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-4 sm:items-center">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-orange">Trainer request</p>
            <h3 className="mt-1 text-xl font-black">Request {requestTrainer.name}</h3>
            <p className="mt-2 text-sm text-muted">
              Tell us about your dog. Admin will review and approve the assignment before your trainer can message you.
              {assessmentReport ? " Your assessment report will be sent automatically." : " Complete the assessment for best results."}
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <input
                value={dogName}
                onChange={(e) => setDogName(e.target.value)}
                placeholder="Dog's name *"
                className="rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange/40"
              />
              <input
                value={dogBreed}
                onChange={(e) => setDogBreed(e.target.value)}
                placeholder="Breed"
                className="rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange/40"
              />
              <input
                value={dogAge}
                onChange={(e) => setDogAge(e.target.value)}
                placeholder="Age"
                className="rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange/40"
              />
            </div>
            <textarea
              value={dogNotes}
              onChange={(e) => setDogNotes(e.target.value)}
              rows={2}
              placeholder="Anything else about your dog (behavior, medical notes, etc.)"
              className="mt-3 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange/40"
            />
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
              placeholder="What would you like help with?"
              className="mt-3 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange/40"
            />
            {error && <p className="mt-3 text-sm font-semibold text-red-600">{error}</p>}
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setRequestTrainerId(null);
                  setMessage("");
                  setDogName("");
                  setDogBreed("");
                  setDogAge("");
                  setDogNotes("");
                  setError("");
                }}
                className="flex-1 rounded-full border border-gray-200 py-3 text-sm font-bold text-charcoal"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={busy || !dogName.trim()}
                onClick={submitContract}
                className="flex-1 rounded-full bg-orange py-3 text-sm font-bold text-white disabled:opacity-60"
              >
                {busy ? "Sending…" : "Send request"}
              </button>
            </div>
          </div>
        </div>
      )}

      <FitdogAiChatWidget pageUrl="/trainers" />
    </div>
  );
}
