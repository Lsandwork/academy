import { academyLessons, getTrack } from "@/data/academyCourses";
import { buildWorksheetContent } from "@/lib/worksheets/buildContent";
import { worksheetFilename } from "@/lib/worksheets/filename";

let ok = 0;
const errors: string[] = [];

for (const lesson of academyLessons) {
  const track = getTrack(lesson.trackId);
  if (!track) {
    errors.push(`Missing track for ${lesson.id}`);
    continue;
  }

  const content = buildWorksheetContent(lesson, track);
  const filename = worksheetFilename(track, lesson);

  if (!content.pages.length) errors.push(`${lesson.id}: no pages`);
  if (!filename.includes(track.id) || !filename.includes(lesson.id)) errors.push(`${lesson.id}: bad filename ${filename}`);
  if (!content.trainingGoal) errors.push(`${lesson.id}: missing goal`);

  ok++;
}

console.log(`Worksheets verified: ${ok}/${academyLessons.length}`);
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
