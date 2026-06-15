import Link from "next/link";
import type { CoursePreview } from "@/data/pricingContent";

export function CoursePreviewCard({ course }: { course: CoursePreview }) {
  return (
    <article className="flex h-full flex-col rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition hover:border-orange/20 hover:shadow-md">
      <h3 className="text-xl font-black text-charcoal">{course.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{course.description}</p>

      <div className="mt-5">
        <p className="text-xs font-black uppercase tracking-wide text-muted">Lesson preview</p>
        <ul className="mt-3 space-y-2">
          {course.modules.slice(0, 6).map((module) => (
            <li key={module} className="flex items-start gap-2 text-sm text-charcoal">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-orange" aria-hidden />
              <span>{module}</span>
            </li>
          ))}
        </ul>
      </div>

      <Link
        href={`/pricing/plans/${course.slug}`}
        className="mt-6 inline-flex w-full items-center justify-center rounded-full border border-gray-200 py-3 text-sm font-bold text-charcoal transition hover:border-orange/30 hover:text-orange"
      >
        {course.cta}
      </Link>
    </article>
  );
}
