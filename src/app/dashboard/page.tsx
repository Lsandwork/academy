import Link from "next/link";
import { redirect } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { TrackIcon } from "@/components/TrackIcon";
import { FitdogAiChatWidget } from "@/components/ai/FitdogAiChatWidget";
import { academyTracks } from "@/data/academyCourses";
import { getCurrentUser } from "@/lib/auth";
import { accessLabel, parseJsonArray } from "@/lib/user";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const completed = parseJsonArray(user.completedLessonIds).length;

  return (
    <div className="min-h-screen bg-soft-bg">
      <AppHeader user={user} />
      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="rounded-3xl bg-white p-8 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-wide text-orange">Dashboard</p>
          <h1 className="mt-2 text-3xl font-black">Welcome back{user.name ? `, ${user.name}` : ""}!</h1>
          <p className="mt-2 text-muted">Ready for today&apos;s training?</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/library" className="inline-flex rounded-full bg-orange px-6 py-3 font-bold text-white hover:bg-orange-dark">
              Continue Learning →
            </Link>
            <Link href="/assessment" className="inline-flex rounded-full border border-gray-200 bg-white px-6 py-3 font-bold text-charcoal hover:border-orange/30">
              Take Assessment
            </Link>
            <Link href="/trainers" className="inline-flex rounded-full border border-gray-200 bg-white px-6 py-3 font-bold text-charcoal hover:border-orange/30">
              Contact Dog Trainer
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-muted">Access</p>
            <p className="text-xl font-black capitalize">{accessLabel(user.accessLevel)}</p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-muted">Free Credits</p>
            <p className="text-xl font-black">{user.creditBalance}</p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-muted">Completed</p>
            <p className="text-xl font-black">{completed} lessons</p>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-muted">Saved</p>
            <p className="text-xl font-black">{parseJsonArray(user.favoriteLessonIds).length} favorites</p>
          </div>
        </div>

        <h2 className="mt-10 text-2xl font-black">Featured Tracks</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {academyTracks.map((track) => (
            <Link key={track.id} href={`/library/${track.id}`} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:border-orange/30">
              <TrackIcon trackId={track.id} size={36} />
              <h3 className="mt-3 font-black">{track.title}</h3>
              <p className="text-sm text-muted">{track.subtitle}</p>
            </Link>
          ))}
        </div>
      </main>
      <FitdogAiChatWidget pageUrl="/dashboard" />
    </div>
  );
}
