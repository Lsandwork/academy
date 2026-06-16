import { notFound } from "next/navigation";
import { getTrainerPortalSection } from "@/data/trainerPortalNav";
import { TrainerPortalHub } from "@/components/trainer/TrainerPortalHub";

export default async function TrainerSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section: sectionId } = await params;
  const section = getTrainerPortalSection(sectionId);
  if (!section) notFound();

  return <TrainerPortalHub section={section} basePath="/trainer" />;
}
