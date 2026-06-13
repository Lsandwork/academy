import { notFound, redirect } from "next/navigation";
import { getTrack } from "@/data/academyCourses";
import { getCurrentUser } from "@/lib/auth";
import TrackCurriculumClient from "./TrackCurriculumClient";

export default async function TrackCurriculumPage({ params }: { params: Promise<{ trackId: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { trackId } = await params;
  const track = getTrack(trackId);
  if (!track) notFound();

  return <TrackCurriculumClient track={track} user={user} />;
}
