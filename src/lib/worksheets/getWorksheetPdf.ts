import type { AcademyLesson, AcademyTrack } from "@/data/academyCourses";
import { isStaticWorksheetTrack, readStaticWorksheet } from "./staticWorksheets";
import { renderLessonWorksheetPdf } from "./render";
import type { WorksheetContent } from "./types";

export type WorksheetPdfResult = {
  buffer: Buffer;
  source: "static" | "generated";
  content?: WorksheetContent;
};

/**
 * Premium static tracks (Puppy Foundations, Everyday Obedience) must never
 * fall back to auto-generated PDFs — those are client-facing quality issues.
 */
export async function getLessonWorksheetPdf(lesson: AcademyLesson, track: AcademyTrack): Promise<WorksheetPdfResult> {
  if (isStaticWorksheetTrack(track.id)) {
    return {
      buffer: readStaticWorksheet(track, lesson),
      source: "static"
    };
  }

  const { buffer, content } = await renderLessonWorksheetPdf(lesson, track);
  return { buffer, source: "generated", content };
}
