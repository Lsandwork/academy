import type { AssessmentReport } from "./assessmentReport";
import { formatAssessmentReportHtml, formatAssessmentReportSummary } from "./assessmentReport";
import type { SafeUser } from "@/lib/user";

type TrainerRecipient = { name: string; email: string };

export async function notifyTrainerOfContract(input: {
  trainer: TrainerRecipient;
  owner: Pick<SafeUser, "name" | "email">;
  report: AssessmentReport | null;
  ownerMessage?: string;
  contractId: string;
}) {
  const summary = input.report
    ? formatAssessmentReportSummary(input.report, input.owner)
    : `Owner ${input.owner.email} requested trainer support without a completed assessment report.`;

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.TRAINER_EMAIL_FROM || "Fitdog Academy <onboarding@resend.dev>";

  if (!apiKey) {
    console.info("[trainer-notify] Stored contract only (no RESEND_API_KEY):", input.contractId);
    return { sent: false, summary };
  }

  const html = input.report
    ? formatAssessmentReportHtml(input.report, input.owner, input.ownerMessage)
    : `<p>${input.owner.name || input.owner.email} requested to work with you through Fitdog Academy.</p>
       ${input.ownerMessage ? `<p><strong>Message:</strong> ${input.ownerMessage}</p>` : ""}
       <p>No assessment report was on file yet. Ask the owner to complete the Training Assessment in the academy.</p>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from,
      to: [input.trainer.email],
      subject: `New Fitdog owner request — ${input.owner.name || input.owner.email}`,
      html
    })
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("[trainer-notify] Email failed:", err);
    return { sent: false, summary, error: err };
  }

  return { sent: true, summary };
}
