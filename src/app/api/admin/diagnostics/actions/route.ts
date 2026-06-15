import { NextRequest, NextResponse } from "next/server";
import { academyLessons, academyTracks, getLesson, getTrack, pricingPlans } from "@/data/academyCourses";
import { recommendTrackFromAnswers } from "@/data/assessment";
import { requireAdmin, getCurrentUser } from "@/lib/auth";
import { runDiagnostics } from "@/lib/diagnostics";
import { logError } from "@/lib/errors";
import { getLessonVideoUrl, isVideoCdnConfigured } from "@/lib/lessonMedia";
import { hasLessonAccess } from "@/lib/user";
import { stripe, stripePrices } from "@/lib/stripe";
import { fitdogAcademyAssets } from "@/assets/fitdogAcademyAssets";
import { sendTrainerTestEmail } from "@/lib/trainerNotify";
import { getLessonWorksheetPdf } from "@/lib/worksheets/getWorksheetPdf";

export async function POST(req: NextRequest) {
  try {
    await requireAdmin();
    const { action } = await req.json();

    switch (action) {
      case "run_full": {
        const report = await runDiagnostics();
        return NextResponse.json({ ok: true, action, report });
      }

      case "test_videos": {
        const results = academyLessons.map((lesson) => {
          const url = getLessonVideoUrl(lesson);
          return { lesson: lesson.title, status: url ? "ok" : "missing", url: url ?? null };
        });
        const connected = results.filter((r) => r.status === "ok").length;
        const cdn = isVideoCdnConfigured();
        return NextResponse.json({
          ok: connected > 0,
          action,
          message: connected
            ? cdn
              ? `${connected}/${academyLessons.length} videos configured`
              : `${connected}/${academyLessons.length} lessons using preview embeds (FITDOG_VIDEO_CDN not set)`
            : "No lesson videos available.",
          results: results.slice(0, 15)
        });
      }

      case "test_payments": {
        if (!stripe) {
          return NextResponse.json({ ok: false, action, message: "Stripe not configured." });
        }
        const missing = pricingPlans.filter((p) => !stripePrices[p.id]).map((p) => p.title);
        return NextResponse.json({
          ok: missing.length === 0,
          action,
          message: missing.length ? `Missing price IDs: ${missing.join(", ")}` : "All 3 pricing products configured.",
          plans: pricingPlans.map((p) => ({ title: p.title, priceId: stripePrices[p.id] || null }))
        });
      }

      case "test_email": {
        const admin = await getCurrentUser();
        const to = process.env.TRAINER_TEST_EMAIL || admin?.email;
        if (!to) {
          return NextResponse.json({ ok: false, action, message: "No test email address available." });
        }
        const result = await sendTrainerTestEmail(to);
        return NextResponse.json({ ok: result.ok, action, message: result.message });
      }

      case "export_report": {
        const report = await runDiagnostics();
        return NextResponse.json({ ok: true, action, report });
      }

      case "check_locked_content": {
        const freeUser = {
          id: "test",
          supabaseId: null,
          email: "test@test.com",
          role: "USER" as const,
          accessLevel: "FREE" as const,
          creditBalance: 0,
          purchasedLessonIds: "[]",
          completedLessonIds: "[]",
          favoriteLessonIds: "[]",
          lastOpenedLessonId: null,
          assessmentResult: null,
          name: null,
          avatarUrl: null,
          stripeCustomerId: null,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        const paidLessons = academyLessons.filter((l) => !l.isFreePreview);
        const lockedOk = paidLessons.every((l) => !hasLessonAccess(freeUser, l.id, l.isFreePreview));
        const previewsOk = academyLessons.filter((l) => l.isFreePreview).every((l) => hasLessonAccess(freeUser, l.id, l.isFreePreview));
        return NextResponse.json({
          ok: lockedOk && previewsOk,
          action,
          message: lockedOk && previewsOk ? "Locked content protected for free users." : "Access control issue detected."
        });
      }

      case "check_images": {
        const assets = [
          fitdogAcademyAssets.logos.dogHead64,
          fitdogAcademyAssets.hero.landingHero,
          fitdogAcademyAssets.coursePhotos.puppyFoundations,
          fitdogAcademyAssets.coursePhotos.everydayObedience
        ];
        return NextResponse.json({
          ok: true,
          action,
          message: "Key landing and course image paths configured in asset map.",
          assets
        });
      }

      case "run_assessment_test": {
        const cases = [
          { answer: "puppy-biting", expected: "puppy-foundations" },
          { answer: "leash-pulling", expected: "everyday-obedience" },
          { answer: "alone-panic", expected: "separation-support" },
          { answer: "barking-lunging", expected: "leash-reactivity-reset" },
          { answer: "high-energy", expected: "fitdog-enrichment-at-home" }
        ];
        const results = cases.map((c) => ({
          input: c.answer,
          expected: c.expected,
          actual: recommendTrackFromAnswers({ "primary-challenge": c.answer }),
          pass: recommendTrackFromAnswers({ "primary-challenge": c.answer }) === c.expected
        }));
        return NextResponse.json({
          ok: results.every((r) => r.pass),
          action,
          message: results.every((r) => r.pass) ? "Assessment logic passed all test cases." : "Assessment logic mismatch.",
          results
        });
      }

      case "refresh_course_data":
        return NextResponse.json({
          ok: true,
          action,
          message: `Loaded ${academyTracks.length} tracks and ${academyLessons.length} lessons from static data.`
        });

      case "test_worksheet": {
        const lesson = getLesson("how-dogs-learn");
        const track = lesson ? getTrack(lesson.trackId) : null;
        if (!lesson || !track) {
          return NextResponse.json({ ok: false, action, message: "Sample lesson not found." });
        }
        const { buffer, source } = await getLessonWorksheetPdf(lesson, track);
        const expectedStatic = source === "static" && buffer.length >= 90_000;
        return NextResponse.json({
          ok: expectedStatic,
          action,
          message:
            source === "static"
              ? `Premium static PDF (${Math.round(buffer.length / 1024)} KB) for "${lesson.title}".`
              : `WARNING: served ${source} PDF (${Math.round(buffer.length / 1024)} KB) — expected static premium file.`,
          source,
          bytes: buffer.length
        });
      }

      default:
        return NextResponse.json({ ok: false, action, message: "Unknown action." }, { status: 400 });
    }
  } catch (error) {
    await logError({ severity: "warning", area: "Admin Diagnostics", message: String(error) });
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
}
