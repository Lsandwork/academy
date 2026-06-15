import { CoursePreviewCard } from "@/components/pricing/CoursePreviewCard";
import { coursePreviewIntro, coursePreviews } from "@/data/pricingContent";

export function CoursePreviewSection() {
  return (
    <section className="border-t border-gray-100 pt-16">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-black text-charcoal md:text-4xl">See What&apos;s Inside Each Lesson</h2>
        <p className="mt-4 text-base leading-relaxed text-muted">{coursePreviewIntro}</p>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {coursePreviews.map((course) => (
          <CoursePreviewCard key={course.slug} course={course} />
        ))}
      </div>
    </section>
  );
}
