import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/auth";
import { isAdmin } from "@/lib/user";
import AdminPanelClient from "./AdminPanelClient";

export default async function AdminPage() {
  let user;
  try {
    user = await requireStaff();
  } catch {
    redirect("/staff/login");
  }

  return <AdminPanelClient user={user} isAdmin={isAdmin(user)} />;
}
