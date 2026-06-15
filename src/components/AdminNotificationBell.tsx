"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

type AdminNotification = {
  id: string;
  type: string;
  title: string;
  body: string;
  metadata?: string | null;
  readAt?: string | null;
  createdAt: string;
};

export function AdminNotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const panelRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/notifications");
    if (!res.ok) return;
    const data = await res.json();
    setNotifications(data.notifications || []);
    setUnreadCount(data.unreadCount || 0);
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 60_000);
    return () => clearInterval(interval);
  }, [load]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  async function markRead(id: string) {
    await fetch("/api/admin/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
    load();
  }

  async function markAllRead() {
    await fetch("/api/admin/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAll: true })
    });
    load();
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-full p-2 text-charcoal hover:bg-soft-bg"
        aria-label="Admin notifications"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M12 22a2.5 2.5 0 0 0 2.45-2h-4.9A2.5 2.5 0 0 0 12 22Zm7-6V11a7 7 0 1 0-14 0v5l-2 2v1h18v-1l-2-2Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-orange px-1 text-[10px] font-black text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-80 rounded-2xl border border-gray-100 bg-white shadow-xl sm:w-96">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <p className="text-sm font-black">Notifications</p>
            {unreadCount > 0 && (
              <button type="button" onClick={markAllRead} className="text-xs font-bold text-orange hover:underline">
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-auto">
            {!notifications.length ? (
              <p className="px-4 py-6 text-sm text-muted">No notifications yet.</p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => {
                    if (!n.readAt) markRead(n.id);
                  }}
                  className={`w-full border-b border-gray-50 px-4 py-3 text-left hover:bg-soft-bg ${!n.readAt ? "bg-orange/5" : ""}`}
                >
                  <p className="text-sm font-bold text-charcoal">{n.title}</p>
                  <p className="mt-1 line-clamp-3 whitespace-pre-line text-xs text-muted">{n.body}</p>
                  <p className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-muted">
                    {new Date(n.createdAt).toLocaleString()}
                    {!n.readAt ? " · New" : ""}
                  </p>
                </button>
              ))
            )}
          </div>
          <div className="border-t border-gray-100 px-4 py-3">
            <Link href="/admin" onClick={() => setOpen(false)} className="text-xs font-bold text-orange hover:underline">
              Open Admin Panel →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
