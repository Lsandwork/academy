import Link from "next/link";
import { trainerPortalHref, type TrainerPortalSection } from "@/data/trainerPortalNav";

export function TrainerPortalHub({
  section,
  basePath
}: {
  section: TrainerPortalSection;
  basePath: string;
}) {
  return (
    <div>
      <p className="text-sm font-black uppercase tracking-[0.15em] text-orange">{section.label}</p>
      <h1 className="mt-2 text-3xl font-black text-charcoal">{section.label}</h1>
      <p className="mt-3 max-w-2xl text-muted">{section.description}</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {section.items.map((item) => (
          <Link
            key={item.slug}
            href={trainerPortalHref(basePath, section.id, item.slug)}
            className="group rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100 transition hover:-translate-y-0.5 hover:ring-orange/25"
          >
            <h2 className="text-lg font-black text-charcoal group-hover:text-orange">{item.label}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{item.description}</p>
            <span className="mt-4 inline-flex text-sm font-bold text-orange">Open →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
