import fs from "fs";
import path from "path";

import type { AcademyLesson, AcademyTrack } from "@/data/academyCourses";
import { lessonsForTrack } from "@/data/academyCourses";
import { worksheetFilename } from "./filename";

/** Tracks served from premium designer PDF bundles (fixed Fitdog logo). */
export const STATIC_WORKSHEET_TRACKS = {
  "puppy-foundations": {
    dir: "content/worksheets/puppy-foundations",
    minBytes: 80_000
  },
  "everyday-obedience": {
    dir: "content/worksheets/everyday-obedience",
    minBytes: 80_000
  },
  "calm-home-skills": {
    dir: "content/worksheets/calm-home-skills",
    minBytes: 80_000
  },
  "separation-support": {
    dir: "content/worksheets/separation-support",
    minBytes: 80_000
  },
  "leash-reactivity-reset": {
    dir: "content/worksheets/leash-reactivity-reset",
    minBytes: 80_000
  },
  "fitdog-enrichment-at-home": {
    dir: "content/worksheets/fitdog-enrichment-at-home",
    minBytes: 80_000
  },
  "akc-cgc-prep": {
    dir: "content/worksheets/akc-cgc-prep",
    minBytes: 80_000
  }
} as const;

export type StaticWorksheetTrackId = keyof typeof STATIC_WORKSHEET_TRACKS;

export function isStaticWorksheetTrack(trackId: string): trackId is StaticWorksheetTrackId {
  return trackId in STATIC_WORKSHEET_TRACKS;
}

function staticRootForTrack(trackId: StaticWorksheetTrackId): string {
  return path.join(process.cwd(), STATIC_WORKSHEET_TRACKS[trackId].dir);
}

export function staticWorksheetPath(track: AcademyTrack, lesson: AcademyLesson): string | null {
  if (!isStaticWorksheetTrack(track.id)) return null;

  const filename = worksheetFilename(track, lesson);
  const filePath = path.join(staticRootForTrack(track.id), filename);
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

export function verifyStaticWorksheetBundle(trackId: StaticWorksheetTrackId): string[] {
  const errors: string[] = [];
  const config = STATIC_WORKSHEET_TRACKS[trackId];
  const root = path.join(process.cwd(), config.dir);
  const lessons = lessonsForTrack(trackId);

  if (!fs.existsSync(root)) {
    return [`Static worksheet directory missing: ${root}`];
  }

  for (const lesson of lessons) {
    const track = { id: trackId } as AcademyTrack;
    const filename = worksheetFilename(track, lesson);
    const filePath = path.join(root, filename);

    if (!fs.existsSync(filePath)) {
      errors.push(`[${trackId}] Missing static PDF: ${filename}`);
      continue;
    }

    const stat = fs.statSync(filePath);
    if (stat.size < config.minBytes) {
      errors.push(`[${trackId}] ${filename}: file too small (${stat.size} bytes)`);
    }
  }

  return errors;
}

export function verifyAllStaticWorksheetBundles(): string[] {
  return (Object.keys(STATIC_WORKSHEET_TRACKS) as StaticWorksheetTrackId[]).flatMap(verifyStaticWorksheetBundle);
}

/** @deprecated Use verifyStaticWorksheetBundle("puppy-foundations") */
export function verifyPuppyFoundationsStaticBundle(): string[] {
  return verifyStaticWorksheetBundle("puppy-foundations");
}
