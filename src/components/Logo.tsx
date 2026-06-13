import Image from "next/image";
import Link from "next/link";
import { fitdogAcademyAssets } from "@/assets/fitdogAcademyAssets";

export function Logo({ compact = false, dark = false }: { compact?: boolean; dark?: boolean }) {
  const size = compact ? 32 : 40;
  const wordmarkWidth = compact ? 88 : 104;
  const wordmarkHeight = compact ? 24 : 28;

  return (
    <Link href="/" className="flex items-center gap-2" aria-label="Fitdog Academy home">
      <Image
        src={fitdogAcademyAssets.logos.dogHead64}
        alt="Fitdog dog-head icon"
        width={size}
        height={size}
        priority
      />
      <div className="flex items-baseline gap-1.5">
        <Image
          src={dark ? fitdogAcademyAssets.logos.wordmarkWhite : fitdogAcademyAssets.logos.wordmarkCharcoal}
          alt="Fitdog wordmark"
          width={wordmarkWidth}
          height={wordmarkHeight}
          className="h-auto w-auto"
          priority
        />
        <span className="text-[10px] font-black tracking-[0.2em] text-orange">ACADEMY</span>
      </div>
    </Link>
  );
}
