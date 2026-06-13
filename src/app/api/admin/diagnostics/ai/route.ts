import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getAiAssistDiagnostics, runAiAdminTest } from "@/lib/ai/diagnostics";
import { testGeminiConnection } from "@/lib/ai/gemini";
import { recordHealthCheck } from "@/lib/ai/logging";
import { getAiConfig } from "@/lib/ai/config";

export async function GET() {
  try {
    await requireAdmin();
    const config = getAiConfig();
    if (!config.adminDiagnosticsEnabled) {
      return NextResponse.json({ error: "AI diagnostics disabled." }, { status: 403 });
    }
    return NextResponse.json(await getAiAssistDiagnostics());
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const config = getAiConfig();
    if (!config.adminDiagnosticsEnabled) {
      return NextResponse.json({ error: "AI diagnostics disabled." }, { status: 403 });
    }

    const { action } = await req.json();
    if (action === "test_gemini") {
      const result = await testGeminiConnection();
      await recordHealthCheck({
        service: "gemini",
        status: result.ok ? "healthy" : "critical",
        responseTimeMs: result.responseTimeMs,
        errorMessage: result.ok ? undefined : result.message
      });
      return NextResponse.json(result);
    }

    const result = await runAiAdminTest(action);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}
