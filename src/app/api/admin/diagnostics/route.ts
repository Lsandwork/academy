import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { runDiagnostics } from "@/lib/diagnostics";

export async function GET() {
  try {
    await requireAdmin();
    const report = await runDiagnostics();
    return NextResponse.json(report);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}
