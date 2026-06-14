import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { toSafeUser } from "@/lib/user";

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireUser();
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and current password are required." }, { status: 400 });
    }

    const normalized = email.toLowerCase().trim();
    const taken = await prisma.user.findFirst({ where: { email: normalized, NOT: { id: user.id } } });
    if (taken) {
      return NextResponse.json({ error: "Email is already in use." }, { status: 409 });
    }

    const supabase = await createClient();
    const { error: verifyError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password
    });

    if (verifyError) {
      return NextResponse.json({ error: "Current password is incorrect." }, { status: 401 });
    }

    const { error } = await supabase.auth.updateUser({ email: normalized });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
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
