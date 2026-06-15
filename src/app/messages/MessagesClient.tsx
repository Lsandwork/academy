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

type RecipientOption = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  label: string;
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

  const [composeOpen, setComposeOpen] = useState(false);
  const [recipientQuery, setRecipientQuery] = useState("");
  const [recipientOptions, setRecipientOptions] = useState<RecipientOption[]>([]);
  const [selectedRecipient, setSelectedRecipient] = useState<RecipientOption | null>(null);
  const [composeBody, setComposeBody] = useState("");
  const [searching, setSearching] = useState(false);

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

  async function searchRecipients(query: string) {
    if (query.trim().length < 2) {
      setRecipientOptions([]);
      return;
    }
    setSearching(true);
    const res = await fetch(`/api/messages/recipients?q=${encodeURIComponent(query.trim())}`);
    const data = await res.json();
    setSearching(false);
    if (data.recipients) setRecipientOptions(data.recipients);
  }

  function openCompose() {
    setComposeOpen(true);
    setRecipientQuery("");
    setSelectedRecipient(null);
    setRecipientOptions([]);
    setComposeBody("");
    setError("");
  }

  function closeCompose() {
    setComposeOpen(false);
    setRecipientQuery("");
    setSelectedRecipient(null);
    setRecipientOptions([]);
    setComposeBody("");
  }

  function pickRecipient(option: RecipientOption) {
    setSelectedRecipient(option);
    setRecipientQuery(option.label);
    setRecipientOptions([]);
  }

  async function createConversation() {
    if (busy) return;
    if (!selectedRecipient && recipientQuery.trim().length < 2) {
      setError("Type a name or email to message.");
      return;
    }

    setBusy(true);
    setError("");

    const res = await fetch("/api/messages/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipientId: selectedRecipient?.id,
        recipientQuery: selectedRecipient ? undefined : recipientQuery.trim(),
        body: composeBody.trim() || undefined,
        subject: "Fitdog Academy"
      })
    });
    const data = await res.json();
    setBusy(false);

    if (!res.ok) {
      if (res.status === 409 && data.matches?.length) {
        setRecipientOptions(data.matches);
        setError("Multiple people match — pick the right person below.");
        return;
      }
      setError(data.error || "Could not create message.");
      return;
    }

    closeCompose();
    await loadConversations();
    if (data.conversationId) await loadConversation(data.conversationId);
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

  useEffect(() => {
    if (!composeOpen || selectedRecipient) return;
    const timer = setTimeout(() => searchRecipients(recipientQuery), 300);
    return () => clearTimeout(timer);
  }, [composeOpen, recipientQuery, selectedRecipient]);

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="rounded-3xl bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-black">Inbox</h2>
            <button
              type="button"
              disabled={busy}
              onClick={openCompose}
              className="rounded-full bg-orange px-3 py-1.5 text-xs font-bold text-white hover:bg-orange/90 disabled:opacity-60"
            >
              + New Message
            </button>
          </div>
          <p className="mt-1 text-xs text-muted">Signed in as {user.name || user.email}</p>

          {!conversations.length ? (
            <p className="mt-6 text-sm text-muted">
              No conversations yet. Tap <strong>New Message</strong> and type someone&apos;s name to start.
            </p>
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
            <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center text-sm text-muted">
              <p>Select a conversation or create a new message.</p>
              <button
                type="button"
                onClick={openCompose}
                className="rounded-full bg-charcoal px-5 py-2.5 text-sm font-bold text-white hover:bg-charcoal/90"
              >
                + New Message
              </button>
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
              {error && !composeOpen && <p className="px-6 text-sm font-semibold text-red-600">{error}</p>}
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

      {composeOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/30 p-4 sm:items-center">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-xl font-black">New Message</h3>
              <button type="button" onClick={closeCompose} className="text-sm font-bold text-muted hover:text-charcoal">
                Close
              </button>
            </div>

            <label className="mt-5 block text-sm font-bold text-charcoal" htmlFor="recipient">
              To
            </label>
            <div className="relative mt-2">
              <input
                id="recipient"
                value={recipientQuery}
                onChange={(e) => {
                  setRecipientQuery(e.target.value);
                  setSelectedRecipient(null);
                }}
                placeholder="Type a name or email…"
                className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange"
                autoComplete="off"
              />
              {searching && <p className="mt-2 text-xs text-muted">Searching…</p>}
              {!selectedRecipient && recipientOptions.length > 0 && (
                <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-2xl border border-gray-100 bg-white py-1 shadow-lg">
                  {recipientOptions.map((option) => (
                    <li key={option.id}>
                      <button
                        type="button"
                        onClick={() => pickRecipient(option)}
                        className="w-full px-4 py-3 text-left hover:bg-soft-bg"
                      >
                        <p className="font-bold text-sm">{option.label}</p>
                        <p className="text-xs text-muted">
                          {option.email}
                          {option.role !== "USER" ? ` · ${option.role.toLowerCase()}` : ""}
                        </p>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <label className="mt-4 block text-sm font-bold text-charcoal" htmlFor="compose-body">
              Message
            </label>
            <textarea
              id="compose-body"
              value={composeBody}
              onChange={(e) => setComposeBody(e.target.value)}
              rows={4}
              placeholder="Write your message…"
              className="mt-2 w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm outline-none focus:border-orange"
            />

            {error && <p className="mt-3 text-sm font-semibold text-red-600">{error}</p>}

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={closeCompose}
                className="flex-1 rounded-full border border-gray-200 py-3 text-sm font-bold text-charcoal"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={busy || (!selectedRecipient && recipientQuery.trim().length < 2)}
                onClick={createConversation}
                className="flex-1 rounded-full bg-orange py-3 text-sm font-bold text-white disabled:opacity-60"
              >
                {busy ? "Creating…" : "Create Message"}
              </button>
            </div>

            <p className="mt-4 text-xs text-muted">
              {user.role === "ADMIN" || user.role === "STAFF"
                ? "Admins can message any academy user by name or email."
                : user.role === "TRAINER"
                  ? "Search your approved clients or Fitdog admin."
                  : "Search Fitdog admin or your assigned trainer (after admin approval)."}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
