import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const admin = await requireAdmin();

    const notifications = await prisma.adminNotification.findMany({
      where: { userId: admin.id },
      orderBy: { createdAt: "desc" },
      take: 50
    });

    const unreadCount = notifications.filter((n) => !n.readAt).length;

    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();
    const markAll = body.markAll === true;

    if (markAll) {
      await prisma.adminNotification.updateMany({
        where: { userId: admin.id, readAt: null },
        data: { readAt: new Date() }
      });
      return NextResponse.json({ success: true });
    }

    const id = body.id as string | undefined;
    if (!id) {
      return NextResponse.json({ error: "id or markAll is required." }, { status: 400 });
    }

    const updated = await prisma.adminNotification.updateMany({
      where: { id, userId: admin.id },
      data: { readAt: new Date() }
    });

    if (!updated.count) {
      return NextResponse.json({ error: "Notification not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}
