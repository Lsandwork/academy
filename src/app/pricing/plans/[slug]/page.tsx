import { notFound } from "next/navigation";
import { getCoursePreview } from "@/data/pricingContent";
import { getCurrentUser } from "@/lib/auth";
import LessonPlanClient from "./LessonPlanClient";

export default async function LessonPlanPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = getCoursePreview(slug);
  if (!course) notFound();

  const user = await getCurrentUser();
  return <LessonPlanClient course={course} user={user} />;
}
