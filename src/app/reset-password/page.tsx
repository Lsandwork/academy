"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Logo } from "@/components/Logo";
import { LoginError, updatePassword } from "@/lib/auth/client";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setBusy(true);

    try {
      if (!isSupabaseConfigured()) {
        throw new LoginError("Auth is not configured. Missing Supabase environment variables.");
      }
      const redirect = await updatePassword(password);
      router.push(redirect);
      router.refresh();
    } catch (err) {
      setError(err instanceof LoginError ? err.message : err instanceof Error ? err.message : "Could not reset password.");
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
        <h1 className="text-center text-2xl font-black">Choose a new password</h1>
        <p className="mt-2 text-center text-sm text-muted">Must be at least 8 characters.</p>

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
            {busy ? "Saving…" : "Update Password"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          <Link href="/login" className="font-bold text-orange">
            ← Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
