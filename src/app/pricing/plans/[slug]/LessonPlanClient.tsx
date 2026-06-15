"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { fitdogAcademyAssets } from "@/assets/fitdogAcademyAssets";
import { AppHeader } from "@/components/AppHeader";
import { PublicHeader } from "@/components/PublicHeader";
import type { CoursePreview } from "@/data/pricingContent";
import { SafeUser } from "@/lib/user";
import type { PlanId } from "@/lib/stripe";

export default function LessonPlanClient({
  course,
  user
}: {
  course: CoursePreview;
  user: SafeUser | null;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function startPlan() {
    if (!user) {
      router.push(`/login?next=${encodeURIComponent(`/pricing/plans/${course.slug}`)}`);
      return;
    }

    setBusy(true);
    setError("");

    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId: course.recommendedPlanId as PlanId })
    });

    const data = await res.json();
    setBusy(false);

    if (!res.ok) {
      setError(data.error || "Checkout is not available yet. Visit pricing or contact support.");
      return;
    }

    if (data.url) window.location.href = data.url;
  }

  return (
    <div className="min-h-screen bg-soft-bg">
      {user ? <AppHeader user={user} /> : <PublicHeader />}

      <main className="mx-auto max-w-4xl px-6 py-10 md:py-14">
        <Link href="/pricing" className="text-sm font-bold text-orange hover:underline">
          ← Back to pricing
        </Link>

        <div className="mt-6 rounded-3xl border border-gray-100 bg-white p-8 shadow-sm md:p-10">
          <p className="text-sm font-black uppercase tracking-[0.15em] text-orange">Lesson Plan Preview</p>
          <h1 className="mt-2 text-3xl font-black text-charcoal md:text-4xl">{course.title}</h1>
          <p className="mt-4 text-base leading-relaxed text-muted">{course.description}</p>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl bg-soft-bg p-5">
              <h2 className="text-sm font-black uppercase tracking-wide text-muted">Who it&apos;s for</h2>
              <p className="mt-2 text-sm leading-relaxed text-charcoal">{course.whoItsFor}</p>
            </div>
            <div className="rounded-2xl bg-soft-bg p-5">
              <h2 className="text-sm font-black uppercase tracking-wide text-muted">Recommended plan</h2>
              <p className="mt-2 text-sm font-bold text-charcoal">{course.recommendedPlan}</p>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-black text-charcoal">What you&apos;ll learn</h2>
            <ul className="mt-4 space-y-2">
              {course.whatYouLearn.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-charcoal">
                  <Image src={fitdogAcademyAssets.icons.ui.check} alt="" width={16} height={16} aria-hidden className="mt-0.5" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-8">
            <h2 className="text-lg font-black text-charcoal">Lesson modules</h2>
            <ol className="mt-4 space-y-3">
              {course.modules.map((module, index) => (
                <li key={module} className="flex gap-3 rounded-xl border border-gray-100 px-4 py-3 text-sm text-charcoal">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange/10 text-xs font-black text-orange">
                    {index + 1}
                  </span>
                  {module}
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-8 rounded-2xl border border-dashed border-gray-200 bg-gray-50/80 p-5">
            <h2 className="text-sm font-black uppercase tracking-wide text-muted">Worksheets &amp; materials</h2>
            <p className="mt-2 text-sm leading-relaxed text-charcoal">
              Each module includes downloadable worksheets, trainer homework notes, and progress checkpoints. Materials unlock with your plan.
            </p>
          </div>

          {error && <p className="mt-6 text-sm font-semibold text-red-600">{error}</p>}

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={startPlan}
              disabled={busy}
              className="inline-flex flex-1 items-center justify-center rounded-full bg-orange px-6 py-3.5 text-sm font-bold text-white hover:bg-orange-dark disabled:opacity-60"
            >
              {busy ? "Redirecting…" : `Start with ${course.recommendedPlan.split(" or ")[0]}`}
            </button>
            {course.trackId && (
              <Link
                href={`/library/${course.trackId}`}
                className="inline-flex flex-1 items-center justify-center rounded-full border border-gray-200 px-6 py-3.5 text-sm font-bold text-charcoal hover:border-orange/30 hover:text-orange"
              >
                Browse in Library
              </Link>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
