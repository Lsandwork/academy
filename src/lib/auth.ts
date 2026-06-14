import { prisma } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";
import { SafeUser, toSafeUser } from "./user";

export type { SafeUser } from "./user";
export { accessLabel, hasLessonAccess, parseJsonArray, toSafeUser } from "./user";

export async function getSupabaseAuthUser() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user?.email) return null;
  return data.user;
}

export async function findProfileForAuthUser(authUser: { id: string; email?: string }) {
  const email = authUser.email?.toLowerCase().trim();
  return prisma.user.findFirst({
    where: {
      OR: [{ supabaseId: authUser.id }, ...(email ? [{ email }] : [])]
    }
  });
}

export async function getCurrentUser(): Promise<SafeUser | null> {
  try {
    const authUser = await getSupabaseAuthUser();
    if (!authUser) return null;

    const profile = await findProfileForAuthUser(authUser);
    if (!profile) return null;

    if (!profile.supabaseId) {
      const linked = await prisma.user.update({
        where: { id: profile.id },
        data: { supabaseId: authUser.id }
      });
      return toSafeUser(linked);
    }

    return toSafeUser(profile);
  } catch {
    return null;
  }
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}

export async function requireStaff() {
  const user = await requireUser();
  if (user.role !== "STAFF" && user.role !== "ADMIN") throw new Error("FORBIDDEN");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") throw new Error("FORBIDDEN");
  return user;
}

export async function signOutCurrentUser() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}

export function redirectForRole(role: SafeUser["role"]) {
  return role === "ADMIN" || role === "STAFF" ? "/admin" : "/dashboard";
}
