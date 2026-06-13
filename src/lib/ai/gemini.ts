import { getAiConfig } from "./config";
import { FITDOG_AI_SYSTEM_PROMPT } from "./config";

export class AiUnavailableError extends Error {
  constructor(message = "Fitdog AI Assist is temporarily unavailable. Please try again soon.") {
    super(message);
    this.name = "AiUnavailableError";
  }
}

interface GeminiPart {
  text?: string;
}

interface GeminiResponse {
  candidates?: Array<{
    content?: { parts?: GeminiPart[] };
  }>;
  usageMetadata?: {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
  };
  error?: { message?: string };
}

export async function callGemini(input: {
  userPrompt: string;
  systemPrompt?: string;
  jsonMode?: boolean;
  temperature?: number;
}) {
  const config = getAiConfig();
  if (!config.enabled) throw new AiUnavailableError("Fitdog AI Assist is currently disabled.");
  if (!config.apiKeyPresent) throw new AiUnavailableError("Fitdog AI Assist is not configured yet.");

  const started = Date.now();
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${process.env.GEMINI_API_KEY}`;

  const body = {
    systemInstruction: {
      parts: [{ text: input.systemPrompt ?? FITDOG_AI_SYSTEM_PROMPT }]
    },
    contents: [{ role: "user", parts: [{ text: input.userPrompt }] }],
    generationConfig: {
      temperature: input.temperature ?? 0.6,
      ...(input.jsonMode ? { responseMimeType: "application/json" } : {})
    }
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const data = (await res.json()) as GeminiResponse;
  const elapsed = Date.now() - started;

  if (!res.ok) {
    throw new AiUnavailableError(data.error?.message || "Fitdog AI Assist could not complete your request.");
  }

  const text = data.candidates?.[0]?.content?.parts?.map((p) => p.text).join("")?.trim();
  if (!text) throw new AiUnavailableError("Fitdog AI Assist returned an empty response.");

  return {
    text,
    promptTokens: data.usageMetadata?.promptTokenCount ?? null,
    responseTokens: data.usageMetadata?.candidatesTokenCount ?? null,
    responseTimeMs: elapsed
  };
}

export async function testGeminiConnection() {
  const started = Date.now();
  try {
    const result = await callGemini({
      userPrompt: "Reply with exactly: Fitdog AI Assist connection OK",
      temperature: 0
    });
    return {
      ok: true,
      responseTimeMs: Date.now() - started,
      message: result.text.slice(0, 120)
    };
  } catch (error) {
    return {
      ok: false,
      responseTimeMs: Date.now() - started,
      message: error instanceof Error ? error.message : "Connection failed"
    };
  }
}

function extractJsonObject(text: string) {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const match = trimmed.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error("Could not parse AI JSON response.");
  }
}

export async function callGeminiJson<T>(input: { userPrompt: string; systemPrompt?: string }) {
  const result = await callGemini({ ...input, jsonMode: true, temperature: 0.4 });
  return { ...result, json: extractJsonObject(result.text) as T };
}
