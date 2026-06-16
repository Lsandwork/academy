import { requireTrainerPortalUser } from "@/lib/trainerPortalAccess";
import { TrainerPortalShell } from "@/components/trainer/TrainerPortalShell";

export default async function TrainerPortalLayout({ children }: { children: React.ReactNode }) {
  const user = await requireTrainerPortalUser();

  return (
    <TrainerPortalShell user={user} basePath="/trainer" portalTitle="Trainer Portal">
      {children}
    </TrainerPortalShell>
  );
}
