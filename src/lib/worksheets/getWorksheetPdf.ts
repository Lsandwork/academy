import type { AcademyLesson, AcademyTrack } from "@/data/academyCourses";
import { isStaticWorksheetTrack, readStaticWorksheet } from "./staticWorksheets";
import type { WorksheetContent } from "./types";

export type WorksheetPdfResult = {
  buffer: Buffer;
  source: "static" | "generated";
  content?: WorksheetContent;
};

/**
 * Serve premium static PDFs when available. Only dynamically import react-pdf
 * for tracks without a static bundle — keeps the worksheet API reliable on Vercel.
 */
export async function getLessonWorksheetPdf(lesson: AcademyLesson, track: AcademyTrack): Promise<WorksheetPdfResult> {
  if (isStaticWorksheetTrack(track.id)) {
    try {
      return {
        buffer: readStaticWorksheet(track, lesson),
        source: "static"
      };
    } catch (staticError) {
      console.warn("worksheet/static-miss", lesson.id, staticError);
      // Fall through to generated PDF if static file missing in deployment bundle.
    }
  }

  const { renderLessonWorksheetPdf } = await import("./render");
  const { buffer, content } = await renderLessonWorksheetPdf(lesson, track);
  return { buffer, source: "generated", content };
}
