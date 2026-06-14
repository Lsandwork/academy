"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { fitdogAcademyAssets } from "@/assets/fitdogAcademyAssets";
import { AppHeader } from "@/components/AppHeader";
import { pricingPlans } from "@/data/academyCourses";
import { SafeUser } from "@/lib/user";

const planIcons = {
  single_lesson: fitdogAcademyAssets.icons.pricing.singleLesson,
  monthly: fitdogAcademyAssets.icons.pricing.monthly,
  lifetime: fitdogAcademyAssets.icons.pricing.lifetime
};

export default function PricingClient({ user }: { user: SafeUser | null }) {
  const router = useRouter();
  const params = useSearchParams();
  const lessonId = params.get("lesson") || undefined;
  const planParam = params.get("plan");
  const initialPlan = pricingPlans.find((p) => p.id === planParam) ?? (lessonId ? pricingPlans[0] : pricingPlans[1]);
  const [selected, setSelected] = useState(initialPlan);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const plan = pricingPlans.find((p) => p.id === planParam);
    if (plan) setSelected(plan);
    else if (lessonId) setSelected(pricingPlans[0]);
  }, [planParam, lessonId]);

  async function checkout() {
    if (!user) {
      router.push("/login?next=/pricing");
      return;
    }

    setBusy(true);
    setError("");

    const res = await fetch("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId: selected.id, lessonId })
    });

    const data = await res.json();
    setBusy(false);

    if (!res.ok) {
      setError(data.error || "Checkout failed.");
      return;
    }

    if (data.url) window.location.href = data.url;
  }

  return (
    <div className="min-h-screen bg-soft-bg">
      {user ? <AppHeader user={user} /> : null}
      <main className="mx-auto max-w-3xl px-6 py-10">
        <h1 className="text-3xl font-black text-center">Choose Your Access</h1>
        <p className="mt-2 text-center text-muted">All plans include access on all devices.</p>
        <p className="mt-4 rounded-2xl bg-sky/10 px-4 py-3 text-center text-sm font-semibold text-charcoal">
          Secure checkout powered by Stripe
        </p>
        {user && (
          <p className={`mt-3 rounded-2xl px-4 py-3 text-center text-sm font-semibold ${user.creditBalance > 0 ? "bg-orange/10 text-orange" : "bg-white text-muted border border-gray-100"}`}>
            {user.creditBalance > 0
              ? `You have ${user.creditBalance} free credit${user.creditBalance === 1 ? "" : "s"}. Each credit unlocks one paid lesson.`
              : "Use 1 free credit to unlock any paid lesson. Credits can be granted by support or promotions."}
          </p>
        )}

        <div className="mt-8 space-y-4">
          {pricingPlans.map((plan) => (
            <button
              key={plan.id}
              onClick={() => setSelected(plan)}
              className={`w-full rounded-2xl border-2 bg-white p-6 text-left transition ${selected.id === plan.id ? "border-orange shadow-md" : "border-gray-100"}`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <Image src={planIcons[plan.id]} alt="" width={32} height={32} aria-hidden />
                  <h3 className="text-lg font-black">{plan.title}</h3>
                </div>
                {plan.badge && <span className="rounded-full bg-orange/10 px-2 py-1 text-[10px] font-black text-orange">{plan.badge}</span>}
              </div>
              <p className="text-sm text-muted">{plan.subtitle}</p>
              <p className="mt-2 text-2xl font-black text-orange">{plan.priceLabel}</p>
              <ul className="mt-3 space-y-1">
                {plan.benefits.map((b) => (
                  <li key={b} className="text-sm font-semibold text-charcoal">✓ {b}</li>
                ))}
              </ul>
            </button>
          ))}
        </div>

        {error && <p className="mt-4 text-center text-sm font-semibold text-red-600">{error}</p>}

        <button
          onClick={checkout}
          disabled={busy}
          className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-orange py-4 text-lg font-bold text-white hover:bg-orange-dark disabled:opacity-60"
        >
          <Image src={fitdogAcademyAssets.icons.ui.lock} alt="" width={20} height={20} aria-hidden />
          {busy ? "Redirecting..." : "Secure Checkout"}
        </button>

        {!user && (
          <p className="mt-4 text-center text-sm text-muted">
            You&apos;ll be asked to sign in before checkout.
          </p>
        )}
      </main>
    </div>
  );
}
