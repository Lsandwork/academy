import type { AcademyLesson, AcademyTrack } from "@/data/academyCourses";
import { readStaticWorksheet, hasStaticWorksheet } from "./staticWorksheets";
import { renderLessonWorksheetPdf } from "./render";
import type { WorksheetContent } from "./types";

export type WorksheetPdfResult = {
  buffer: Buffer;
  source: "static" | "generated";
  content?: WorksheetContent;
};

/** Serves premium static PDFs when available; otherwise renders dynamically. */
export async function getLessonWorksheetPdf(lesson: AcademyLesson, track: AcademyTrack): Promise<WorksheetPdfResult> {
  if (hasStaticWorksheet(track, lesson)) {
    return {
      buffer: readStaticWorksheet(track, lesson),
      source: "static"
    };
  }

  const { buffer, content } = await renderLessonWorksheetPdf(lesson, track);
  return { buffer, source: "generated", content };
}
