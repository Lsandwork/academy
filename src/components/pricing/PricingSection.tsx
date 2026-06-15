import { PricingCard } from "@/components/pricing/PricingCard";
import { TrustBadgeRow } from "@/components/pricing/TrustBadge";
import {
  addonSessionNote,
  mainPricingPlans,
  pricingHeadline,
  pricingSubheadline,
  specialtyPrograms,
  trainerSessionMicrocopy,
  trustBadges
} from "@/data/pricingContent";

type PricingSectionProps = {
  onPlanSelect: (planId: string) => void;
  loadingPlanId?: string | null;
};

export function PricingSection({ onPlanSelect, loadingPlanId }: PricingSectionProps) {
  return (
    <section className="space-y-16">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-3xl font-black tracking-tight text-charcoal md:text-4xl lg:text-5xl">{pricingHeadline}</h1>
        <p className="mt-4 text-base leading-relaxed text-muted md:text-lg">{pricingSubheadline}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4 xl:items-stretch">
        {mainPricingPlans.map((plan) => (
          <div key={plan.id} className={plan.featured ? "order-first md:order-none" : ""}>
            <PricingCard
              plan={plan}
              onSelect={() => onPlanSelect(plan.id)}
              loading={loadingPlanId === plan.id}
            />
          </div>
        ))}
      </div>

      <p className="text-center text-xs leading-relaxed text-muted">{trainerSessionMicrocopy}</p>

      <div>
        <div className="mb-8 text-center">
          <p className="text-sm font-black uppercase tracking-[0.15em] text-orange">Specialty Programs</p>
          <h2 className="mt-2 text-2xl font-black text-charcoal md:text-3xl">AKC Canine Good Citizen Prep</h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted">
            Prepare online with professional guidance. Official AKC testing may require an approved evaluator and separate fees—we&apos;ll help you understand the process.
          </p>
        </div>

        <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
          {specialtyPrograms.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              onSelect={() => onPlanSelect(plan.id)}
              loading={loadingPlanId === plan.id}
            />
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-dashed border-gray-200 bg-white/70 px-6 py-4 text-center">
        <p className="text-sm font-semibold text-charcoal">{addonSessionNote}</p>
      </div>

      <TrustBadgeRow items={trustBadges} />
    </section>
  );
}
