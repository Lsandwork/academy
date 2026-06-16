import { redirect } from "next/navigation";
import { getCurrentUser, requireFreshPassword, requireUser } from "@/lib/auth";
import { isTrainer, type SafeUser } from "@/lib/user";

export async function requireTrainerPortalApi(): Promise<SafeUser> {
  const user = await requireUser();
  if (user.mustChangePassword) throw new Error("PASSWORD_CHANGE_REQUIRED");
  if (!isTrainer(user) && user.role !== "ADMIN" && user.role !== "STAFF") {
    throw new Error("FORBIDDEN");
  }
  return user;
}

export async function requireTrainerPortalUser(loginPath = "/trainer/login"): Promise<SafeUser> {
  const current = await getCurrentUser();
  if (!current) redirect(loginPath);

  if (current.mustChangePassword) {
    redirect("/change-password?required=1");
  }

  let user: SafeUser;
  try {
    user = await requireFreshPassword();
  } catch {
    redirect(loginPath);
  }

  if (!isTrainer(user) && user.role !== "ADMIN" && user.role !== "STAFF") {
    redirect("/dashboard");
  }

  return user;
}
