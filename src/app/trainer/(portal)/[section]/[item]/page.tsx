import { notFound } from "next/navigation";
import { getTrainerPortalItem, getTrainerPortalSection } from "@/data/trainerPortalNav";
import { TrainerPortalPageView } from "@/components/trainer/TrainerPortalPageView";
import type { TrainerPortalSectionId } from "@/data/trainerPortalNav";

export default async function TrainerItemPage({
  params
}: {
  params: Promise<{ section: string; item: string }>;
}) {
  const { section: sectionId, item: itemSlug } = await params;
  const section = getTrainerPortalSection(sectionId);
  const item = getTrainerPortalItem(sectionId, itemSlug);
  if (!section || !item) notFound();

  return (
    <TrainerPortalPageView sectionId={section.id as TrainerPortalSectionId} item={item} basePath="/trainer" />
  );
}
