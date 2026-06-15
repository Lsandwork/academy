"use client";

import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export const LOGIN_TIMEOUT_MS = 15000;

export class LoginError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LoginError";
  }
}

function friendlyAuthError(message: string) {
  const lower = message.toLowerCase();
  if (lower.includes("rate limit") || lower.includes("email rate limit")) {
    return "Too many attempts right now. Please wait a few minutes and try again.";
  }
  if (lower.includes("invalid login credentials")) {
    return "Invalid email or password.";
  }
  return message;
}

async function withTimeout<T>(promise: Promise<T>, ms: number, message: string) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => reject(new LoginError(message)), ms);
      })
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

export async function signInWithEmail(
  email: string,
  password: string,
  options?: { staffOnly?: boolean; trainerOnly?: boolean }
) {
  if (!isSupabaseConfigured()) {
    throw new LoginError("Auth is not configured. Missing Supabase environment variables.");
  }

  const supabase = createClient();
  const normalizedEmail = email.trim().toLowerCase();

  const { data, error } = await withTimeout(
    supabase.auth.signInWithPassword({ email: normalizedEmail, password }),
    LOGIN_TIMEOUT_MS,
    "Login timed out. Please check your connection and try again."
  );

  if (error) {
    throw new LoginError(friendlyAuthError(error.message));
  }

  if (!data.session) {
    throw new LoginError("Login did not create a session. Confirm your email if required.");
  }

  const syncRes = await withTimeout(
    fetch("/api/auth/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        staffOnly: Boolean(options?.staffOnly),
        trainerOnly: Boolean(options?.trainerOnly)
      })
    }),
    LOGIN_TIMEOUT_MS,
    "Login timed out while loading your account profile."
  );

  let syncData: { error?: string; code?: string; redirect?: string } = {};
  try {
    syncData = await syncRes.json();
  } catch {
    throw new LoginError("Could not read the login response from the server.");
  }

  if (!syncRes.ok) {
    throw new LoginError(syncData.error || "Could not load your account profile.");
  }

  return syncData.redirect || "/dashboard";
}

function appOrigin() {
  if (typeof window !== "undefined") return window.location.origin;
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}

export async function requestPasswordReset(email: string) {
  if (!isSupabaseConfigured()) {
    throw new LoginError("Auth is not configured. Missing Supabase environment variables.");
  }

  const supabase = createClient();
  const normalizedEmail = email.trim().toLowerCase();

  const { error } = await withTimeout(
    supabase.auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo: `${appOrigin()}/auth/callback?next=/reset-password`
    }),
    LOGIN_TIMEOUT_MS,
    "Password reset timed out. Please try again."
  );

  if (error) {
    throw new LoginError(friendlyAuthError(error.message));
  }
}

export async function updatePassword(password: string) {
  if (!isSupabaseConfigured()) {
    throw new LoginError("Auth is not configured. Missing Supabase environment variables.");
  }

  if (password.length < 8) {
    throw new LoginError("Password must be at least 8 characters.");
  }

  const supabase = createClient();
  const { error } = await withTimeout(
    supabase.auth.updateUser({ password }),
    LOGIN_TIMEOUT_MS,
    "Could not update password. Please try again."
  );

  if (error) {
    throw new LoginError(friendlyAuthError(error.message));
  }

  const syncRes = await fetch("/api/auth/sync", { method: "POST" });
  if (!syncRes.ok) {
    return "/dashboard";
  }

  const syncData = await syncRes.json();
  return syncData.redirect || "/dashboard";
}

export async function signUpWithEmail(email: string, password: string, name?: string) {
  if (!isSupabaseConfigured()) {
    throw new LoginError("Auth is not configured. Missing Supabase environment variables.");
  }

  const res = await withTimeout(
    fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: email.trim().toLowerCase(),
        password,
        name: name?.trim() || null
      })
    }),
    LOGIN_TIMEOUT_MS,
    "Sign up timed out. Please try again."
  );

  let data: { error?: string; redirect?: string; message?: string } = {};
  try {
    data = await res.json();
  } catch {
    throw new LoginError("Could not read the registration response from the server.");
  }

  if (!res.ok) {
    throw new LoginError(friendlyAuthError(data.error || "Registration failed."));
  }

  return data.redirect || "/dashboard";
}
