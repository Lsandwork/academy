import { redirect } from "next/navigation";
import { getCurrentUser, requireFreshPassword } from "@/lib/auth";
import { isTrainer } from "@/lib/user";
import TrainerPanelClient from "./TrainerPanelClient";

export default async function TrainerPage() {
  const current = await getCurrentUser();
  if (!current) redirect("/trainer/login");

  if (current.mustChangePassword) {
    redirect("/change-password?required=1");
  }

  let user;
  try {
    user = await requireFreshPassword();
  } catch {
    redirect("/trainer/login");
  }

  if (!isTrainer(user) && user.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return <TrainerPanelClient user={user} />;
}
