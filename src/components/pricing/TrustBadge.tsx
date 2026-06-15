import Image from "next/image";
import { fitdogAcademyAssets } from "@/assets/fitdogAcademyAssets";

export function TrustBadge({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-gray-100 bg-white px-4 py-2 text-sm font-semibold text-charcoal shadow-sm">
      <Image src={fitdogAcademyAssets.icons.ui.check} alt="" width={16} height={16} aria-hidden className="shrink-0" />
      <span>{label}</span>
    </div>
  );
}

export function TrustBadgeRow({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      {items.map((label) => (
        <TrustBadge key={label} label={label} />
      ))}
    </div>
  );
}
