"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { contractStatusLabel } from "@/lib/contracts";
import { SafeUser } from "@/lib/user";

type ContractRow = {
  id: string;
  status: string;
  dogName?: string | null;
  dogBreed?: string | null;
  dogAge?: string | null;
  dogNotes?: string | null;
  ownerMessage?: string | null;
  reportSummary?: string | null;
  createdAt: string;
  owner: { id: string; name?: string | null; email: string };
  conversation?: { id: string } | null;
};

type TrainerInfo = {
  id: string;
  name: string;
  title: string;
  email: string;
};

export default function TrainerPanelClient({ user }: { user: SafeUser }) {
  const [trainer, setTrainer] = useState<TrainerInfo | null>(null);
  const [activeClients, setActiveClients] = useState<ContractRow[]>([]);
  const [awaitingAdmin, setAwaitingAdmin] = useState<ContractRow[]>([]);
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
        setActiveClients(data.activeClients || []);
        setAwaitingAdmin(data.awaitingAdmin || []);
      });
  }, []);

  return (
    <div className="min-h-screen bg-soft-bg">
      <AppHeader user={user} />
      <main className="mx-auto max-w-5xl px-6 py-10">
        <p className="text-sm font-bold uppercase tracking-wide text-orange">Trainer Portal</p>
        <h1 className="mt-2 text-3xl font-black">{trainer?.name || user.name || "Trainer Dashboard"}</h1>
        <p className="mt-2 text-muted">{trainer?.title || "Fitdog Academy certified trainer"}</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-4">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-muted">Active dogs</p>
            <p className="text-2xl font-black">{activeClients.length}</p>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-muted">Awaiting admin</p>
            <p className="text-2xl font-black">{awaitingAdmin.length}</p>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-muted">Academy library</p>
            <Link href="/library" className="mt-2 inline-flex text-sm font-bold text-orange hover:underline">
              Full curriculum →
            </Link>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="text-sm text-muted">Messenger</p>
            <Link href="/messages" className="mt-2 inline-flex text-sm font-bold text-orange hover:underline">
              Open messages →
            </Link>
          </div>
        </div>

        {error && <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</p>}

        <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black">Dogs you are working with</h2>
          <p className="mt-1 text-sm text-muted">Admin-approved assignments appear here. Message owners directly from each card.</p>

          {!activeClients.length ? (
            <p className="mt-6 text-sm text-muted">No approved clients yet. New requests appear below until admin approves them.</p>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {activeClients.map((contract) => (
                <article key={contract.id} className="rounded-2xl border border-gray-100 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-lg font-black">{contract.dogName || "Dog (name pending)"}</p>
                      <p className="text-sm text-muted">
                        {[contract.dogBreed, contract.dogAge].filter(Boolean).join(" · ") || "Breed/age not provided"}
                      </p>
                      <p className="mt-2 text-sm font-semibold">{contract.owner.name || contract.owner.email}</p>
                    </div>
                    <span className="rounded-full bg-success/10 px-3 py-1 text-xs font-black uppercase text-success">
                      {contractStatusLabel(contract.status)}
                    </span>
                  </div>
                  {contract.reportSummary && (
                    <p className="mt-3 text-sm text-muted">
                      <strong>Assessment:</strong> {contract.reportSummary}
                    </p>
                  )}
                  {contract.dogNotes && (
                    <p className="mt-2 text-sm text-charcoal">
                      <strong>Notes:</strong> {contract.dogNotes}
                    </p>
                  )}
                  <div className="mt-4 flex flex-wrap gap-3">
                    {contract.conversation?.id ? (
                      <Link
                        href={`/messages?conversation=${contract.conversation.id}`}
                        className="rounded-full bg-orange px-4 py-2 text-xs font-bold text-white hover:bg-orange/90"
                      >
                        Message owner
                      </Link>
                    ) : (
                      <Link href="/messages" className="rounded-full border border-gray-200 px-4 py-2 text-xs font-bold">
                        Open messenger
                      </Link>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-black">Pending admin approval</h2>
          {!awaitingAdmin.length ? (
            <p className="mt-4 text-sm text-muted">No requests waiting on admin.</p>
          ) : (
            <div className="mt-6 space-y-4">
              {awaitingAdmin.map((contract) => (
                <article key={contract.id} className="rounded-2xl border border-dashed border-gray-200 p-5">
                  <p className="font-black">{contract.dogName || contract.owner.name || contract.owner.email}</p>
                  <p className="text-sm text-muted">{contract.owner.email}</p>
                  {contract.ownerMessage && <p className="mt-3 text-sm">{contract.ownerMessage}</p>}
                  <p className="mt-2 text-xs font-bold uppercase text-orange">{contractStatusLabel(contract.status)}</p>
                </article>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
