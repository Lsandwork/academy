"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { CoursePreviewSection } from "@/components/pricing/CoursePreviewSection";
import { PricingSection } from "@/components/pricing/PricingSection";
import { getCheckoutPlan } from "@/data/pricingContent";
import { SafeUser } from "@/lib/user";
import type { PlanId } from "@/lib/stripe";

export default function PricingClient({ user }: { user: SafeUser | null }) {
  const router = useRouter();
  const params = useSearchParams();
  const lessonId = params.get("lesson") || undefined;
  const [busyPlanId, setBusyPlanId] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function handlePlanSelect(planId: string) {
    const plan = getCheckoutPlan(planId);
    if (!plan) return;

    if (plan.href) {
      router.push(plan.href);
      return;
    }

    if (!user) {
      router.push(`/login?next=${encodeURIComponent(`/pricing?plan=${planId}`)}`);
      return;
    }

    setBusyPlanId(planId);
    setError("");

    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId: planId as PlanId, lessonId })
    });

    const data = await res.json();
    setBusyPlanId(null);

    if (!res.ok) {
      setError(data.error || "Checkout is not available for this plan yet. Contact support@fitdog.com for help.");
      return;
    }

    if (data.url) window.location.href = data.url;
  }

  return (
    <div className="min-h-screen bg-soft-bg">
      {user ? <AppHeader user={user} /> : null}

      <main className="mx-auto max-w-7xl px-6 py-10 md:py-14">
        <p className="mb-8 rounded-2xl bg-white px-4 py-3 text-center text-sm font-semibold text-charcoal shadow-sm ring-1 ring-gray-100">
          Secure checkout powered by Stripe · Professional trainer-guided academy
        </p>

        {user && (
          <p
            className={`mb-8 rounded-2xl px-4 py-3 text-center text-sm font-semibold ${
              user.creditBalance > 0 ? "bg-orange/10 text-orange" : "bg-white text-muted ring-1 ring-gray-100"
            }`}
          >
            {user.creditBalance > 0
              ? `You have ${user.creditBalance} free credit${user.creditBalance === 1 ? "" : "s"}. Each credit unlocks one paid lesson.`
              : "Need one lesson only? Browse the library and unlock a single lesson—or choose a membership for trainer support."}
          </p>
        )}

        <PricingSection onPlanSelect={handlePlanSelect} loadingPlanId={busyPlanId} />

        {error && (
          <p className="mt-6 rounded-2xl bg-red-50 px-4 py-3 text-center text-sm font-semibold text-red-600">{error}</p>
        )}

        {!user && (
          <p className="mt-6 text-center text-sm text-muted">
            Already have an account?{" "}
            <Link href="/login?next=/pricing" className="font-bold text-orange hover:underline">
              Sign in
            </Link>{" "}
            to start checkout.
          </p>
        )}

        <div className="mt-20">
          <CoursePreviewSection />
        </div>
      </main>
    </div>
  );
}
