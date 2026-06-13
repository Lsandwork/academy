import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { logError } from "@/lib/errors";
import { parseJsonArray } from "@/lib/user";
import { prisma } from "@/lib/db";
import { planToAccessLevel, stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  if (!stripe) return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !secret) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, secret);
  } catch (err) {
    await logError({ severity: "critical", area: "Payments", message: `Webhook signature invalid: ${err}` });
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    const planId = session.metadata?.planId as "single_lesson" | "monthly" | "lifetime" | undefined;
    const lessonId = session.metadata?.lessonId;

    if (userId && planId) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user) {
        const accessLevel = planToAccessLevel(planId);
        const purchased = parseJsonArray(user.purchasedLessonIds);
        const nextPurchased =
          planId === "single_lesson" && lessonId && !purchased.includes(lessonId)
            ? [...purchased, lessonId]
            : purchased;

        await prisma.user.update({
          where: { id: userId },
          data: {
            accessLevel,
            purchasedLessonIds: JSON.stringify(nextPurchased)
          }
        });
      }
    }
  }

  return NextResponse.json({ received: true });
}
