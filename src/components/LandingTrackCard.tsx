import Image from "next/image";
import Link from "next/link";
import { AcademyTrack, lessonsForTrack } from "@/data/academyCourses";
import { getTrackAssets } from "@/assets/fitdogAcademyAssets";

export function LandingTrackCard({ track, loggedIn }: { track: AcademyTrack; loggedIn?: boolean }) {
  const { thumbnail, icon } = getTrackAssets(track.id);
  const lessons = lessonsForTrack(track.id);
  const href = loggedIn ? `/library/${track.id}` : `/login?next=/library/${track.id}`;

  return (
    <Link
      href={href}
      className="group overflow-hidden rounded-2xl border border-white/10 bg-[#161b22] transition hover:-translate-y-1 hover:border-white/20 hover:shadow-xl hover:shadow-orange/5"
      aria-label={`${track.title} course`}
    >
      <div className="relative h-44 overflow-hidden">
        <Image
          src={thumbnail}
          alt={`${track.title} course`}
          fill
          sizes="(max-width:768px) 100vw, 33vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#161b22] via-transparent to-transparent" />
        <span className="absolute left-3 top-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white/95 p-1.5 shadow-lg">
          <Image src={icon} alt="" width={28} height={28} aria-hidden />
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-black text-white">{track.title}</h3>
        <p className="mt-1 text-sm text-white/60">{track.subtitle}</p>
        <p className="mt-3 text-xs font-bold text-white/40">{lessons.length} Lessons</p>
      </div>
    </Link>
  );
}
