import Image from "next/image";
import { fitdogAcademyAssets } from "@/assets/fitdogAcademyAssets";
import type { PricingCardPlan } from "@/data/pricingContent";

type PricingCardProps = {
  plan: PricingCardPlan;
  onSelect?: () => void;
  loading?: boolean;
  compact?: boolean;
};

export function PricingCard({ plan, onSelect, loading, compact }: PricingCardProps) {
  const isFeatured = plan.featured;

  return (
    <article
      className={`relative flex h-full flex-col rounded-3xl border bg-white p-6 transition ${
        isFeatured
          ? "border-orange shadow-xl shadow-orange/10 ring-1 ring-orange/20 lg:scale-[1.02]"
          : "border-gray-100 shadow-sm hover:border-orange/20 hover:shadow-md"
      } ${compact ? "p-5" : "p-6 md:p-7"}`}
    >
      {plan.badge && (
        <span
          className={`absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-wide ${
            isFeatured ? "bg-orange text-white shadow-md" : "bg-charcoal text-white"
          }`}
        >
          {plan.badge}
        </span>
      )}

      <div className={plan.badge ? "pt-2" : ""}>
        <h3 className="text-xl font-black text-charcoal">{plan.name}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted">{plan.subtitle}</p>

        <div className="mt-5 flex items-end gap-1">
          <p className={`font-black text-charcoal ${isFeatured ? "text-4xl" : "text-3xl"}`}>{plan.price}</p>
          {plan.frequency && (
            <p className="pb-1 text-sm font-semibold text-muted">
              {plan.frequency === "one-time" ? plan.frequency : plan.frequency}
            </p>
          )}
        </div>

        {plan.note && <p className="mt-2 text-xs font-medium italic text-muted">{plan.note}</p>}
        {plan.microcopy && <p className="mt-2 text-xs leading-relaxed text-muted">{plan.microcopy}</p>}
      </div>

      <ul className="mt-6 flex-1 space-y-2.5">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-sm leading-relaxed text-charcoal">
            <Image
              src={fitdogAcademyAssets.icons.ui.check}
              alt=""
              width={16}
              height={16}
              aria-hidden
              className="mt-0.5 shrink-0 opacity-80"
            />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      {onSelect && (
        <button
          type="button"
          onClick={onSelect}
          disabled={loading}
          className={`mt-7 w-full rounded-full py-3.5 text-sm font-bold transition disabled:opacity-60 ${
            isFeatured
              ? "bg-orange text-white shadow-lg shadow-orange/25 hover:bg-orange-dark"
              : "border border-gray-200 bg-white text-charcoal hover:border-orange/30 hover:text-orange"
          }`}
        >
          {loading ? "Redirecting…" : plan.cta}
        </button>
      )}
    </article>
  );
}
