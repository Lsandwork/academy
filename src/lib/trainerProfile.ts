export type TrainerProfile = {
  id: string;
  slug: string;
  name: string;
  title: string;
  bio: string;
  about: string | null;
  philosophy: string | null;
  quote: string | null;
  quoteAuthor: string | null;
  specialties: string[];
  classes: string[];
  qualifications: string[];
  photoUrl: string | null;
};

export function parseTrainerJsonList(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v) => typeof v === "string") : [];
  } catch {
    return [];
  }
}

export function toTrainerProfile(trainer: {
  id: string;
  slug: string;
  name: string;
  title: string;
  bio: string;
  about?: string | null;
  philosophy?: string | null;
  quote?: string | null;
  quoteAuthor?: string | null;
  specialties: string;
  classes?: string;
  qualifications?: string;
  photoUrl: string | null;
}): TrainerProfile {
  return {
    id: trainer.id,
    slug: trainer.slug,
    name: trainer.name,
    title: trainer.title,
    bio: trainer.bio,
    about: trainer.about ?? null,
    philosophy: trainer.philosophy ?? null,
    quote: trainer.quote ?? null,
    quoteAuthor: trainer.quoteAuthor ?? null,
    specialties: parseTrainerJsonList(trainer.specialties),
    classes: parseTrainerJsonList(trainer.classes ?? "[]"),
    qualifications: parseTrainerJsonList(trainer.qualifications ?? "[]"),
    photoUrl: trainer.photoUrl
  };
}

export function trainerInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
