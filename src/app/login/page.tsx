"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { LoginError, signInWithEmail } from "@/lib/auth/client";
import { isSupabaseConfigured } from "@/lib/supabase/client";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("error") === "auth_callback") {
      setError("Sign-in link expired or invalid. Please try again.");
    }
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");

    try {
      if (!isSupabaseConfigured()) {
        throw new LoginError("Auth is not configured. Missing Supabase environment variables.");
      }

      const form = new FormData(e.currentTarget);
      const redirect = await signInWithEmail(
        String(form.get("email") || ""),
        String(form.get("password") || "")
      );
      router.push(redirect);
      router.refresh();
    } catch (err) {
      if (err instanceof LoginError) {
        setError(err.message);
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-soft-bg px-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl">
        <div className="mb-8 flex justify-center"><Logo compact /></div>
        <h1 className="text-center text-2xl font-black">Welcome back</h1>
        <p className="mt-2 text-center text-sm text-muted">Log in to continue your training.</p>

        <form onSubmit={onSubmit} className="mt-8 space-y-4">
          <input name="email" type="email" required placeholder="Email" className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-orange" />
          <div>
            <input name="password" type="password" required placeholder="Password" className="w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-orange" />
            <div className="mt-2 text-right">
              <Link href="/forgot-password" className="text-sm font-semibold text-orange hover:underline">
                Forgot password?
              </Link>
            </div>
          </div>
          {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
          <button disabled={busy} type="submit" className="w-full rounded-full bg-orange py-3 font-bold text-white hover:bg-orange-dark disabled:opacity-60">
            {busy ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted">
          New here? <Link href="/register" className="font-bold text-orange">Create account</Link>
        </p>
      </div>
    </div>
  );
}
