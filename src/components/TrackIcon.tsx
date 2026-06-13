import Image from "next/image";
import { getTrackAssets } from "@/assets/fitdogAcademyAssets";

export function TrackIcon({ trackId, size = 32 }: { trackId: string; size?: number }) {
  const { icon } = getTrackAssets(trackId);
  return <Image src={icon} alt="" width={size} height={size} aria-hidden />;
}
