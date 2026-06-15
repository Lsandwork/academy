import { NextResponse } from "next/server";
import { getCurrentUser, signOutCurrentUser } from "@/lib/auth";
import { logUserActivity } from "@/lib/activityLog";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (user) {
    await logUserActivity({
      userId: user.id,
      userEmail: user.email,
      category: "auth",
      action: "logout",
      summary: `${user.email} signed out`
    });
  }

  await signOutCurrentUser();

  const origin = req.headers.get("origin");
  const base = process.env.NEXT_PUBLIC_APP_URL || origin || "http://localhost:3000";
  return NextResponse.redirect(new URL("/", base), 303);
}
