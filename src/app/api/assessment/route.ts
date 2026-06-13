import { NextRequest, NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { recommendTrackFromAnswers } from "@/data/assessment";
import { getTrack } from "@/data/academyCourses";
import { toSafeUser } from "@/lib/user";

export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const { answers } = await req.json();

    if (!answers || typeof answers !== "object") {
      return NextResponse.json({ error: "answers object is required." }, { status: 400 });
    }

    const trackId = recommendTrackFromAnswers(answers);
    const track = getTrack(trackId);
    if (!track) {
      return NextResponse.json({ error: "Invalid recommendation." }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { assessmentResult: JSON.stringify({ trackId, answers, completedAt: new Date().toISOString() }) }
    });

    return NextResponse.json({ user: toSafeUser(updated), trackId, trackTitle: track.title });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
