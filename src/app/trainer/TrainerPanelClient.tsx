"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { SafeUser } from "@/lib/user";

type ContractRow = {
  id: string;
  status: string;
  ownerMessage?: string | null;
  reportSummary?: string | null;
  assessmentReport?: string | null;
  adminNotified: boolean;
  createdAt: string;
  owner: { name?: string | null; email: string };
};

type TrainerInfo = {
  id: string;
  name: string;
  title: string;
  email: string;
};

export default function TrainerPanelClient({ user }: { user: SafeUser }) {
  const [trainer, setTrainer] = useState<TrainerInfo | null>(null);
  const [contracts, setContracts] = useState<ContractRow[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/trainer/contracts")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
          return;
        }
        setTrainer(data.trainer);
        setContracts(data.contracts || []);
      });
  }, []);

  return (
    <div className="min-h-screen bg-soft-bg">
      <AppHeader user={user} />
      <main className="mx-auto max-w-5xl px-6 py-10">
        <p className="text-sm font-bold uppercase tracking-wide text-orange">Trainer Portal</p>
        <h1 className="mt-2 text-3xl font-black">{trainer?.name || user.name || "Trainer Dashboard"}</h1>
        <p className="mt-2 text-muted">{trainer?.title || "Fitdog Academy certified trainer"}</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-muted">Pending requests</p>
            <p className="text-2xl font-black">{contracts.filter((c) => c.status === "pending").length}</p>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-muted">Total requests</p>
            <p className="text-2xl font-black">{contracts.length}</p>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-muted">Academy access</p>
            <Link href="/library" className="mt-2 inline-flex text-sm font-bold text-orange hover:underline">
              Open Library →
            </Link>
          </div>
        </div>

        {error && <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</p>}

        <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black">Owner contact requests</h2>
          <p className="mt-1 text-sm text-muted">
            Academy owners who requested to work with you. Assessment summaries are included when available.
          </p>

          {!contracts.length ? (
            <p className="mt-6 text-sm text-muted">No owner requests yet.</p>
          ) : (
            <div className="mt-6 space-y-4">
              {contracts.map((contract) => (
                <article key={contract.id} className="rounded-2xl border border-gray-100 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-black">{contract.owner.name || contract.owner.email}</p>
                      <p className="text-sm text-muted">{contract.owner.email}</p>
                    </div>
                    <span className="rounded-full bg-orange/10 px-3 py-1 text-xs font-black uppercase text-orange">
                      {contract.status}
                    </span>
                  </div>
                  {contract.ownerMessage && (
                    <p className="mt-4 text-sm text-charcoal">
                      <strong>Message:</strong> {contract.ownerMessage}
                    </p>
                  )}
                  {contract.reportSummary && (
                    <p className="mt-3 text-sm text-muted">
                      <strong>Assessment:</strong> {contract.reportSummary}
                    </p>
                  )}
                  <p className="mt-3 text-xs text-muted">{new Date(contract.createdAt).toLocaleString()}</p>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
