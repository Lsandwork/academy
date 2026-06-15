import { redirect } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { getCurrentUser } from "@/lib/auth";
import MessagesClient from "./MessagesClient";

export default async function MessagesPage({
  searchParams
}: {
  searchParams: Promise<{ conversation?: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/messages");
  const params = await searchParams;

  return (
    <div className="min-h-screen bg-soft-bg">
      <AppHeader user={user} />
      <main className="mx-auto max-w-6xl px-6 py-10">
        <p className="text-sm font-bold uppercase tracking-wide text-orange">Messenger</p>
        <h1 className="mt-2 text-3xl font-black">Messages</h1>
        <p className="mt-2 text-muted">Chat with Fitdog admin, your trainer, or academy clients.</p>
        <div className="mt-8">
          <MessagesClient user={user} initialConversationId={params.conversation} />
        </div>
      </main>
    </div>
  );
}
