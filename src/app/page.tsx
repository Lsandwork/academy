import Image from "next/image";
import Link from "next/link";
import { fitdogAcademyAssets } from "@/assets/fitdogAcademyAssets";
import { LandingTrackCard } from "@/components/LandingTrackCard";
import { PublicHeader } from "@/components/PublicHeader";
import { mainPricingPlans, pricingHeadline, trustBadges } from "@/data/pricingContent";
import { academyTracks } from "@/data/academyCourses";
import { getCurrentUser } from "@/lib/auth";
import { heroImage } from "@/lib/theme";

const trackSubtitles: Record<string, string> = {
  "puppy-foundations": "Start strong. Build confidence early.",
  "everyday-obedience": "Reliable skills for daily life.",
  "calm-home-skills": "Peaceful home. Relaxed dog.",
  "separation-support": "Help your dog feel secure.",
  "leash-reactivity-reset": "Calmer walks, better days.",
  "fitdog-enrichment-at-home": "Happy mind. Healthy life."
};

const features = [
  { icon: fitdogAcademyAssets.icons.benefits.videoLessons, title: "Step-by-step Video Lessons", body: "Watch, practice, and track progress at home." },
  { icon: fitdogAcademyAssets.icons.benefits.positiveReinforcement, title: "Positive Reinforcement", body: "Ethical, science-based training methods." },
  { icon: fitdogAcademyAssets.icons.benefits.certifiedTrainers, title: "Created by Certified Trainers", body: "CPDT-KA® certified professionals." },
  { icon: fitdogAcademyAssets.icons.benefits.results, title: "Results You Can See", body: "Real training for real life." }
];

const planMeta: Record<string, { border: string; button: string }> = {
  single_lesson: { border: "border-sky/40", button: "border border-sky/50 text-sky hover:bg-sky/10" },
  monthly: { border: "border-orange ring-1 ring-orange/30", button: "bg-orange text-white hover:bg-orange-dark" },
  premium: { border: "border-white/20", button: "border border-white/20 text-white hover:bg-white/10" },
  lifetime: { border: "border-success/40", button: "border border-success/50 text-success hover:bg-success/10" }
};

const landingPlans = mainPricingPlans.filter((p) => ["single_lesson", "monthly", "premium", "lifetime"].includes(p.id));

export default async function HomePage() {
  const user = await getCurrentUser();
  const tracks = academyTracks.map((track) => ({
    ...track,
    subtitle: trackSubtitles[track.id] ?? track.subtitle
  }));

  return (
    <div className="min-h-screen bg-[#0d1117] text-white">
      <PublicHeader dark />

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-32 top-20 h-[520px] w-[520px] rounded-full bg-orange/20 blur-[120px]" />
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 py-16 lg:grid-cols-2 lg:py-20">
          <div className="relative z-10">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-sky">Online Dog Training</p>
            <h1 className="mt-4 text-4xl font-black leading-[1.1] md:text-5xl lg:text-6xl">
              Online Dog Training for <span className="text-orange">Real Life.</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg text-white/65">
              Practical skills. Happier dogs. Stronger bonds. Proven results.
            </p>
            <Link
              href="/register"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-orange px-8 py-4 text-base font-bold text-white shadow-lg shadow-orange/30 hover:bg-orange-dark"
            >
              Start Training Today
              <Image src={fitdogAcademyAssets.icons.ui.arrowRight} alt="" width={18} height={18} aria-hidden />
            </Link>
            <p className="mt-5 flex items-center gap-2 text-sm font-semibold text-white/55">
              <Image src={fitdogAcademyAssets.icons.ui.check} alt="" width={18} height={18} aria-hidden className="opacity-80" />
              30-Day Satisfaction Guarantee
            </p>
          </div>

          <div className="relative flex justify-center lg:justify-end">
            <div className="absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange/35 blur-2xl" />
            <div className="relative aspect-[4/5] w-full max-w-md overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl shadow-orange/10">
              <Image
                src={heroImage}
                alt="Dog owner training with her dog"
                fill
                className="object-cover"
                priority
                sizes="(max-width:768px) 100vw, 400px"
              />
            </div>

            <div className="absolute -right-2 top-6 hidden w-44 rounded-2xl border border-white/10 bg-[#161b22]/90 p-4 backdrop-blur sm:block">
              <p className="text-xs font-bold text-white/50">25K+ Dogs Trained</p>
              <p className="mt-1 text-orange">★★★★★</p>
            </div>
            <div className="absolute -right-2 bottom-10 hidden w-44 rounded-2xl border border-white/10 bg-[#161b22]/90 p-4 backdrop-blur sm:block">
              <p className="text-xs font-bold text-white/50">4.9/5 Average Rating</p>
              <p className="mt-1 text-orange">★★★★★</p>
            </div>
          </div>
        </div>
      </section>

      <section id="courses" className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-10">
          <h2 className="text-3xl font-black md:text-4xl">Featured Tracks</h2>
          <p className="mt-2 text-white/55">Expert-led training for every stage of your dog&apos;s journey.</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {tracks.map((track) => (
            <LandingTrackCard key={track.id} track={track} loggedIn={Boolean(user)} />
          ))}
        </div>
      </section>

      <section id="how-it-works" className="border-y border-white/10 bg-[#11161d]">
        <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((item) => (
            <div key={item.title} className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/5 p-2">
                <Image src={item.icon} alt="" width={32} height={32} aria-hidden />
              </div>
              <div>
                <p className="font-bold">{item.title}</p>
                <p className="mt-1 text-sm text-white/55">{item.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="mx-auto max-w-7xl px-6 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-black md:text-4xl">{pricingHeadline}</h2>
          <p className="mt-3 text-white/55">
            From a single lesson to monthly trainer coaching—with premium support when you need more hands-on help.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {landingPlans.map((plan) => {
            const meta = planMeta[plan.id];
            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl border bg-[#161b22] p-5 ${meta.border} ${plan.badge ? "pt-8" : ""} ${plan.featured ? "shadow-xl shadow-orange/10" : ""}`}
              >
                {plan.badge && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-orange px-3 py-1 text-[10px] font-black tracking-wide text-white">
                    {plan.badge.toUpperCase()}
                  </span>
                )}
                <p className="text-sm font-bold text-white/80">{plan.name}</p>
                <p className="mt-1 text-xs text-white/45">{plan.subtitle}</p>
                <p className="mt-4 text-2xl font-black text-white">
                  {plan.price}
                  {plan.frequency && plan.frequency !== "one-time" && (
                    <span className="text-sm font-semibold text-white/50">{plan.frequency}</span>
                  )}
                </p>
                <Link
                  href={`/pricing?plan=${plan.id}`}
                  className={`mt-5 flex w-full items-center justify-center rounded-full px-4 py-2.5 text-sm font-bold ${meta.button}`}
                >
                  {plan.cta}
                </Link>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {trustBadges.map((label) => (
            <span key={label} className="rounded-full border border-white/10 bg-[#161b22] px-4 py-2 text-xs font-semibold text-white/70">
              {label}
            </span>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link href="/pricing" className="inline-flex rounded-full border border-orange/40 px-6 py-3 text-sm font-bold text-orange hover:bg-orange/10">
            View all plans &amp; lesson previews →
          </Link>
        </div>
      </section>

      <section id="resources" className="border-t border-white/10 bg-[#11161d] py-16 text-center">
        <h2 className="text-3xl font-black">Ready to start training?</h2>
        <p className="mt-3 text-white/55">Join thousands of dog parents building better habits at home.</p>
        <Link href="/register" className="mt-8 inline-flex rounded-full bg-orange px-8 py-4 font-bold text-white hover:bg-orange-dark">
          Create Free Account →
        </Link>
      </section>

      <footer className="border-t border-white/10 py-8 text-center text-sm text-white/40">
        <p>© {new Date().getFullYear()} Fitdog Academy. All rights reserved.</p>
        <p className="mt-2">
          <Link href="/staff/login" className="hover:text-white">Staff Login</Link>
        </p>
      </footer>
    </div>
  );
}
