import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/auth";
import { TrainerPortalShell } from "@/components/trainer/TrainerPortalShell";

export default async function AdminTrainerPortalLayout({ children }: { children: React.ReactNode }) {
  let user;
  try {
    user = await requireStaff();
  } catch {
    redirect("/staff/login");
  }

  if (user.role !== "ADMIN" && user.role !== "TRAINER" && user.role !== "STAFF") {
    redirect("/dashboard");
  }

  return (
    <TrainerPortalShell
      user={user}
      basePath="/admin/trainer-portal"
      portalTitle="Admin · Trainer Portal"
      backHref="/admin"
    >
      {children}
    </TrainerPortalShell>
  );
}
