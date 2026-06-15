import { redirect } from "next/navigation";
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

export async function ensureProfileForAuthUser(authUser: {
  id: string;
  email?: string;
  user_metadata?: { name?: string };
}) {
  const email = authUser.email?.toLowerCase().trim();
  if (!email) {
    throw new Error("Authenticated user is missing an email address.");
  }

  let profile = await findProfileForAuthUser(authUser);

  if (profile) {
    if (!profile.supabaseId) {
      profile = await prisma.user.update({
        where: { id: profile.id },
        data: { supabaseId: authUser.id }
      });
    }
    return profile;
  }

  const name =
    typeof authUser.user_metadata?.name === "string" ? authUser.user_metadata.name.trim() || null : null;

  try {
    return await prisma.user.create({
      data: {
        supabaseId: authUser.id,
        email,
        name
      }
    });
  } catch {
    profile = await findProfileForAuthUser(authUser);
    if (profile) return profile;
    throw new Error("Could not create your account profile.");
  }
}

export async function getCurrentUser(): Promise<SafeUser | null> {
  try {
    const authUser = await getSupabaseAuthUser();
    if (!authUser) return null;

    const profile = await ensureProfileForAuthUser(authUser);
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

export async function requireTrainer() {
  const user = await requireFreshPassword();
  if (user.role !== "TRAINER" && user.role !== "ADMIN") throw new Error("FORBIDDEN");
  return user;
}

/** For API routes — returns 403 instead of redirecting when password change is required. */
export async function requireTrainerApi() {
  const user = await requireUser();
  if (user.mustChangePassword) throw new Error("PASSWORD_CHANGE_REQUIRED");
  if (user.role !== "TRAINER" && user.role !== "ADMIN") throw new Error("FORBIDDEN");
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "ADMIN") throw new Error("FORBIDDEN");
  return user;
}

/** Redirect users who must change a temporary password before using the app. */
export async function requireFreshPassword(): Promise<SafeUser> {
  const user = await requireUser();
  if (user.mustChangePassword) {
    redirect("/change-password?required=1");
  }
  return user;
}

export async function requireUserOrRedirect(loginPath = "/login"): Promise<SafeUser> {
  const user = await getCurrentUser();
  if (!user) redirect(loginPath);
  if (user.mustChangePassword) redirect("/change-password?required=1");
  return user;
}

export async function signOutCurrentUser() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}

export function redirectForRole(role: SafeUser["role"]) {
  if (role === "ADMIN" || role === "STAFF") return "/admin";
  if (role === "TRAINER") return "/trainer";
  return "/dashboard";
}
