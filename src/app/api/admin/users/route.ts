import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth";
import { listAllUsers } from "@/lib/authProfile";
import { toSafeUser } from "@/lib/user";

export async function GET() {
  try {
    await requireStaff();

    const users = await listAllUsers({ includeRecentCredits: true });

    return NextResponse.json({
      users: users.map((u) => {
        const { creditTransactions, ...user } = u as typeof u & {
          creditTransactions?: Array<{
            id: string;
            amount: number;
            reason: string;
            createdAt: Date;
            lessonId: string | null;
          }>;
        };
        return {
          ...toSafeUser(user),
          recentCredits: creditTransactions ?? []
        };
      })
    });
  } catch (error) {
    console.error("admin/users GET", error);
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const message = error instanceof Error ? error.message : "Could not load users.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
