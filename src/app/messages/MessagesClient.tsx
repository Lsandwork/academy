"use client";

import { useEffect, useState } from "react";
import { SafeUser } from "@/lib/user";

type ConversationRow = {
  id: string;
  title: string;
  lastMessage?: string | null;
  lastMessageAt: string;
  unreadCount: number;
};

type MessageRow = {
  id: string;
  body: string;
  createdAt: string;
  senderName: string;
  mine: boolean;
};

export default function MessagesClient({
  user,
  initialConversationId
}: {
  user: SafeUser;
  initialConversationId?: string;
}) {
  const [conversations, setConversations] = useState<ConversationRow[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [title, setTitle] = useState("");
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function loadConversations() {
    const res = await fetch("/api/messages/conversations");
    const data = await res.json();
    if (data.conversations) setConversations(data.conversations);
  }

  async function loadConversation(id: string) {
    const res = await fetch(`/api/messages/conversations/${id}`);
    const data = await res.json();
    if (data.error) {
      setError(data.error);
      return;
    }
    setSelectedId(id);
    setTitle(data.title);
    setMessages(data.messages || []);
    setError("");
    loadConversations();
  }

  async function startAdminChat() {
    setBusy(true);
    const res = await fetch("/api/messages/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messageAdmin: true, subject: "Fitdog Academy support" })
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Could not start chat.");
      return;
    }
    await loadConversations();
    if (data.conversationId) loadConversation(data.conversationId);
  }

  async function sendMessage() {
    if (!selectedId || !input.trim() || busy) return;
    setBusy(true);
    const res = await fetch(`/api/messages/conversations/${selectedId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: input.trim() })
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Could not send message.");
      return;
    }
    setInput("");
    if (data.message) setMessages((prev) => [...prev, data.message]);
    loadConversations();
  }

  useEffect(() => {
    loadConversations().then(() => {
      if (initialConversationId) loadConversation(initialConversationId);
    });
  }, [initialConversationId]);

  useEffect(() => {
    if (!selectedId) return;
    const timer = setInterval(() => loadConversation(selectedId), 15000);
    return () => clearInterval(timer);
  }, [selectedId]);

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="rounded-3xl bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-black">Inbox</h2>
          <button
            type="button"
            disabled={busy}
            onClick={startAdminChat}
            className="rounded-full bg-orange px-3 py-1.5 text-xs font-bold text-white hover:bg-orange/90 disabled:opacity-60"
          >
            Message Admin
          </button>
        </div>
        <p className="mt-1 text-xs text-muted">Signed in as {user.name || user.email}</p>

        {!conversations.length ? (
          <p className="mt-6 text-sm text-muted">No conversations yet. Message admin or your trainer after assignment approval.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {conversations.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => loadConversation(c.id)}
                  className={`w-full rounded-2xl px-4 py-3 text-left transition ${
                    selectedId === c.id ? "bg-orange/10 ring-1 ring-orange/20" : "hover:bg-soft-bg"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-bold text-sm">{c.title}</p>
                    {c.unreadCount > 0 && (
                      <span className="rounded-full bg-orange px-2 py-0.5 text-[10px] font-black text-white">
                        {c.unreadCount}
                      </span>
                    )}
                  </div>
                  {c.lastMessage && <p className="mt-1 line-clamp-2 text-xs text-muted">{c.lastMessage}</p>}
                </button>
              </li>
            ))}
          </ul>
        )}
      </aside>

      <section className="flex min-h-[520px] flex-col rounded-3xl bg-white shadow-sm">
        {!selectedId ? (
          <div className="flex flex-1 items-center justify-center p-8 text-center text-sm text-muted">
            Select a conversation or start one with Fitdog admin.
          </div>
        ) : (
          <>
            <div className="border-b border-gray-100 px-6 py-4">
              <h3 className="text-xl font-black">{title}</h3>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto px-6 py-4">
              {messages.map((m) => (
                <div key={m.id} className={`flex ${m.mine ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                      m.mine ? "bg-orange text-white" : "bg-soft-bg text-charcoal"
                    }`}
                  >
                    {!m.mine && <p className="mb-1 text-[10px] font-bold uppercase opacity-70">{m.senderName}</p>}
                    <p className="whitespace-pre-wrap">{m.body}</p>
                    <p className={`mt-2 text-[10px] ${m.mine ? "text-white/70" : "text-muted"}`}>
                      {new Date(m.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            {error && <p className="px-6 text-sm font-semibold text-red-600">{error}</p>}
            <div className="border-t border-gray-100 px-6 py-4">
              <div className="flex gap-3">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), sendMessage())}
                  placeholder="Type a message…"
                  className="flex-1 rounded-full border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange"
                />
                <button
                  type="button"
                  disabled={busy || !input.trim()}
                  onClick={sendMessage}
                  className="rounded-full bg-charcoal px-5 py-3 text-sm font-bold text-white disabled:opacity-50"
                >
                  Send
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
