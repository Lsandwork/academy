import { academyLessons, getTrack } from "@/data/academyCourses";
import { buildWorksheetContent, worksheetPageCount, worksheetSectionCount } from "@/lib/worksheets/buildContent";
import { worksheetFilename } from "@/lib/worksheets/filename";

import { verifyPuppyFoundationsStaticBundle, hasStaticWorksheet } from "@/lib/worksheets/staticWorksheets";

const staticErrors = verifyPuppyFoundationsStaticBundle();
if (staticErrors.length) {
  console.error("Puppy Foundations static bundle errors:");
  console.error(staticErrors.join("\n"));
  process.exit(1);
}

let ok = 0;
const errors: string[] = [];

for (const lesson of academyLessons) {
  const track = getTrack(lesson.trackId);
  if (!track) {
    errors.push(`Missing track for ${lesson.id}`);
    continue;
  }

  const filename = worksheetFilename(track, lesson);

  if (hasStaticWorksheet(track, lesson)) {
    if (!filename.includes(track.id) || !filename.includes(lesson.id)) errors.push(`${lesson.id}: bad filename ${filename}`);
    ok++;
    continue;
  }

  const content = buildWorksheetContent(lesson, track);
  const pages = worksheetPageCount(content);
  const sections = worksheetSectionCount(content);

  if (!content.pages.length) errors.push(`${lesson.id}: no pages`);
  if (pages < 2 || pages > 4) errors.push(`${lesson.id}: ${pages} pages (expected 2–4)`);
  if (sections < 5) errors.push(`${lesson.id}: only ${sections} sections`);
  if (!filename.includes(track.id) || !filename.includes(lesson.id)) errors.push(`${lesson.id}: bad filename ${filename}`);
  if (!content.trainingGoal) errors.push(`${lesson.id}: missing goal`);
  if (!content.pages[0]?.sections?.length) errors.push(`${lesson.id}: empty cover sections`);
  if (!content.pages[0]?.ruleCards?.length && content.pages[0]?.isCover) errors.push(`${lesson.id}: missing rule cards on cover`);

  ok++;
}

console.log(`Worksheets verified: ${ok}/${academyLessons.length}`);
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
