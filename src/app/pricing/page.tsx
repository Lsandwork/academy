import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth";
import { PublicHeader } from "@/components/PublicHeader";
import PricingClient from "./PricingClient";

export default async function PricingPage() {
  const user = await getCurrentUser();

  return (
    <>
      {!user && <PublicHeader dark />}
      <Suspense>
        <PricingClient user={user} />
      </Suspense>
    </>
  );
}
