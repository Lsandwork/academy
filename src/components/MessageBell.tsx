"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export function MessageBell() {
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    fetch("/api/messages/unread")
      .then((r) => r.json())
      .then((data) => setUnread(data.unread || 0))
      .catch(() => setUnread(0));

    const timer = setInterval(() => {
      fetch("/api/messages/unread")
        .then((r) => r.json())
        .then((data) => setUnread(data.unread || 0))
        .catch(() => undefined);
    }, 30000);

    return () => clearInterval(timer);
  }, []);

  return (
    <Link href="/messages" className="relative rounded-full p-2 hover:bg-soft-bg" aria-label="Messages">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M4 5h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H8l-4 4V6a1 1 0 0 1 1-1Z"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
      </svg>
      {unread > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange px-1 text-[10px] font-black text-white">
          {unread > 9 ? "9+" : unread}
        </span>
      )}
    </Link>
  );
}
