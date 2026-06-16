import fs from "fs";
import path from "path";

import { getTrack, lessonsForTrack, type AcademyTrack } from "@/data/academyCourses";
import { worksheetFilename } from "@/lib/worksheets/filename";
import { renderLessonWorksheetPdf } from "@/lib/worksheets/render";

const trackId = "akc-cgc-prep";
const destDir = path.join(process.cwd(), "content/worksheets/akc-cgc-prep");

const track = getTrack(trackId);
if (!track) {
  console.error(`Track not found: ${trackId}`);
  process.exit(1);
}

const resolvedTrack = track as AcademyTrack;

fs.mkdirSync(destDir, { recursive: true });

async function main() {
  let generated = 0;

  for (const lesson of lessonsForTrack(trackId)) {
    const filename = worksheetFilename(resolvedTrack, lesson);
    const outPath = path.join(destDir, filename);
    const { buffer } = await renderLessonWorksheetPdf(lesson, resolvedTrack);
    fs.writeFileSync(outPath, buffer);
    generated++;
    console.log(`Wrote ${filename} (${buffer.length.toLocaleString()} bytes)`);
  }

  console.log(`Generated ${generated} AKC CGC Prep worksheets in ${destDir}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
