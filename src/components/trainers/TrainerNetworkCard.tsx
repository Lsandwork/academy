"use client";

import type { TrainerProfile } from "@/lib/trainerProfile";
import { TrainerAvatar } from "./TrainerAvatar";

export function TrainerNetworkCard({
  trainer,
  pending,
  onViewProfile,
  onRequest
}: {
  trainer: TrainerProfile;
  pending: boolean;
  onViewProfile: () => void;
  onRequest: () => void;
}) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-gray-100 transition hover:shadow-md hover:ring-orange/20">
      <div className="h-1.5 bg-gradient-to-r from-charcoal via-orange to-sky" />

      <div className="flex flex-1 flex-col p-6">
        <div className="flex flex-col items-center text-center">
          <TrainerAvatar name={trainer.name} photoUrl={trainer.photoUrl} />
          <p className="mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-orange">Fitdog Certified</p>
          <h2 className="mt-1 text-xl font-black text-charcoal">{trainer.name}</h2>
          <p className="mt-2 min-h-[2.75rem] text-sm font-semibold leading-snug text-orange">{trainer.title}</p>
        </div>

        <p className="mt-4 flex-1 text-center text-sm leading-relaxed text-muted line-clamp-4">{trainer.bio}</p>

        {trainer.specialties.length > 0 && (
          <div className="mt-5 flex min-h-[4.5rem] flex-wrap justify-center gap-2">
            {trainer.specialties.slice(0, 4).map((item) => (
              <span key={item} className="rounded-full bg-soft-bg px-3 py-1 text-[11px] font-bold text-charcoal ring-1 ring-gray-100">
                {item}
              </span>
            ))}
          </div>
        )}

        {trainer.qualifications.length > 0 && (
          <p className="mt-4 text-center text-xs font-semibold text-charcoal">
            {trainer.qualifications.length} professional credential{trainer.qualifications.length === 1 ? "" : "s"}
          </p>
        )}

        <div className="mt-6 flex flex-col gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={onRequest}
            className="w-full rounded-full bg-orange py-3 text-sm font-black uppercase tracking-wide text-white hover:bg-orange/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending ? "Request pending" : "Request trainer"}
          </button>
          <button
            type="button"
            onClick={onViewProfile}
            className="w-full rounded-full border border-gray-200 py-3 text-sm font-bold text-charcoal hover:border-orange/30 hover:text-orange"
          >
            View full profile
          </button>
        </div>
      </div>
    </article>
  );
}
