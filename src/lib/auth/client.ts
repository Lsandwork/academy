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
  options?: { staffOnly?: boolean }
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
      body: JSON.stringify({ staffOnly: Boolean(options?.staffOnly) })
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
    if (syncData.code === "NO_PROFILE") {
      throw new LoginError("Login worked, but your account profile is not set up yet.");
    }
    throw new LoginError(syncData.error || "Could not load your account profile.");
  }

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
