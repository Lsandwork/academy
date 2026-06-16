export type PaymentProvider = "stripe" | "paypal" | "square";

export type StripePlanId =
  | "single_lesson"
  | "monthly"
  | "premium"
  | "lifetime"
  | "cgc_prep"
  | "cgc_prep_eval";

export type ProcessorPublicView = {
  provider: PaymentProvider;
  label: string;
  description: string;
  enabled: boolean;
  status: string;
  lastTestedAt: string | null;
  lastError: string | null;
  configSource: "environment" | "database" | "merged" | "none";
  fields: Record<string, string>;
  priceIds: Partial<Record<StripePlanId, string>>;
  webhookUrl: string | null;
  dashboardUrl: string | null;
  linkable: boolean;
};

export const STRIPE_PLAN_LABELS: Record<StripePlanId, string> = {
  single_lesson: "Single Lesson ($79)",
  monthly: "Monthly Coaching ($149/mo)",
  premium: "Premium Membership ($249/mo)",
  lifetime: "Lifetime Access ($599)",
  cgc_prep: "AKC CGC Prep Course ($249)",
  cgc_prep_eval: "AKC CGC Prep + Evaluation ($399)"
};

export const PAYMENT_PROCESSOR_CATALOG: Array<{
  provider: PaymentProvider;
  label: string;
  description: string;
  linkable: boolean;
  dashboardUrl: string | null;
}> = [
  {
    provider: "stripe",
    label: "Stripe",
    description: "Accept cards, subscriptions, and checkout for academy plans.",
    linkable: true,
    dashboardUrl: "https://dashboard.stripe.com"
  },
  {
    provider: "paypal",
    label: "PayPal",
    description: "PayPal merchant checkout — configure when ready to enable.",
    linkable: false,
    dashboardUrl: "https://www.paypal.com/businessprofile/settings"
  },
  {
    provider: "square",
    label: "Square",
    description: "Square merchant services — configure when ready to enable.",
    linkable: false,
    dashboardUrl: "https://squareup.com/dashboard"
  }
];
