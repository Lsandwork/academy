import fs from "fs";
import path from "path";

import { getTrack, lessonsForTrack } from "@/data/academyCourses";
import { worksheetFilename } from "@/lib/worksheets/filename";
import { renderLessonWorksheetPdf } from "@/lib/worksheets/render";

const trackId = "fitdog-enrichment-at-home";
const destDir = path.join(process.cwd(), "content/worksheets/fitdog-enrichment-at-home");

const track = getTrack(trackId);
if (!track) {
  console.error(`Track not found: ${trackId}`);
  process.exit(1);
}

fs.mkdirSync(destDir, { recursive: true });

async function main() {
  let generated = 0;

  for (const lesson of lessonsForTrack(trackId)) {
    const filename = worksheetFilename(track, lesson);
    const outPath = path.join(destDir, filename);
    const { buffer } = await renderLessonWorksheetPdf(lesson, track);
    fs.writeFileSync(outPath, buffer);
    generated++;
    console.log(`Wrote ${filename} (${buffer.length.toLocaleString()} bytes)`);
  }

  console.log(`Generated ${generated} Fitdog Enrichment at Home worksheets in ${destDir}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
