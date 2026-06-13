import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { requireUser, verifyPassword } from "@/lib/auth";
import { toSafeUser } from "@/lib/user";
import { prisma } from "@/lib/db";

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireUser();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and current password are required." }, { status: 400 });
    }

    const valid = await verifyPassword(user.email, password);
    if (!valid || valid.id !== user.id) {
      return NextResponse.json({ error: "Current password is incorrect." }, { status: 401 });
    }

    const normalized = email.toLowerCase().trim();
    const taken = await prisma.user.findFirst({ where: { email: normalized, NOT: { id: user.id } } });
    if (taken) {
      return NextResponse.json({ error: "Email is already in use." }, { status: 409 });
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { email: normalized }
    });

    return NextResponse.json({ user: toSafeUser(updated) });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
