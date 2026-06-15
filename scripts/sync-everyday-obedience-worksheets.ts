import fs from "fs";
import path from "path";
import { execSync } from "child_process";

import { getTrack, lessonsForTrack } from "@/data/academyCourses";
import { worksheetFilename } from "@/lib/worksheets/filename";

const zipPath =
  process.argv[2] || path.join(process.env.HOME || "", "Downloads/fitdog_every_day_obedience_worksheets_FIXED_LOGO.zip");
const destDir = path.join(process.cwd(), "content/worksheets/everyday-obedience");
const bundleFolder = "fitdog_every_day_obedience_worksheets_FIXED_LOGO";
const trackId = "everyday-obedience";

if (!fs.existsSync(zipPath)) {
  console.error(`Zip not found: ${zipPath}`);
  process.exit(1);
}

const track = getTrack(trackId);
if (!track) {
  console.error(`Track not found: ${trackId}`);
  process.exit(1);
}

const tmp = path.join(process.cwd(), ".tmp-everyday-obedience-worksheets-sync");
fs.rmSync(tmp, { recursive: true, force: true });
fs.mkdirSync(tmp, { recursive: true });

execSync(`unzip -q -o "${zipPath}" -d "${tmp}"`, { stdio: "inherit" });

const bundleDir = path.join(tmp, bundleFolder);
if (!fs.existsSync(bundleDir)) {
  console.error(`Expected ${bundleFolder}/ inside zip.`);
  process.exit(1);
}

fs.mkdirSync(destDir, { recursive: true });

let synced = 0;

for (const lesson of lessonsForTrack(trackId)) {
  const canonical = worksheetFilename(track, lesson);
  const zipName = `fitdog-every-day-obedience-${lesson.id}-worksheet.pdf`;
  const sourcePath = path.join(bundleDir, zipName);

  if (!fs.existsSync(sourcePath)) {
    console.error(`Missing in zip: ${zipName}`);
    process.exit(1);
  }

  fs.copyFileSync(sourcePath, path.join(destDir, canonical));
  synced++;
}

for (const file of ["manifest.json", "README.txt"] as const) {
  const source = path.join(bundleDir, file);
  if (fs.existsSync(source)) {
    fs.copyFileSync(source, path.join(destDir, file));
  }
}

fs.rmSync(tmp, { recursive: true, force: true });
console.log(`Synced ${synced} Everyday Obedience worksheets to ${destDir}`);
