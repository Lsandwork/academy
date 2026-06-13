import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import LibraryClient from "./LibraryClient";

export default async function LibraryPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return <LibraryClient user={user} />;
}
