import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { logUserActivity } from "@/lib/activityLog";
import {
  listPaymentProcessorsForAdmin,
  markProcessorTestResult,
  resolveStripeConfig,
  testStripeConnection,
  type PaymentProvider
} from "@/lib/paymentProcessor";

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();
    const provider = body.provider as PaymentProvider | undefined;

    if (!provider) {
      return NextResponse.json({ error: "Provider required." }, { status: 400 });
    }

    if (provider !== "stripe") {
      return NextResponse.json({ error: "Connection test is only available for Stripe right now." }, { status: 400 });
    }

    const config = await resolveStripeConfig();
    const result = await testStripeConnection(config);
    await markProcessorTestResult(provider, result);

    await logUserActivity({
      actor: { id: admin.id, email: admin.email, name: admin.name },
      category: "admin",
      action: "payment_processor_tested",
      summary: `${admin.email} tested ${provider} connection — ${result.ok ? "success" : "failed"}`,
      metadata: { provider, ok: result.ok, message: result.message },
      targetType: "payment_processor",
      targetId: provider
    });

    const processors = await listPaymentProcessorsForAdmin();
    return NextResponse.json({ ok: result.ok, message: result.message, processors });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}
