import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/auth";
import { isTrainer } from "@/lib/user";

export default async function AdminTrainerPortalRootPage() {
  try {
    await requireStaff();
  } catch {
    redirect("/staff/login");
  }
  redirect("/admin/trainer-portal/dashboard");
}
