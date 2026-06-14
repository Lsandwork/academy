"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { Logo } from "@/components/Logo";
import { LoginError, requestPasswordReset } from "@/lib/auth/client";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");

    try {
      if (!isSupabaseConfigured()) {
        throw new LoginError("Auth is not configured. Missing Supabase environment variables.");
      }
      await requestPasswordReset(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof LoginError ? err.message : err instanceof Error ? err.message : "Could not send reset email.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-soft-bg px-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
        <div className="mb-8 flex justify-center">
          <Logo compact />
        </div>
        <h1 className="text-center text-2xl font-black">Reset your password</h1>
        <p className="mt-2 text-center text-sm text-muted">
          Enter your email and we&apos;ll send you a link to choose a new password.
        </p>

        {sent ? (
          <div className="mt-8 rounded-2xl bg-sky/10 p-5 text-center">
            <p className="text-sm font-semibold text-charcoal">
              If an account exists for <strong>{email}</strong>, check your inbox for a reset link.
            </p>
            <Link href="/login" className="mt-4 inline-flex text-sm font-bold text-orange hover:underline">
              Back to sign in
            </Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            <input
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-orange"
            />
            {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
            <button
              disabled={busy}
              type="submit"
              className="w-full rounded-full bg-orange py-3 font-bold text-white hover:bg-orange-dark disabled:opacity-60"
            >
              {busy ? "Sending…" : "Send Reset Link"}
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-muted">
          <Link href="/login" className="font-bold text-orange">
            ← Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
