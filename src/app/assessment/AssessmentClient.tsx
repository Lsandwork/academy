"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { FitdogAiChatWidget } from "@/components/ai/FitdogAiChatWidget";
import { assessmentQuestions } from "@/data/assessment";
import { SafeUser } from "@/lib/user";

export default function AssessmentClient({ user }: { user: SafeUser }) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ trackTitle: string; trackId: string } | null>(null);

  async function submit() {
    const question = assessmentQuestions[0];
    if (!answers[question.id]) {
      setError("Please select an answer.");
      return;
    }

    setBusy(true);
    setError("");
    const res = await fetch("/api/assessment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers })
    });
    const data = await res.json();
    setBusy(false);

    if (!res.ok) {
      setError(data.error || "Could not save assessment.");
      return;
    }

    setResult({ trackTitle: data.trackTitle, trackId: data.trackId });
  }

  if (result) {
    return (
      <div className="min-h-screen bg-soft-bg">
        <AppHeader user={user} />
        <main className="mx-auto max-w-2xl px-6 py-10 text-center">
          <p className="text-sm font-bold uppercase tracking-wide text-orange">Your Recommendation</p>
          <h1 className="mt-3 text-3xl font-black">{result.trackTitle}</h1>
          <p className="mt-3 text-muted">Based on your answers, this track is the best place to start.</p>
          <Link href={`/library/${result.trackId}`} className="mt-8 inline-flex rounded-full bg-orange px-6 py-3 font-bold text-white">
            Start Recommended Track →
          </Link>
          <button onClick={() => router.push("/library")} className="mt-4 block w-full text-sm font-bold text-muted">
            Browse all courses
          </button>
        </main>
      </div>
    );
  }

  const question = assessmentQuestions[0];

  return (
    <div className="min-h-screen bg-soft-bg">
      <AppHeader user={user} />
      <main className="mx-auto max-w-2xl px-6 py-10">
        <h1 className="text-3xl font-black">Training Assessment</h1>
        <p className="mt-2 text-muted">Answer one quick question and we&apos;ll recommend the best starting track.</p>

        <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-lg font-black">{question.prompt}</h2>
          <div className="mt-4 space-y-3">
            {question.options.map((option) => (
              <button
                key={option.id}
                onClick={() => setAnswers({ [question.id]: option.id })}
                className={`w-full rounded-2xl border px-4 py-3 text-left font-semibold ${answers[question.id] === option.id ? "border-orange bg-orange/5 text-orange" : "border-gray-200 text-charcoal"}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="mt-4 text-sm font-semibold text-red-600">{error}</p>}

        <button disabled={busy} onClick={submit} className="mt-8 w-full rounded-full bg-orange py-4 font-bold text-white disabled:opacity-60">
          {busy ? "Saving..." : "Get My Recommendation"}
        </button>
      </main>
      <FitdogAiChatWidget pageUrl="/assessment" />
    </div>
  );
}
