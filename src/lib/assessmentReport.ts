import { assessmentQuestions } from "@/data/assessment";
import { getTrack } from "@/data/academyCourses";
import type { SafeUser } from "@/lib/user";

export type AssessmentReport = {
  completedAt: string;
  recommendedTrackId: string;
  recommendedTrackTitle: string;
  primaryChallenge: string;
  answers: Record<string, string>;
};

export function parseAssessmentResult(raw: string | null | undefined): AssessmentReport | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as {
      trackId?: string;
      answers?: Record<string, string>;
      completedAt?: string;
    };
    if (!parsed.trackId || !parsed.answers) return null;

    const track = getTrack(parsed.trackId);
    const challengeOption = assessmentQuestions
      .flatMap((q) => q.options)
      .find((o) => o.id === parsed.answers?.["primary-challenge"]);

    return {
      completedAt: parsed.completedAt ?? new Date().toISOString(),
      recommendedTrackId: parsed.trackId,
      recommendedTrackTitle: track?.title ?? parsed.trackId,
      primaryChallenge: challengeOption?.label ?? "Not specified",
      answers: parsed.answers
    };
  } catch {
    return null;
  }
}

export function buildAssessmentReport(user: Pick<SafeUser, "assessmentResult">) {
  return parseAssessmentResult(user.assessmentResult);
}

export function formatAssessmentReportSummary(report: AssessmentReport, owner: Pick<SafeUser, "name" | "email">) {
  const ownerName = owner.name || owner.email.split("@")[0];
  return [
    `Fitdog Academy Training Assessment Report`,
    `Owner: ${ownerName} (${owner.email})`,
    `Completed: ${new Date(report.completedAt).toLocaleString()}`,
    `Primary challenge: ${report.primaryChallenge}`,
    `Recommended track: ${report.recommendedTrackTitle}`,
    `Track ID: ${report.recommendedTrackId}`
  ].join("\n");
}

export function formatAssessmentReportHtml(report: AssessmentReport, owner: Pick<SafeUser, "name" | "email">, ownerMessage?: string) {
  const ownerName = owner.name || owner.email.split("@")[0];
  return `
    <h2>Fitdog Academy — Training Assessment Report</h2>
    <p><strong>Owner:</strong> ${ownerName} (${owner.email})</p>
    <p><strong>Assessment completed:</strong> ${new Date(report.completedAt).toLocaleString()}</p>
    <p><strong>Primary challenge:</strong> ${report.primaryChallenge}</p>
    <p><strong>Recommended track:</strong> ${report.recommendedTrackTitle}</p>
    ${ownerMessage ? `<p><strong>Owner message:</strong> ${ownerMessage.replace(/\n/g, "<br/>")}</p>` : ""}
    <p>This owner requested to work with you through Fitdog Academy. Please follow up to schedule a consultation.</p>
  `.trim();
}
