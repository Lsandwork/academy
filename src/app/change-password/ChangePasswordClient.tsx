"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { Logo } from "@/components/Logo";

export default function ChangePasswordClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const required = searchParams.get("required") === "1";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetch("/api/auth/change-password")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          router.replace("/login");
          return;
        }
        if (!data.mustChangePassword && required) {
          router.replace("/dashboard");
        }
      })
      .finally(() => setChecking(false));
  }, [required, router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setBusy(true);
    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ newPassword: password })
    });
    const data = await res.json();
    setBusy(false);

    if (!res.ok) {
      setError(data.error || "Could not update password.");
      return;
    }

    router.push(data.redirect || "/dashboard");
    router.refresh();
  }

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-soft-bg px-6">
        <p className="text-sm font-semibold text-muted">Loading…</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-soft-bg px-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
        <div className="mb-8 flex justify-center">
          <Logo compact />
        </div>
        <h1 className="text-center text-2xl font-black">Set a new password</h1>
        <p className="mt-2 text-center text-sm text-muted">
          {required
            ? "Your account uses a temporary password. Choose a new password before continuing."
            : "Choose a new password for your account."}
        </p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <input
            name="password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-orange"
          />
          <input
            name="confirm"
            type="password"
            required
            minLength={8}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Confirm new password"
            className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-orange"
          />
          {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
          <button
            disabled={busy}
            type="submit"
            className="w-full rounded-full bg-orange py-3 font-bold text-white hover:bg-orange-dark disabled:opacity-60"
          >
            {busy ? "Saving…" : "Save Password & Continue"}
          </button>
        </form>

        {!required && (
          <p className="mt-6 text-center text-sm text-muted">
            <Link href="/dashboard" className="font-bold text-orange hover:underline">
              Back to dashboard
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
