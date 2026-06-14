"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Logo } from "@/components/Logo";
import { LoginError, signUpWithEmail } from "@/lib/auth/client";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");

    try {
      if (!isSupabaseConfigured()) {
        throw new LoginError("Auth is not configured. Missing Supabase environment variables.");
      }

      const form = new FormData(e.currentTarget);
      const redirect = await signUpWithEmail(
        String(form.get("email") || ""),
        String(form.get("password") || ""),
        String(form.get("name") || "")
      );
      router.push(redirect);
      router.refresh();
    } catch (err) {
      if (err instanceof LoginError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-soft-bg px-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
        <div className="mb-8 flex justify-center"><Logo compact /></div>
        <h1 className="text-center text-2xl font-black">Start free today</h1>
        <p className="mt-2 text-center text-sm text-muted">Create your Fitdog Academy account.</p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <input name="name" type="text" placeholder="Name (optional)" className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-orange" />
          <input name="email" type="email" required placeholder="Email" className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-orange" />
          <input name="password" type="password" required minLength={8} placeholder="Password (min 8 chars)" className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-orange" />
          {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
          <button disabled={busy} type="submit" className="w-full rounded-full bg-orange py-3 font-bold text-white hover:bg-orange-dark disabled:opacity-60">
            {busy ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          Already have an account? <Link href="/login" className="font-bold text-orange">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
