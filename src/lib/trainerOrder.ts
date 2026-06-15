export const TRAINER_DISPLAY_ORDER = ["ivonne-c", "amanda-n", "brian-guzman"] as const;

export function sortTrainersByDisplayOrder<T extends { slug: string }>(trainers: T[]) {
  return [...trainers].sort((a, b) => {
    const ai = TRAINER_DISPLAY_ORDER.indexOf(a.slug as (typeof TRAINER_DISPLAY_ORDER)[number]);
    const bi = TRAINER_DISPLAY_ORDER.indexOf(b.slug as (typeof TRAINER_DISPLAY_ORDER)[number]);
    const aRank = ai === -1 ? 999 : ai;
    const bRank = bi === -1 ? 999 : bi;
    if (aRank !== bRank) return aRank - bRank;
    return a.slug.localeCompare(b.slug);
  });
}
