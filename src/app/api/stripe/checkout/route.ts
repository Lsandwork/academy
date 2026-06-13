import { NextRequest, NextResponse } from "next/server";
import { requireUser, toSafeUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { PlanId, stripe, stripePrices } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  let user;
  try {
    user = await requireUser();
  } catch {
    return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
  }

  if (!stripe) {
    return NextResponse.json({
      error: "Stripe is not configured. Add STRIPE_SECRET_KEY and price IDs to .env — see .env.example."
    }, { status: 503 });
  }

  const { planId, lessonId } = await req.json() as { planId: PlanId; lessonId?: string };

  if (!planId || !stripePrices[planId]) {
    return NextResponse.json({ error: "Invalid plan." }, { status: 400 });
  }

  const priceId = stripePrices[planId];
  if (!priceId) {
    return NextResponse.json({ error: `Missing Stripe price for ${planId}. Set STRIPE_PRICE_${planId.toUpperCase()} in .env.` }, { status: 503 });
  }

  let customerId = user.stripeCustomerId;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { userId: user.id }
    });
    customerId = customer.id;
    await prisma.user.update({ where: { id: user.id }, data: { stripeCustomerId: customerId } });
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const mode = planId === "monthly" ? "subscription" : "payment";

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${baseUrl}/dashboard?checkout=success`,
    cancel_url: `${baseUrl}/pricing?checkout=cancelled`,
    metadata: {
      userId: user.id,
      planId,
      lessonId: lessonId || ""
    }
  });

  return NextResponse.json({ url: session.url });
}
