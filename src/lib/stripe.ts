import Stripe from "stripe";

export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY)
  : null;

export const stripePrices = {
  single_lesson: process.env.STRIPE_PRICE_SINGLE_LESSON || "",
  monthly: process.env.STRIPE_PRICE_MONTHLY || "",
  lifetime: process.env.STRIPE_PRICE_LIFETIME || ""
} as const;

export type PlanId = keyof typeof stripePrices;

export function planToAccessLevel(plan: PlanId) {
  switch (plan) {
    case "single_lesson":
      return "SINGLE_LESSON" as const;
    case "monthly":
      return "MONTHLY" as const;
    case "lifetime":
      return "LIFETIME" as const;
  }
}
