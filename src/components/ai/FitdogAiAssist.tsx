"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { fitdogAcademyAssets } from "@/assets/fitdogAcademyAssets";
import type { AiActionType, LessonSummaryJson } from "@/lib/ai/config";
import { LessonSummaryCard } from "./LessonSummaryCard";

type ChatMessage = { role: "user" | "assistant"; content: string };

const QUICK_ACTIONS: { label: string; actionType: AiActionType; prompt?: string }[] = [
  { label: "Summarize", actionType: "summarize" },
  { label: "Explain Simply", actionType: "explain" },
  { label: "Give Me Homework", actionType: "homework" },
  { label: "Quiz Me", actionType: "quiz" },
  { label: "Common Mistakes", actionType: "mistakes" },
  { label: "My Dog Is Struggling", actionType: "struggling" }
];

const LOADING_MESSAGES = [
  "Reading the lesson…",
  "Building your training summary…",
  "Finding the clearest answer…"
];

export function FitdogAiAssist({
  lessonId,
  lessonTitle,
  trackTitle,
  pageUrl
}: {
  lessonId: string;
  lessonTitle: string;
  trackTitle: string;
  pageUrl: string;
}) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: `Hi! I'm Fitdog AI Assist. I can help you understand "${lessonTitle}" from ${trackTitle}. Ask a question or use a quick action below.`
    }
  ]);
  const [busy, setBusy] = useState(false);
  const [loadingText, setLoadingText] = useState(LOADING_MESSAGES[0]);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState<LessonSummaryJson | null>(null);
  const [summarySections, setSummarySections] = useState<Array<{ title: string; body?: string; items?: string[] }>>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open, showSummary]);

  useEffect(() => {
    if (!busy && !summaryLoading) return;
    let i = 0;
    const timer = setInterval(() => {
      i = (i + 1) % LOADING_MESSAGES.length;
      setLoadingText(LOADING_MESSAGES[i]);
    }, 1800);
    return () => clearInterval(timer);
  }, [busy, summaryLoading]);

  const headerSubtitle = useMemo(() => `${trackTitle} · ${lessonTitle}`, [trackTitle, lessonTitle]);

  async function summarizeLesson() {
    setSummaryLoading(true);
    setError("");
    setShowSummary(true);
    try {
      const res = await fetch("/api/ai/summarize-lesson", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lessonId, pageUrl })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not summarize lesson.");
      setSummary(data.summary);
      setSummarySections(data.sections ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Summary unavailable.");
      setShowSummary(false);
    } finally {
      setSummaryLoading(false);
    }
  }

  async function sendMessage(actionType: AiActionType = "question", preset?: string) {
    const text = (preset ?? input).trim();
    if (actionType === "question" && !text) return;

    if (actionType === "summarize") {
      await summarizeLesson();
      return;
    }

    const userMessage = text || QUICK_ACTIONS.find((a) => a.actionType === actionType)?.label || "Help me with this lesson";
    setInput("");
    setMessages((m) => [...m, { role: "user", content: userMessage }]);
    setBusy(true);
    setError("");

    try {
      const res = await fetch("/api/ai/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId,
          pageUrl,
          actionType,
          message: userMessage,
          history: messages.slice(-6)
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Fitdog AI Assist is unavailable.");
      setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong.";
      setError(msg);
      setMessages((m) => [...m, { role: "assistant", content: msg }]);
    } finally {
      setBusy(false);
    }
  }

  async function runTool(tool: string, args: Record<string, unknown> = {}) {
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/ai/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tool, args, lessonId, pageUrl })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Action failed.");
      const preview = JSON.stringify(data.result, null, 2);
      setMessages((m) => [
        ...m,
        { role: "assistant", content: data.result?.requiresConfirmation ? `${data.result.message}\n\n${preview}` : preview }
      ]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Action failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {/* Summarize button inline on lesson page */}
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          onClick={summarizeLesson}
          disabled={summaryLoading}
          className="inline-flex items-center gap-2 rounded-full bg-sky px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:brightness-105 disabled:opacity-60"
        >
          <Image src={fitdogAcademyAssets.icons.benefits.videoLessons} alt="" width={18} height={18} aria-hidden />
          {summaryLoading ? loadingText : "Summarize This Lesson"}
        </button>
      </div>

      {showSummary && (
        <div className="mt-6">
          {summaryLoading ? (
            <div className="rounded-3xl border border-sky/20 bg-white p-6 text-sm font-semibold text-sky">{loadingText}</div>
          ) : summary ? (
            <LessonSummaryCard summary={summary} sections={summarySections} onClose={() => setShowSummary(false)} />
          ) : null}
        </div>
      )}

      {/* Floating assistant */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-orange px-5 py-3 text-sm font-bold text-white shadow-lg shadow-orange/30 hover:bg-orange-dark"
        aria-label="Open Fitdog AI Assist"
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-base">🐾</span>
        Fitdog AI Assist
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
          <div className="flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
            <div className="border-b border-gray-100 bg-gradient-to-r from-sky/10 to-orange/10 px-5 py-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-wide text-sky">Fitdog AI Assist</p>
                  <h2 className="text-lg font-black text-charcoal">Training Assistant</h2>
                  <p className="mt-1 text-xs font-semibold text-muted">{headerSubtitle}</p>
                </div>
                <button onClick={() => setOpen(false)} className="rounded-full px-2 py-1 text-lg text-muted hover:bg-white/70" aria-label="Close">
                  ✕
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 border-b border-gray-100 px-4 py-3">
              {QUICK_ACTIONS.map((action) => (
                <button
                  key={action.label}
                  disabled={busy}
                  onClick={() => sendMessage(action.actionType, action.prompt)}
                  className="rounded-full border border-gray-200 px-3 py-1.5 text-xs font-bold text-charcoal hover:border-sky/40 hover:text-sky disabled:opacity-50"
                >
                  {action.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {messages.map((msg, idx) => (
                <div
                  key={`${msg.role}-${idx}`}
                  className={`max-w-[92%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user" ? "ml-auto bg-orange text-white" : "bg-soft-bg text-charcoal"
                  }`}
                >
                  {msg.content}
                </div>
              ))}
              {(busy || summaryLoading) && (
                <div className="rounded-2xl bg-soft-bg px-4 py-3 text-sm font-semibold text-sky">{loadingText}</div>
              )}
              {error && <p className="text-xs font-semibold text-red-600">{error}</p>}
              <div ref={bottomRef} />
            </div>

            <div className="border-t border-gray-100 px-4 py-3 space-y-3">
              <div className="flex flex-wrap gap-2">
                <button disabled={busy} onClick={() => runTool("recommendNextLesson")} className="rounded-full bg-sky/10 px-3 py-1.5 text-xs font-bold text-sky">
                  Next Lesson
                </button>
                <button disabled={busy} onClick={() => runTool("comparePurchaseOptions")} className="rounded-full bg-sky/10 px-3 py-1.5 text-xs font-bold text-sky">
                  Compare Plans
                </button>
                <button
                  disabled={busy}
                  onClick={() => {
                    if (confirm("Mark this lesson complete?")) runTool("markLessonComplete", { confirmed: true, lessonId });
                  }}
                  className="rounded-full bg-sky/10 px-3 py-1.5 text-xs font-bold text-sky"
                >
                  Mark Complete
                </button>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage("question");
                }}
                className="flex gap-2"
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about this lesson…"
                  className="flex-1 rounded-full border border-gray-200 px-4 py-2.5 text-sm"
                />
                <button disabled={busy || !input.trim()} type="submit" className="rounded-full bg-orange px-4 py-2.5 text-sm font-bold text-white disabled:opacity-50">
                  Send
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
