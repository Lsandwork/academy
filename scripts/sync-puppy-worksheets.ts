import fs from "fs";
import path from "path";
import { execSync } from "child_process";

const zipPath = process.argv[2] || path.join(process.env.HOME || "", "Downloads/fitdog_puppy_foundations_worksheets_FIXED_LOGO.zip");
const destDir = path.join(process.cwd(), "content/worksheets/puppy-foundations");

if (!fs.existsSync(zipPath)) {
  console.error(`Zip not found: ${zipPath}`);
  process.exit(1);
}

const tmp = path.join(process.cwd(), ".tmp-puppy-worksheets-sync");
fs.rmSync(tmp, { recursive: true, force: true });
fs.mkdirSync(tmp, { recursive: true });

execSync(`unzip -q -o "${zipPath}" -d "${tmp}"`, { stdio: "inherit" });

const bundleDir = path.join(tmp, "fitdog_puppy_foundations_worksheets_FIXED_LOGO");
if (!fs.existsSync(bundleDir)) {
  console.error("Expected fitdog_puppy_foundations_worksheets_FIXED_LOGO/ inside zip.");
  process.exit(1);
}

fs.mkdirSync(destDir, { recursive: true });
fs.mkdirSync(path.join(destDir, "assets"), { recursive: true });

for (const file of fs.readdirSync(bundleDir)) {
  if (file.endsWith(".pdf") || file === "manifest.json" || file === "README.txt") {
    fs.copyFileSync(path.join(bundleDir, file), path.join(destDir, file));
  }
}

const assetsDir = path.join(bundleDir, "assets");
if (fs.existsSync(assetsDir)) {
  for (const file of fs.readdirSync(assetsDir)) {
    if (file.endsWith(".png")) {
      fs.copyFileSync(path.join(assetsDir, file), path.join(destDir, "assets", file));
    }
  }
}

fs.rmSync(tmp, { recursive: true, force: true });

const pdfs = fs.readdirSync(destDir).filter((f) => f.endsWith(".pdf"));
console.log(`Synced ${pdfs.length} Puppy Foundations worksheets to ${destDir}`);
