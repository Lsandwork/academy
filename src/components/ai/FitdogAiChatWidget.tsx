"use client";

import { useState } from "react";
import type { AiChatAction } from "@/lib/ai/access";
import type { AiActionType } from "@/lib/ai/config";
import { FitdogAiMessenger, useChatMessages } from "./FitdogAiMessenger";

const LESSON_QUICK: { label: string; actionType: AiActionType; prompt?: string }[] = [
  { label: "Explain simply", actionType: "explain" },
  { label: "Homework", actionType: "homework" },
  { label: "Common mistakes", actionType: "mistakes" }
];

export function FitdogAiChatWidget({
  pageUrl,
  lessonId,
  lessonTitle,
  trackTitle,
  lessonUnlocked = true
}: {
  pageUrl: string;
  lessonId?: string;
  lessonTitle?: string;
  trackTitle?: string;
  lessonUnlocked?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const { messages, append } = useChatMessages();

  const subtitle = lessonTitle && trackTitle ? `${trackTitle} · ${lessonTitle}` : "Fitdog Academy";

  async function sendMessage(text: string, actionType: AiActionType = "question") {
    const trimmed = text.trim();
    if (!trimmed || busy) return;

    setInput("");
    setError("");
    append("user", trimmed);
    setBusy(true);

    const history = messages.slice(-8).map(({ role, content }) => ({ role, content }));

    try {
      const res = await fetch(lessonId ? "/api/ai/assist" : "/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          lessonId
            ? { lessonId, pageUrl, actionType, message: trimmed, history }
            : { pageUrl, message: trimmed, lessonId, history }
        )
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not send message.");

      append("assistant", data.reply, data.actions as AiChatAction[] | undefined);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong.";
      setError(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <FitdogAiMessenger
      open={open}
      onOpenChange={setOpen}
      subtitle={subtitle}
      messages={messages}
      busy={busy}
      error={error}
      input={input}
      onInputChange={setInput}
      onSend={() => sendMessage(input)}
      onQuickAction={(action) => sendMessage(action.prompt ?? action.label, action.actionType)}
      quickActions={
        lessonId && lessonUnlocked
          ? LESSON_QUICK.map((a) => ({
              ...a,
              prompt: a.prompt ?? a.label
            }))
          : undefined
      }
      placeholder={
        lessonId
          ? lessonUnlocked
            ? "Ask about this lesson…"
            : "Ask what this lesson covers…"
          : "Ask a training question…"
      }
    />
  );
}
