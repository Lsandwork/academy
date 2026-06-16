import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { logUserActivity } from "@/lib/activityLog";
import { logError } from "@/lib/errors";
import { parseJsonArray } from "@/lib/user";
import { prisma } from "@/lib/db";
import { PlanId, getStripeClient, getWebhookSecret, planToAccessLevel } from "@/lib/stripe";
import { cgcLessonIds } from "@/data/akcCgcPrep";

export async function POST(req: NextRequest) {
  const stripe = await getStripeClient();
  if (!stripe) return NextResponse.json({ error: "Stripe not configured" }, { status: 503 });

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  const secret = await getWebhookSecret();

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
    const planId = session.metadata?.planId as PlanId | undefined;
    const lessonId = session.metadata?.lessonId;

    if (userId && planId) {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (user) {
        if (planId === "cgc_prep" || planId === "cgc_prep_eval") {
          const purchased = [...new Set([...parseJsonArray(user.purchasedLessonIds), ...cgcLessonIds])];
          await prisma.user.update({
            where: { id: userId },
            data: { purchasedLessonIds: JSON.stringify(purchased) }
          });

          await logUserActivity({
            userId,
            userEmail: user.email,
            category: "payment",
            action: "purchase_completed",
            summary: `${user.email} purchased AKC CGC Prep${planId === "cgc_prep_eval" ? " + Evaluation" : ""}`,
            metadata: { planId, lessonIds: cgcLessonIds },
            targetType: "course",
            targetId: "akc-cgc-prep"
          });
        } else {
          const accessLevel = planToAccessLevel(
            planId as Exclude<PlanId, "cgc_prep" | "cgc_prep_eval">
          );
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

          await logUserActivity({
            userId,
            userEmail: user.email,
            category: "payment",
            action: "purchase_completed",
            summary: `${user.email} purchased ${planId.replace("_", " ")}${lessonId ? ` (${lessonId})` : ""}`,
            metadata: { planId, lessonId: lessonId || null, accessLevel },
            targetType: "user",
            targetId: userId
          });
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
