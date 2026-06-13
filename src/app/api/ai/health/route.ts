import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getAiAssistDiagnostics } from "@/lib/ai/diagnostics";
import { getAiConfig } from "@/lib/ai/config";

export async function GET() {
  try {
    await requireAdmin();
    const config = getAiConfig();
    const diagnostics = await getAiAssistDiagnostics();
    return NextResponse.json({
      ok: config.enabled && config.apiKeyPresent,
      ...diagnostics
    });
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}
