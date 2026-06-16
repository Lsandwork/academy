import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { logUserActivity } from "@/lib/activityLog";
import {
  listPaymentProcessorsForAdmin,
  savePaymentProcessor,
  type PaymentProvider
} from "@/lib/paymentProcessor";

export async function GET() {
  try {
    await requireAdmin();
    const processors = await listPaymentProcessorsForAdmin();
    return NextResponse.json({ processors });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();
    const provider = body.provider as PaymentProvider | undefined;

    if (!provider || !["stripe", "paypal", "square"].includes(provider)) {
      return NextResponse.json({ error: "Invalid payment processor." }, { status: 400 });
    }

    if (provider !== "stripe") {
      return NextResponse.json({ error: "Only Stripe can be linked right now. PayPal and Square are coming soon." }, { status: 400 });
    }

    const enabled = Boolean(body.enabled);
    const config = (body.config || {}) as Record<string, unknown>;

    await savePaymentProcessor({
      provider,
      enabled,
      config,
      updatedById: admin.id
    });

    await logUserActivity({
      actor: { id: admin.id, email: admin.email, name: admin.name },
      category: "admin",
      action: "payment_processor_updated",
      summary: `${admin.email} updated ${provider} payment processor settings`,
      metadata: { provider, enabled },
      targetType: "payment_processor",
      targetId: provider
    });

    const processors = await listPaymentProcessorsForAdmin();
    return NextResponse.json({ ok: true, processors });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}
