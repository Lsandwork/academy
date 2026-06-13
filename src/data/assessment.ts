export interface AssessmentOption {
  id: string;
  label: string;
  trackId: string;
}

export interface AssessmentQuestion {
  id: string;
  prompt: string;
  options: AssessmentOption[];
}

export const assessmentQuestions: AssessmentQuestion[] = [
  {
    id: "primary-challenge",
    prompt: "What is your biggest training challenge right now?",
    options: [
      { id: "puppy-biting", label: "Puppy biting and teething", trackId: "puppy-foundations" },
      { id: "leash-pulling", label: "Pulling on the leash", trackId: "everyday-obedience" },
      { id: "alone-panic", label: "Panic or distress when alone", trackId: "separation-support" },
      { id: "barking-lunging", label: "Barking or lunging on walks", trackId: "leash-reactivity-reset" },
      { id: "high-energy", label: "Boredom or high energy at home", trackId: "fitdog-enrichment-at-home" },
      { id: "home-chaos", label: "Jumping, barking, or chaos at home", trackId: "calm-home-skills" }
    ]
  }
];

export function recommendTrackFromAnswers(answers: Record<string, string>) {
  const selected = assessmentQuestions.flatMap((q) => q.options).find((o) => o.id === answers["primary-challenge"]);
  return selected?.trackId ?? "puppy-foundations";
}
