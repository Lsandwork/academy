import { NextRequest, NextResponse } from "next/server";
import { getLesson, getTrack } from "@/data/academyCourses";
import { getCurrentUser } from "@/lib/auth";
import { worksheetFilename } from "@/lib/worksheets/filename";
import { getLessonWorksheetPdf } from "@/lib/worksheets/getWorksheetPdf";
import { hasLessonAccess } from "@/lib/user";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ lessonId: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Please sign in to download worksheets." }, { status: 401 });
  }

  const { lessonId } = await params;
  const lesson = getLesson(lessonId);
  if (!lesson) {
    return NextResponse.json({ error: "Lesson not found." }, { status: 404 });
  }

  const track = getTrack(lesson.trackId);
  if (!track) {
    return NextResponse.json({ error: "Course not found." }, { status: 404 });
  }

  if (!hasLessonAccess(user, lessonId, lesson.isFreePreview)) {
    return NextResponse.json({ error: "You do not have access to this worksheet." }, { status: 403 });
  }

  try {
    const { buffer } = await getLessonWorksheetPdf(lesson, track);
    const filename = worksheetFilename(track, lesson);

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "private, max-age=3600"
      }
    });
  } catch (error) {
    console.error("worksheet/pdf", error);
    return NextResponse.json({ error: "Could not generate worksheet PDF." }, { status: 500 });
  }
}
