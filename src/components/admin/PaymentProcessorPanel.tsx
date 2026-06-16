"use client";

import { useEffect, useState } from "react";
import type { DiagnosticStatus } from "@/lib/diagnostics";
import { STRIPE_PLAN_LABELS, type ProcessorPublicView, type StripePlanId } from "@/lib/paymentProcessorShared";

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    connected: "bg-success/10 text-success",
    healthy: "bg-success/10 text-success",
    warning: "bg-yellow-100 text-yellow-800",
    error: "bg-red-100 text-red-700",
    critical: "bg-red-100 text-red-700",
    pending: "bg-sky/10 text-sky",
    not_configured: "bg-gray-100 text-gray-600"
  };
  return (
    <span className={`rounded-full px-2 py-1 text-[10px] font-black uppercase ${styles[status] || styles.not_configured}`}>
      {status.replace(/_/g, " ")}
    </span>
  );
}

function sourceLabel(source: ProcessorPublicView["configSource"]) {
  switch (source) {
    case "environment":
      return "Environment variables";
    case "database":
      return "Admin panel";
    case "merged":
      return "Admin panel + environment";
    default:
      return "Not configured";
  }
}

const stripePlanIds = Object.keys(STRIPE_PLAN_LABELS) as StripePlanId[];

type StripeForm = {
  enabled: boolean;
  secretKey: string;
  publishableKey: string;
  webhookSecret: string;
  priceIds: Record<StripePlanId, string>;
};

function emptyStripeForm(): StripeForm {
  return {
    enabled: false,
    secretKey: "",
    publishableKey: "",
    webhookSecret: "",
    priceIds: {
      single_lesson: "",
      monthly: "",
      premium: "",
      lifetime: "",
      cgc_prep: "",
      cgc_prep_eval: ""
    }
  };
}

export function PaymentProcessorPanel() {
  const [processors, setProcessors] = useState<ProcessorPublicView[]>([]);
  const [stripeForm, setStripeForm] = useState<StripeForm>(emptyStripeForm());
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadProcessors() {
    const res = await fetch("/api/admin/payment-processors");
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Could not load payment processors.");
      setLoaded(true);
      return;
    }

    setProcessors(data.processors || []);
    const stripe = (data.processors || []).find((p: ProcessorPublicView) => p.provider === "stripe");
    if (stripe) {
      setStripeForm({
        enabled: stripe.enabled,
        secretKey: "",
        publishableKey: "",
        webhookSecret: "",
        priceIds: {
          single_lesson: stripe.priceIds.single_lesson || "",
          monthly: stripe.priceIds.monthly || "",
          premium: stripe.priceIds.premium || "",
          lifetime: stripe.priceIds.lifetime || "",
          cgc_prep: stripe.priceIds.cgc_prep || "",
          cgc_prep_eval: stripe.priceIds.cgc_prep_eval || ""
        }
      });
    }
    setLoaded(true);
    setError("");
  }

  useEffect(() => {
    loadProcessors();
  }, []);

  async function saveStripe() {
    setBusy(true);
    setMessage("");
    setError("");

    const payload: Record<string, unknown> = {
      provider: "stripe",
      enabled: stripeForm.enabled,
      config: {
        secretKey: stripeForm.secretKey,
        publishableKey: stripeForm.publishableKey,
        webhookSecret: stripeForm.webhookSecret,
        priceIds: stripeForm.priceIds
      }
    };

    const res = await fetch("/api/admin/payment-processors", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Could not save Stripe settings.");
      setBusy(false);
      return;
    }

    setProcessors(data.processors || []);
    setStripeForm((prev) => ({ ...prev, secretKey: "", publishableKey: "", webhookSecret: "" }));
    setMessage("Stripe settings saved.");
    setBusy(false);
  }

  async function testStripe() {
    setBusy(true);
    setMessage("");
    setError("");

    const res = await fetch("/api/admin/payment-processors/test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider: "stripe" })
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Connection test failed.");
      setBusy(false);
      return;
    }

    setProcessors(data.processors || []);
    setMessage(data.message || (data.ok ? "Stripe connection successful." : "Stripe connection failed."));
    if (!data.ok) setError(data.message);
    setBusy(false);
  }

  const stripeProcessor = processors.find((p) => p.provider === "stripe");
  const otherProcessors = processors.filter((p) => p.provider !== "stripe");

  if (!loaded) {
    return <p className="mt-8 text-sm text-muted">Loading payment processors…</p>;
  }

  return (
    <div className="mt-8 space-y-6">
      {message && <p className="rounded-xl bg-success/10 px-4 py-3 text-sm font-semibold text-success">{message}</p>}
      {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</p>}

      {stripeProcessor && (
        <div className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-gray-100">
          <div className="h-1.5 bg-gradient-to-r from-charcoal via-[#635bff] to-sky" />
          <div className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-black">Stripe</h2>
                  <StatusBadge status={stripeProcessor.status as DiagnosticStatus} />
                </div>
                <p className="mt-2 max-w-2xl text-sm text-muted">{stripeProcessor.description}</p>
                <p className="mt-2 text-xs font-semibold text-charcoal">
                  Config source: {sourceLabel(stripeProcessor.configSource)}
                </p>
                {stripeProcessor.lastTestedAt && (
                  <p className="mt-1 text-xs text-muted">
                    Last tested: {new Date(stripeProcessor.lastTestedAt).toLocaleString()}
                  </p>
                )}
                {stripeProcessor.lastError && (
                  <p className="mt-2 text-sm text-red-600">{stripeProcessor.lastError}</p>
                )}
              </div>
              <label className="flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-bold">
                <input
                  type="checkbox"
                  checked={stripeForm.enabled}
                  onChange={(e) => setStripeForm((prev) => ({ ...prev, enabled: e.target.checked }))}
                />
                Enable Stripe
              </label>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <label className="block">
                <span className="text-sm font-bold text-charcoal">Secret key</span>
                <input
                  type="password"
                  autoComplete="off"
                  placeholder={stripeProcessor.fields.secretKey || "sk_test_..."}
                  value={stripeForm.secretKey}
                  onChange={(e) => setStripeForm((prev) => ({ ...prev, secretKey: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm"
                />
                {stripeProcessor.fields.secretKey && (
                  <span className="mt-1 block text-xs text-muted">Current: {stripeProcessor.fields.secretKey}</span>
                )}
              </label>

              <label className="block">
                <span className="text-sm font-bold text-charcoal">Publishable key</span>
                <input
                  type="text"
                  autoComplete="off"
                  placeholder={stripeProcessor.fields.publishableKey || "pk_test_..."}
                  value={stripeForm.publishableKey}
                  onChange={(e) => setStripeForm((prev) => ({ ...prev, publishableKey: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm"
                />
                {stripeProcessor.fields.publishableKey && (
                  <span className="mt-1 block text-xs text-muted">Current: {stripeProcessor.fields.publishableKey}</span>
                )}
              </label>

              <label className="block lg:col-span-2">
                <span className="text-sm font-bold text-charcoal">Webhook signing secret</span>
                <input
                  type="password"
                  autoComplete="off"
                  placeholder={stripeProcessor.fields.webhookSecret || "whsec_..."}
                  value={stripeForm.webhookSecret}
                  onChange={(e) => setStripeForm((prev) => ({ ...prev, webhookSecret: e.target.value }))}
                  className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm"
                />
                {stripeProcessor.webhookUrl && (
                  <span className="mt-2 block text-xs text-muted">
                    Webhook endpoint: <code className="rounded bg-soft-bg px-2 py-1">{stripeProcessor.webhookUrl}</code>
                  </span>
                )}
              </label>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-black uppercase tracking-wide text-charcoal">Stripe price IDs</h3>
              <p className="mt-1 text-sm text-muted">Map each academy plan to a Stripe Price ID from your dashboard.</p>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {stripePlanIds.map((planId) => (
                  <label key={planId} className="block">
                    <span className="text-sm font-bold text-charcoal">{STRIPE_PLAN_LABELS[planId]}</span>
                    <input
                      type="text"
                      placeholder="price_..."
                      value={stripeForm.priceIds[planId]}
                      onChange={(e) =>
                        setStripeForm((prev) => ({
                          ...prev,
                          priceIds: { ...prev.priceIds, [planId]: e.target.value }
                        }))
                      }
                      className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm"
                    />
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                disabled={busy}
                onClick={saveStripe}
                className="rounded-full bg-orange px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
              >
                Save Stripe settings
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={testStripe}
                className="rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-bold text-charcoal disabled:opacity-60"
              >
                Test connection
              </button>
              {stripeProcessor.dashboardUrl && (
                <a
                  href={stripeProcessor.dashboardUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-bold text-charcoal hover:border-orange/30 hover:text-orange"
                >
                  Open Stripe dashboard
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {otherProcessors.map((processor) => (
          <div key={processor.provider} className="rounded-3xl border border-dashed border-gray-200 bg-white/70 p-6">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-black">{processor.label}</h3>
              <StatusBadge status="not_configured" />
            </div>
            <p className="mt-2 text-sm text-muted">{processor.description}</p>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted">Coming soon</p>
            {processor.dashboardUrl && (
              <a
                href={processor.dashboardUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-block text-sm font-bold text-orange hover:underline"
              >
                Merchant dashboard →
              </a>
            )}
          </div>
        ))}
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <h3 className="text-lg font-black">Setup checklist</h3>
        <ul className="mt-4 space-y-2 text-sm text-muted">
          <li>1. Create products and prices in Stripe for each academy plan.</li>
          <li>2. Paste your secret key, publishable key, and price IDs above, then save.</li>
          <li>3. Add the webhook endpoint in Stripe and paste the signing secret.</li>
          <li>4. Run <strong className="text-charcoal">Test connection</strong> to verify the link.</li>
          <li>5. Environment variables still work — admin settings override env when enabled.</li>
        </ul>
      </div>
    </div>
  );
}
