import { AccessLevel, Role } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, requireStaff } from "@/lib/auth";
import { createAdminUser } from "@/lib/adminUsers";
import { logUserActivity } from "@/lib/activityLog";
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

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();

    const email = body.email as string | undefined;
    const name = body.name as string | undefined;
    const password = body.password as string | undefined;
    const role = body.role as Role | undefined;
    const accessLevel = body.accessLevel as AccessLevel | undefined;
    const mustChangePassword =
      typeof body.mustChangePassword === "boolean" ? body.mustChangePassword : undefined;

    if (!email?.trim()) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    if (!role || !Object.values(Role).includes(role)) {
      return NextResponse.json({ error: "A valid role is required." }, { status: 400 });
    }

    const resolvedAccess = accessLevel && Object.values(AccessLevel).includes(accessLevel)
      ? accessLevel
      : AccessLevel.FREE;

    const { user, temporaryPassword } = await createAdminUser({
      email,
      name,
      password,
      role,
      accessLevel: resolvedAccess,
      mustChangePassword
    });

    await logUserActivity({
      userId: user.id,
      userEmail: user.email,
      actor: admin,
      category: "admin",
      action: "user_created",
      summary: `Admin created account for ${user.email} as ${role}`,
      metadata: { role, accessLevel: user.accessLevel, mustChangePassword: user.mustChangePassword },
      targetType: "user",
      targetId: user.id
    });

    return NextResponse.json(
      {
        user: toSafeUser(user),
        temporaryPassword: temporaryPassword ?? null,
        message: temporaryPassword
          ? `Account created. Share this temporary password with the user: ${temporaryPassword}`
          : "Account created successfully."
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("admin/users POST", error);
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const message = error instanceof Error ? error.message : "Could not create user.";
    const status = message.includes("already exists") ? 409 : message.includes("not configured") ? 503 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
