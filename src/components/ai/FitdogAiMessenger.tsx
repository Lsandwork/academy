"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { fitdogAcademyAssets } from "@/assets/fitdogAcademyAssets";
import type { AiActionType } from "@/lib/ai/config";
import type { AiChatAction } from "@/lib/ai/access";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  at: number;
  actions?: AiChatAction[];
};

function newId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function ChatActions({ actions }: { actions: AiChatAction[] }) {
  if (!actions.length) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {actions.map((action) => (
        <Link
          key={action.href}
          href={action.href}
          className={`inline-flex rounded-full px-3 py-1.5 text-xs font-bold ${
            action.variant === "primary"
              ? "bg-orange text-white hover:bg-orange-dark"
              : "border border-gray-200 bg-white text-charcoal hover:border-orange/40"
          }`}
        >
          {action.label}
        </Link>
      ))}
    </div>
  );
}

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky/15 text-sm">🐾</div>
      <div className="rounded-2xl rounded-bl-md bg-[#eef0f3] px-4 py-3">
        <div className="flex gap-1">
          <span className="h-2 w-2 animate-bounce rounded-full bg-muted [animation-delay:0ms]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-muted [animation-delay:150ms]" />
          <span className="h-2 w-2 animate-bounce rounded-full bg-muted [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}

export function FitdogAiMessenger({
  open,
  onOpenChange,
  subtitle,
  messages,
  busy,
  error,
  input,
  onInputChange,
  onSend,
  onQuickAction,
  quickActions,
  placeholder = "Type your question…"
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subtitle?: string;
  messages: ChatMessage[];
  busy: boolean;
  error?: string;
  input: string;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onQuickAction?: (action: { label: string; actionType: AiActionType; prompt?: string }) => void;
  quickActions?: { label: string; actionType: AiActionType; prompt?: string }[];
  placeholder?: string;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open, busy]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => onOpenChange(true)}
          className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-orange text-white shadow-lg shadow-orange/30 transition hover:scale-105 hover:bg-orange-dark md:bottom-6 md:right-6"
          aria-label="Ask Fitdog AI a question"
          title="Questions? Chat with Fitdog AI"
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"
              fill="currentColor"
            />
          </svg>
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-end p-0 sm:p-4 sm:items-end">
          <button type="button" className="absolute inset-0 bg-black/25" aria-label="Close chat" onClick={() => onOpenChange(false)} />

          <div className="relative flex h-[min(560px,100dvh)] w-full max-w-[400px] flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:h-[min(520px,calc(100dvh-2rem))] sm:rounded-3xl">
            <div className="flex items-center gap-3 border-b border-gray-100 bg-gradient-to-r from-sky/10 to-orange/5 px-4 py-3">
              <div className="relative h-10 w-10 overflow-hidden rounded-full bg-white shadow-sm">
                <Image src={fitdogAcademyAssets.logos.dogHead64} alt="" fill className="object-contain p-1" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-black text-charcoal">Fitdog AI</p>
                <p className="truncate text-xs text-muted">{subtitle ?? "Ask a training question"}</p>
              </div>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="rounded-full p-2 text-muted hover:bg-gray-100"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {quickActions && quickActions.length > 0 && (
              <div className="flex gap-2 overflow-x-auto border-b border-gray-50 px-3 py-2">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    type="button"
                    disabled={busy}
                    onClick={() =>
                      onQuickAction
                        ? onQuickAction(action)
                        : onInputChange(action.prompt ?? action.label)
                    }
                    className="shrink-0 rounded-full border border-gray-200 px-3 py-1 text-xs font-bold text-charcoal hover:border-sky/40 disabled:opacity-50"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}

            <div className="flex-1 space-y-3 overflow-y-auto bg-[#f0f2f5] px-3 py-4">
              {messages.length === 0 && !busy && (
                <div className="mx-auto max-w-[85%] rounded-2xl rounded-bl-md bg-white px-4 py-3 text-sm text-charcoal shadow-sm">
                  Have a question about your training? Type below — I&apos;m here when you need me.
                </div>
              )}

              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start items-end gap-2"}`}>
                  {msg.role === "assistant" && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-sky/15 text-xs">🐾</div>
                  )}
                  <div className="max-w-[82%]">
                    <div
                      className={`whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm ${
                        msg.role === "user"
                          ? "rounded-br-md bg-orange text-white"
                          : "rounded-bl-md bg-white text-charcoal"
                      }`}
                    >
                      {msg.content}
                    </div>
                    <p className={`mt-1 text-[10px] text-muted ${msg.role === "user" ? "text-right" : "text-left"}`}>
                      {formatTime(msg.at)}
                    </p>
                    {msg.role === "assistant" && msg.actions?.length ? <ChatActions actions={msg.actions} /> : null}
                  </div>
                </div>
              ))}

              {busy && <TypingIndicator />}
              {error && <p className="text-center text-xs font-semibold text-red-600">{error}</p>}
              <div ref={bottomRef} />
            </div>

            <form
              className="flex items-center gap-2 border-t border-gray-100 bg-white px-3 py-3"
              onSubmit={(e) => {
                e.preventDefault();
                onSend();
              }}
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => onInputChange(e.target.value)}
                placeholder={placeholder}
                disabled={busy}
                className="flex-1 rounded-full border border-gray-200 bg-[#f0f2f5] px-4 py-2.5 text-sm outline-none focus:border-sky/50"
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange text-white disabled:opacity-40"
                aria-label="Send message"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export function useChatMessages(initialAssistant?: string) {
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    initialAssistant
      ? [{ id: newId(), role: "assistant", content: initialAssistant, at: Date.now() }]
      : []
  );

  function append(role: "user" | "assistant", content: string, actions?: AiChatAction[]) {
    setMessages((prev) => [...prev, { id: newId(), role, content, at: Date.now(), actions }]);
  }

  return { messages, append, setMessages };
}
