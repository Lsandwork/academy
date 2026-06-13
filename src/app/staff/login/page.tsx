"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Logo } from "@/components/Logo";

export default function StaffLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(e.currentTarget);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.get("email"),
        password: form.get("password"),
        staffOnly: true
      })
    });

    const data = await res.json();
    setBusy(false);

    if (!res.ok) {
      setError(data.error || "Login failed.");
      return;
    }

    router.push(data.redirect || "/admin");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-dark px-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
        <div className="mb-8 flex justify-center"><Logo compact /></div>
        <h1 className="text-center text-2xl font-black">Staff Login</h1>
        <p className="mt-2 text-center text-sm text-muted">Authorized Fitdog Academy staff only.</p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <input name="email" type="email" required placeholder="Staff email" className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-orange" />
          <input name="password" type="password" required placeholder="Password" className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-orange" />
          {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
          <button disabled={busy} type="submit" className="w-full rounded-full bg-orange py-3 font-bold text-white hover:bg-orange-dark disabled:opacity-60">
            {busy ? "Signing in..." : "Staff Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          <Link href="/" className="font-bold text-orange">← Back to site</Link>
        </p>
      </div>
    </div>
  );
}
