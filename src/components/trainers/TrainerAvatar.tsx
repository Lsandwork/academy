import { trainerInitials } from "@/lib/trainerProfile";

const sizes = {
  md: "h-28 w-28 text-3xl rounded-2xl",
  lg: "h-32 w-32 text-3xl rounded-2xl shrink-0"
} as const;

export function TrainerAvatar({
  name,
  photoUrl,
  size = "md"
}: {
  name: string;
  photoUrl: string | null;
  size?: keyof typeof sizes;
}) {
  return (
    <div
      className={`relative mx-auto overflow-hidden bg-gradient-to-br from-charcoal via-charcoal to-charcoal/90 shadow-md ring-4 ring-orange/15 ${sizes[size]}`}
    >
      {photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={photoUrl} alt="" className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-orange/25 via-white to-sky/20">
          <span className={`font-black text-charcoal ${size === "lg" ? "text-3xl" : "text-2xl"}`}>{trainerInitials(name)}</span>
        </div>
      )}
    </div>
  );
}
