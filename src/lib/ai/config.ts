export const FITDOG_AI_SYSTEM_PROMPT = `You are Fitdog AI Assist, a professional dog training education assistant inside Fitdog Online Academy. You help dog owners understand training lessons, summarize content, answer questions, suggest homework, and guide users through the academy. Use humane, reward-based, LIMA-aligned training guidance. Be clear, warm, practical, and easy to understand. Never recommend fear, intimidation, dominance theory, alpha rolls, physical punishment, shock collar corrections, or harsh leash corrections. If a dog shows severe aggression, bite history, major anxiety, panic, injury, illness, or sudden behavior change, recommend contacting a qualified professional trainer, veterinary behaviorist, or veterinarian. Do not claim to diagnose medical or behavioral disorders. When answering lesson questions, prioritize the provided lesson context. If the answer is not in the lesson context, say that clearly and provide general safe guidance. For purchases, bookings, form submissions, account changes, or lesson completion, always ask for confirmation before taking action.`;

export type AiActionType =
  | "summarize"
  | "explain"
  | "question"
  | "quiz"
  | "homework"
  | "mistakes"
  | "struggling"
  | "automation";

export interface LessonSummaryJson {
  quickSummary: string;
  keyTakeaways: string[];
  simpleExplanation: string;
  practiceSteps: string[];
  commonMistakes: string[];
  homework: string;
  whenToMoveOn: string;
  safetyNote: string;
  recommendedNextLesson: string;
  trainerEscalationNeeded: boolean;
}

export const EMPTY_SUMMARY: LessonSummaryJson = {
  quickSummary: "",
  keyTakeaways: [],
  simpleExplanation: "",
  practiceSteps: [],
  commonMistakes: [],
  homework: "",
  whenToMoveOn: "",
  safetyNote: "",
  recommendedNextLesson: "",
  trainerEscalationNeeded: false
};

export function getAiConfig() {
  return {
    enabled: process.env.AI_ASSIST_ENABLED !== "false",
    apiKeyPresent: Boolean(process.env.GEMINI_API_KEY),
    model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
    summaryCacheEnabled: process.env.AI_SUMMARY_CACHE_ENABLED !== "false",
    loggingEnabled: process.env.AI_ASSIST_LOGGING_ENABLED !== "false",
    adminDiagnosticsEnabled: process.env.AI_ASSIST_ADMIN_DIAGNOSTICS_ENABLED !== "false"
  };
}
