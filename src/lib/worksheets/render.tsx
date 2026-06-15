import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import type { AcademyLesson, AcademyTrack } from "@/data/academyCourses";
import { buildWorksheetContent } from "./buildContent";
import { WorksheetDocument } from "./pdf/WorksheetDocument";

export async function renderLessonWorksheetPdf(lesson: AcademyLesson, track: AcademyTrack) {
  const content = buildWorksheetContent(lesson, track);
  const buffer = await renderToBuffer(<WorksheetDocument content={content} />);
  return { buffer, content };
}
