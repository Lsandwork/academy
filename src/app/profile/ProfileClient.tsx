"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { FitdogAiChatWidget } from "@/components/ai/FitdogAiChatWidget";
import { SafeUser, accessLabel } from "@/lib/user";

type CreditTx = { id: string; amount: number; reason: string; createdAt: string; lessonId?: string | null };

type TrainerContract = {
  id: string;
  status: string;
  reportSummary?: string | null;
  createdAt: string;
  trainer: { name: string; title: string };
};

export default function ProfileClient({ user }: { user: SafeUser }) {
  const [profile, setProfile] = useState({ name: user.name || "", email: user.email });
  const [passwords, setPasswords] = useState({ current: "", next: "" });
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || "");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [creditHistory, setCreditHistory] = useState<CreditTx[]>([]);
  const [trainerContracts, setTrainerContracts] = useState<TrainerContract[]>([]);

  useEffect(() => {
    fetch("/api/credits/history")
      .then((r) => r.json())
      .then((data) => {
        if (data.transactions) setCreditHistory(data.transactions);
      });
    fetch("/api/trainers/contracts")
      .then((r) => r.json())
      .then((data) => {
        if (data.contracts) setTrainerContracts(data.contracts);
      });
  }, []);

  async function saveProfile(e: FormEvent) {
    e.preventDefault();
    setMessage("");
    setError("");

    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: profile.name })
    });

    if (!res.ok) {
      setError((await res.json()).error || "Update failed.");
      return;
    }
    setMessage("Profile updated.");
  }

  async function saveEmail(e: FormEvent) {
    e.preventDefault();
    setMessage("");
    setError("");

    const res = await fetch("/api/profile/email", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: profile.email, password: passwords.current })
    });

    if (!res.ok) {
      setError((await res.json()).error || "Email update failed.");
      return;
    }
    setMessage("Email updated.");
    setPasswords({ current: "", next: "" });
  }

  async function savePassword(e: FormEvent) {
    e.preventDefault();
    setMessage("");
    setError("");

    const res = await fetch("/api/profile/password", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.next })
    });

    if (!res.ok) {
      setError((await res.json()).error || "Password update failed.");
      return;
    }
    setMessage("Password updated.");
    setPasswords({ current: "", next: "" });
  }

  async function uploadAvatar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setError("");

    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/profile/avatar", { method: "POST", body: form });

    if (!res.ok) {
      setError((await res.json()).error || "Upload failed.");
      return;
    }

    const data = await res.json();
    setAvatarUrl(data.avatarUrl);
    setMessage("Profile picture updated.");
  }

  return (
    <div className="min-h-screen bg-soft-bg">
      <AppHeader user={{ ...user, avatarUrl }} />
      <main className="mx-auto max-w-2xl px-6 py-10 space-y-8">
        <h1 className="text-3xl font-black">Your Profile</h1>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-muted">Access</p>
            <p className="text-lg font-black capitalize">{accessLabel(user.accessLevel)}</p>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-muted">Free Credits</p>
            <p className="text-lg font-black">{user.creditBalance}</p>
            <p className="mt-1 text-xs text-muted">Use 1 credit to unlock any paid lesson.</p>
          </div>
        </div>

        {creditHistory.length > 0 && (
          <section className="rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="font-black">Credit History</h2>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              {creditHistory.map((tx) => (
                <li key={tx.id}>{new Date(tx.createdAt).toLocaleString()} · {tx.amount > 0 ? "+" : ""}{tx.amount} · {tx.reason}</li>
              ))}
            </ul>
          </section>
        )}

        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-black">Trainer Requests</h2>
            <Link href="/trainers" className="text-sm font-bold text-orange hover:underline">
              Contact a trainer
            </Link>
          </div>
          {trainerContracts.length === 0 ? (
            <p className="mt-3 text-sm text-muted">No trainer requests yet. Your assessment report is sent automatically when you request a certified Fitdog trainer.</p>
          ) : (
            <ul className="mt-3 space-y-3">
              {trainerContracts.map((c) => (
                <li key={c.id} className="rounded-2xl border border-gray-100 p-4">
                  <p className="font-bold">{c.trainer.name}</p>
                  <p className="text-xs text-muted">{c.trainer.title}</p>
                  <p className="mt-2 text-sm capitalize text-charcoal">Status: {c.status}</p>
                  {c.reportSummary && <p className="mt-1 text-xs text-muted">{c.reportSummary}</p>}
                  <p className="mt-1 text-xs text-muted">{new Date(c.createdAt).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        {message && <p className="rounded-xl bg-success/10 px-4 py-3 text-sm font-semibold text-success">{message}</p>}
        {error && <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</p>}

        <section className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="font-black">Profile Picture</h2>
          <div className="mt-4 flex items-center gap-4">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt="" className="h-20 w-20 rounded-full object-cover" />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-orange/10 text-2xl font-black text-orange">
                {(user.name || user.email)[0].toUpperCase()}
              </div>
            )}
            <form onSubmit={uploadAvatar} className="flex-1">
              <input name="avatar" type="file" accept="image/*" required className="text-sm" />
              <button type="submit" className="mt-2 rounded-full bg-orange px-4 py-2 text-sm font-bold text-white">Upload</button>
            </form>
          </div>
        </section>

        <form onSubmit={saveProfile} className="rounded-3xl bg-white p-6 shadow-sm space-y-4">
          <h2 className="font-black">Display Name</h2>
          <input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} className="w-full rounded-xl border border-gray-200 px-4 py-3" placeholder="Your name" />
          <button type="submit" className="rounded-full bg-charcoal px-5 py-2 text-sm font-bold text-white">Save Name</button>
        </form>

        <form onSubmit={saveEmail} className="rounded-3xl bg-white p-6 shadow-sm space-y-4">
          <h2 className="font-black">Email</h2>
          <input value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} type="email" required className="w-full rounded-xl border border-gray-200 px-4 py-3" />
          <input value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} type="password" required placeholder="Current password to confirm" className="w-full rounded-xl border border-gray-200 px-4 py-3" />
          <button type="submit" className="rounded-full bg-charcoal px-5 py-2 text-sm font-bold text-white">Update Email</button>
        </form>

        <form onSubmit={savePassword} className="rounded-3xl bg-white p-6 shadow-sm space-y-4">
          <h2 className="font-black">Change Password</h2>
          <input value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} type="password" required placeholder="Current password" className="w-full rounded-xl border border-gray-200 px-4 py-3" />
          <input value={passwords.next} onChange={(e) => setPasswords({ ...passwords, next: e.target.value })} type="password" required minLength={8} placeholder="New password (min 8 chars)" className="w-full rounded-xl border border-gray-200 px-4 py-3" />
          <button type="submit" className="rounded-full bg-charcoal px-5 py-2 text-sm font-bold text-white">Update Password</button>
        </form>
      </main>
      <FitdogAiChatWidget pageUrl="/profile" />
    </div>
  );
}
