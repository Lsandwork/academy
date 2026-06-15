import fs from "fs";
import path from "path";

export type WorksheetBrandAssets = {
  wordmarkWhite: string;
  wordmarkCharcoal: string;
  dogHead: string;
  academyLockup: string;
};

function resolveLogo(name: string, fallbacks: string[] = []): string {
  const candidates = [
    path.join(process.cwd(), "public/assets/fitdog-academy/logos", name),
    path.join(process.cwd(), "content/worksheets/puppy-foundations/assets", name),
    ...fallbacks
  ];

  for (const filePath of candidates) {
    if (fs.existsSync(filePath)) return filePath;
  }

  throw new Error(`Fitdog brand asset missing: ${name}`);
}

/** react-pdf renders embedded images most reliably from data URIs on serverless. */
function toDataUri(filePath: string): string {
  const buf = fs.readFileSync(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const mime = ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" : "image/png";
  return `data:${mime};base64,${buf.toString("base64")}`;
}

export function getWorksheetBrandAssets(): WorksheetBrandAssets {
  const files = {
    wordmarkWhite: resolveLogo("fitdog-wordmark-white-transparent.png"),
    wordmarkCharcoal: resolveLogo("fitdog-wordmark-charcoal-transparent.png"),
    dogHead: resolveLogo("fitdog-dog-head-orange-transparent.png", ["fitdog-logo-provided-clean.png"]),
    academyLockup: resolveLogo("fitdog-academy-lockup-light-transparent.png")
  };

  return {
    wordmarkWhite: toDataUri(files.wordmarkWhite),
    wordmarkCharcoal: toDataUri(files.wordmarkCharcoal),
    dogHead: toDataUri(files.dogHead),
    academyLockup: toDataUri(files.academyLockup)
  };
}
