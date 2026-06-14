import { buildAccessRulesPrompt } from "./access";

export function buildAiUserPrompt(parts: string[], user: import("@/lib/user").SafeUser) {
  return [...parts, buildAccessRulesPrompt(user)].filter(Boolean).join("\n");
}

export const AI_MESSENGER_TAIL =
  "Reply as Fitdog AI Assist in a friendly messenger tone. Be accurate about access — never invent unlocked content. Use LIMA-aligned guidance only. Do not mention AI providers.";

export const AI_LESSON_TAIL =
  "Respond as Fitdog AI Assist. Be warm, professional, and practical. Follow access rules exactly. Do not mention AI providers.";
