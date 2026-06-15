import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getMessageableRecipients } from "@/lib/messaging";

export async function GET(req: NextRequest) {
  try {
    const user = await requireUser();
    const q = req.nextUrl.searchParams.get("q")?.trim().toLowerCase() ?? "";

    if (q.length < 2) {
      return NextResponse.json({ recipients: [] });
    }

    const recipients = await getMessageableRecipients(prisma, user, q);

    return NextResponse.json({
      recipients: recipients.map((r) => ({
        id: r.id,
        name: r.name,
        email: r.email,
        role: r.role,
        label: r.name?.trim() || r.email
      }))
    });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Could not search recipients." }, { status: 500 });
  }
}
