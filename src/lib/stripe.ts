import type { StripePlanId } from "./paymentProcessor";

export type PlanId = StripePlanId;

export function planToAccessLevel(plan: PlanId) {
  switch (plan) {
    case "single_lesson":
      return "SINGLE_LESSON" as const;
    case "monthly":
    case "premium":
    case "cgc_prep":
    case "cgc_prep_eval":
      return "MONTHLY" as const;
    case "lifetime":
      return "LIFETIME" as const;
  }
}

export {
  getStripeClient,
  getStripePrices,
  getWebhookSecret,
  resolveStripeConfig
} from "./paymentProcessor";

/** @deprecated Use getStripeClient() */
export const stripe = null;

/** @deprecated Use getStripePrices() */
export const stripePrices = {
  single_lesson: process.env.STRIPE_PRICE_SINGLE_LESSON || "",
  monthly: process.env.STRIPE_PRICE_MONTHLY || "",
  premium: process.env.STRIPE_PRICE_PREMIUM || "",
  lifetime: process.env.STRIPE_PRICE_LIFETIME || "",
  cgc_prep: process.env.STRIPE_PRICE_CGC_PREP || "",
  cgc_prep_eval: process.env.STRIPE_PRICE_CGC_PREP_EVAL || ""
} as const;
