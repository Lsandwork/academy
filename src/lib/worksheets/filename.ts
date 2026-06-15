import type { AcademyLesson, AcademyTrack } from "@/data/academyCourses";

export function worksheetFilename(track: AcademyTrack, lesson: AcademyLesson) {
  return `fitdog-${track.id}-${lesson.id}-worksheet.pdf`;
}
