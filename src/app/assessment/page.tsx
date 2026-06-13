import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import AssessmentClient from "./AssessmentClient";

export default async function AssessmentPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/assessment");
  return <AssessmentClient user={user} />;
}
