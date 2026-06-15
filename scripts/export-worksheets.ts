import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { academyLessons, academyTracks, getTrack } from "@/data/academyCourses";
import { buildWorksheetContent, worksheetPageCount, worksheetSectionCount } from "@/lib/worksheets/buildContent";
import { worksheetFilename } from "@/lib/worksheets/filename";
import { getLessonWorksheetPdf } from "@/lib/worksheets/getWorksheetPdf";
import { hasStaticWorksheet } from "@/lib/worksheets/staticWorksheets";

export type WorksheetAuditResult = {
  lessonId: string;
  filename: string;
  source: "static" | "generated";
  pages: number;
  sections: number | null;
  bytes: number;
  hasBrandImages: boolean;
  ok: boolean;
  issues: string[];
};

function pdfPageCount(buffer: Buffer): number {
  const text = buffer.toString("latin1");
  const matches = text.match(/\/Type\s*\/Page[^s]/g);
  return matches?.length ?? 0;
}

function hasEmbeddedBrandImages(buffer: Buffer): boolean {
  const text = buffer.toString("latin1");
  return text.includes("/Subtype /Image") && (text.includes("FlateDecode") || text.includes("DCTDecode"));
}

export async function auditWorksheetPdf(lessonId: string, buffer: Buffer, filename: string): Promise<WorksheetAuditResult> {
  const lesson = academyLessons.find((l) => l.id === lessonId)!;
  const track = getTrack(lesson.trackId)!;
  const isStatic = hasStaticWorksheet(track, lesson);
  const content = isStatic ? null : buildWorksheetContent(lesson, track);
  const issues: string[] = [];

  const pages = pdfPageCount(buffer);
  const sections = content ? worksheetSectionCount(content) : null;
  const bytes = buffer.length;
  const brand = hasEmbeddedBrandImages(buffer);

  if (pages < 2 || pages > 4) issues.push(`page count ${pages} (expected 2–4)`);
  if (bytes < (isStatic ? 80_000 : 35_000)) issues.push(`file too small (${bytes} bytes)`);
  if (!brand) issues.push("missing embedded brand images");

  if (isStatic) {
    if (track.id !== "puppy-foundations") issues.push("unexpected static bundle track");
  } else {
    if (!content || sections! < 5) issues.push(`only ${sections} sections (expected 5+)`);
    if (!content?.trainingGoal) issues.push("missing training goal");
    if (!content?.pages[0]?.sections?.length) issues.push("cover page has no sections");
  }

  return {
    lessonId,
    filename,
    source: isStatic ? "static" : "generated",
    pages,
    sections,
    bytes,
    hasBrandImages: brand,
    ok: issues.length === 0,
    issues
  };
}

export async function exportAllWorksheets(outDir: string) {
  fs.mkdirSync(outDir, { recursive: true });

  const manifest: { course: string; lesson: string; file: string; source: string; pages: number; bytes: number }[] = [];
  const auditResults: WorksheetAuditResult[] = [];

  for (const track of academyTracks) {
    const trackDir = path.join(outDir, track.id);
    fs.mkdirSync(trackDir, { recursive: true });
  }

  for (const lesson of academyLessons) {
    const track = getTrack(lesson.trackId);
    if (!track) throw new Error(`Missing track for ${lesson.id}`);

    const { buffer, source } = await getLessonWorksheetPdf(lesson, track);
    const filename = worksheetFilename(track, lesson);
    const relPath = `${track.id}/${filename}`;
    const fullPath = path.join(outDir, relPath);

    fs.writeFileSync(fullPath, buffer);

    const audit = await auditWorksheetPdf(lesson.id, buffer, filename);
    auditResults.push(audit);

    manifest.push({
      course: track.title,
      lesson: lesson.title,
      file: relPath,
      source,
      pages: audit.pages,
      bytes: audit.bytes
    });
  }

  fs.writeFileSync(path.join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2));

  const indexLines = [
    "Fitdog Training Academy — Premium Worksheet Bundle",
    `Generated: ${new Date().toISOString()}`,
    `Lessons: ${academyLessons.length}`,
    "",
    ...academyTracks.flatMap((track) => {
      const lessons = academyLessons.filter((l) => l.trackId === track.id);
      return [
        `${track.title} (${lessons.length} worksheets)`,
        ...lessons.map((l) => {
          const file = manifest.find((m) => m.lesson === l.title)?.file ?? "";
          return `  - ${l.title}: ${file}`;
        }),
        ""
      ];
    })
  ];

  fs.writeFileSync(path.join(outDir, "FITDOG_WORKSHEET_INDEX.txt"), indexLines.join("\n"));

  const zipPath = `${outDir}.zip`;
  if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
  execSync(`cd "${path.dirname(outDir)}" && zip -rq "${path.basename(zipPath)}" "${path.basename(outDir)}"`, { stdio: "inherit" });

  return { outDir, zipPath, manifest, auditResults };
}

async function main() {
  const outDir = process.argv[2] || path.join(process.cwd(), "exports", "fitdog_academy_all_lesson_worksheets");
  console.log(`Exporting ${academyLessons.length} worksheets to ${outDir}...`);

  const { auditResults, zipPath } = await exportAllWorksheets(outDir);
  const passed = auditResults.filter((r) => r.ok);
  const failed = auditResults.filter((r) => !r.ok);

  console.log(`\nAudit: ${passed.length}/${auditResults.length} passed`);

  if (failed.length) {
    console.error("\nFailed audits:");
    for (const r of failed) {
      console.error(`  ${r.lessonId}: ${r.issues.join("; ")}`);
    }
    process.exit(1);
  }

  const pageCounts = auditResults.map((r) => r.pages);
  const avgBytes = Math.round(auditResults.reduce((s, r) => s + r.bytes, 0) / auditResults.length);
  console.log(`Pages: ${Math.min(...pageCounts)}–${Math.max(...pageCounts)} per worksheet`);
  console.log(`Average size: ${(avgBytes / 1024).toFixed(1)} KB`);
  console.log(`Zip: ${zipPath}`);
  console.log("All worksheets passed quality audit.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
