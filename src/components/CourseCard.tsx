import Image from "next/image";
import Link from "next/link";
import { AcademyTrack } from "@/data/academyCourses";
import { getTrackAssets } from "@/assets/fitdogAcademyAssets";

export function CourseCard({ track, href }: { track: AcademyTrack; href: string }) {
  const { thumbnail, icon } = getTrackAssets(track.id);

  return (
    <Link href={href} className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <div className="relative h-44 overflow-hidden">
        <Image
          src={thumbnail}
          alt={`${track.title} course`}
          fill
          sizes="(max-width:768px) 100vw, 33vw"
          className="object-cover object-center transition group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/95 p-1 shadow">
          <Image src={icon} alt="" width={24} height={24} aria-hidden />
        </span>
      </div>
      <div className="p-5">
        <h3 className="text-lg font-black text-charcoal">{track.title}</h3>
        <p className="mt-1 text-sm text-muted">{track.subtitle}</p>
      </div>
    </Link>
  );
}
