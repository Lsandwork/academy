import fs from "fs";
import path from "path";

import type { AcademyLesson, AcademyTrack } from "@/data/academyCourses";
import { lessonsForTrack } from "@/data/academyCourses";
import { worksheetFilename } from "./filename";

/** Premium designer-approved PDFs with corrected Fitdog logo branding. */
export const PUPPY_FOUNDATIONS_STATIC_TRACK_ID = "puppy-foundations";

const staticRoot = path.join(process.cwd(), "content/worksheets/puppy-foundations");

export function puppyFoundationsStaticDir() {
  return staticRoot;
}

export function staticWorksheetPath(track: AcademyTrack, lesson: AcademyLesson): string | null {
  if (track.id !== PUPPY_FOUNDATIONS_STATIC_TRACK_ID) return null;

  const filename = worksheetFilename(track, lesson);
  const filePath = path.join(staticRoot, filename);
  return fs.existsSync(filePath) ? filePath : null;
}

export function hasStaticWorksheet(track: AcademyTrack, lesson: AcademyLesson): boolean {
  return staticWorksheetPath(track, lesson) != null;
}

export function readStaticWorksheet(track: AcademyTrack, lesson: AcademyLesson): Buffer {
  const filePath = staticWorksheetPath(track, lesson);
  if (!filePath) {
    throw new Error(`Static worksheet missing for ${lesson.id} (${worksheetFilename(track, lesson)})`);
  }
  return fs.readFileSync(filePath);
}

export function verifyPuppyFoundationsStaticBundle(): string[] {
  const errors: string[] = [];
  const lessons = lessonsForTrack(PUPPY_FOUNDATIONS_STATIC_TRACK_ID);

  if (!fs.existsSync(staticRoot)) {
    return [`Static worksheet directory missing: ${staticRoot}`];
  }

  for (const lesson of lessons) {
    const track = { id: PUPPY_FOUNDATIONS_STATIC_TRACK_ID } as AcademyTrack;
    const filename = worksheetFilename(track, lesson);
    const filePath = path.join(staticRoot, filename);

    if (!fs.existsSync(filePath)) {
      errors.push(`Missing static PDF: ${filename}`);
      continue;
    }

    const stat = fs.statSync(filePath);
    if (stat.size < 80_000) {
      errors.push(`${filename}: file too small (${stat.size} bytes)`);
    }
  }

  return errors;
}
