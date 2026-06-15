"use client";

import { useEffect, useMemo, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { getLesson } from "@/data/academyCourses";
import { SafeUser, accessLabel, parseJsonArray } from "@/lib/user";
import type { DiagnosticStatus } from "@/lib/diagnostics";

type AdminUser = SafeUser & {
  recentCredits?: Array<{ id: string; amount: number; reason: string; createdAt: string; lessonId?: string | null }>;
};

type ErrorRow = { id: string; severity: string; area: string; message: string; userEmail?: string | null; url?: string | null; device?: string | null; status: string; createdAt: string };

type TrainerContractRow = {
  id: string;
  status: string;
  ownerMessage?: string | null;
  reportSummary?: string | null;
  trainerNotified: boolean;
  createdAt: string;
  owner: { name?: string | null; email: string };
  trainer: { name: string; email: string; title: string };
};

const tabs = ["overview", "users", "access", "credits", "trainers", "diagnostics", "logs"] as const;

function Badge({ status }: { status: DiagnosticStatus | string }) {
  const styles: Record<string, string> = {
    healthy: "bg-success/10 text-success",
    warning: "bg-yellow-100 text-yellow-800",
    critical: "bg-red-100 text-red-700",
    not_configured: "bg-gray-100 text-gray-600"
  };
  return <span className={`rounded-full px-2 py-1 text-[10px] font-black uppercase ${styles[status] || styles.not_configured}`}>{String(status).replace("_", " ")}</span>;
}

export default function AdminPanelClient({ user, isAdmin }: { user: SafeUser; isAdmin: boolean }) {
  const [tab, setTab] = useState<(typeof tabs)[number]>("overview");
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [diagnostics, setDiagnostics] = useState<any>(null);
  const [aiDiagnostics, setAiDiagnostics] = useState<any>(null);
  const [toolResult, setToolResult] = useState<string>("");
  const [errorLogs, setErrorLogs] = useState<ErrorRow[]>([]);
  const [trainerContracts, setTrainerContracts] = useState<TrainerContractRow[]>([]);
  const [busy, setBusy] = useState(false);

  const selected = users.find((u) => u.id === selectedId);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((data) => {
        if (data.users) {
          setUsers(data.users);
          if (data.users[0]) setSelectedId(data.users[0].id);
        }
      });
  }, []);

  useEffect(() => {
    if (tab === "diagnostics" && isAdmin) {
      fetch("/api/admin/diagnostics/ai")
        .then((r) => r.json())
        .then((data) => {
          if (!data.error) setAiDiagnostics(data);
        });
    }
  }, [tab, isAdmin]);

  useEffect(() => {
    if (tab === "logs" && isAdmin) {
      fetch("/api/admin/errors")
        .then((r) => r.json())
        .then((data) => {
          if (data.errors) setErrorLogs(data.errors);
        });
    }
  }, [tab, isAdmin]);

  useEffect(() => {
    if (tab === "trainers" && isAdmin) {
      fetch("/api/admin/trainer-contracts")
        .then((r) => r.json())
        .then((data) => {
          if (data.contracts) setTrainerContracts(data.contracts);
        });
    }
  }, [tab, isAdmin]);

  const filtered = useMemo(
    () => users.filter((u) => u.email.toLowerCase().includes(search.toLowerCase()) || (u.name || "").toLowerCase().includes(search.toLowerCase())),
    [users, search]
  );

  async function saveUser(fields: Record<string, unknown>) {
    if (!selected || !isAdmin) return;
    if (!confirm("Save changes to this user?")) return;
    setBusy(true);
    setError("");
    setMessage("");
    const res = await fetch(`/api/admin/users/${selected.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields)
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Update failed.");
      return;
    }
    setUsers((list) => list.map((u) => (u.id === data.user.id ? { ...u, ...data.user } : u)));
    setMessage("User updated.");
  }

  async function grantCredits() {
    if (!selected || !isAdmin) return;
    const amount = Number((document.getElementById("grantAmount") as HTMLInputElement)?.value || 1);
    if (!confirm(`Grant ${amount} credit(s) to ${selected.email}?`)) return;
    setBusy(true);
    const res = await fetch("/api/admin/credits/grant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: selected.id, amount, reason: "Admin grant" })
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Grant failed.");
      return;
    }
    setUsers((list) => list.map((u) => (u.id === data.user.id ? { ...u, ...data.user } : u)));
    setMessage(`Granted ${amount} credit(s).`);
  }

  async function runAiAdminTest(action: string) {
    if (!isAdmin) return;
    setBusy(true);
    setError("");
    setToolResult("");
    const res = await fetch("/api/admin/diagnostics/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action })
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error || data.message || "AI test failed.");
      return;
    }
    setToolResult(data.message || "AI test completed.");
    const refresh = await fetch("/api/admin/diagnostics/ai");
    const refreshed = await refresh.json();
    if (!refreshed.error) setAiDiagnostics(refreshed);
  }

  async function runDiagnostics() {
    await runAdminAction("run_full", true);
  }

  async function runAdminAction(action: string, setReport = false) {
    if (!isAdmin) return;
    setBusy(true);
    setError("");
    setToolResult("");
    const res = await fetch("/api/admin/diagnostics/actions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action })
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error || data.message || "Action failed.");
      return;
    }
    setToolResult(data.message || "Done.");
    if (setReport && data.report) {
      setDiagnostics(data.report);
      setMessage("Diagnostics completed.");
    }
    if (action === "export_report" && data.report) {
      const blob = new Blob([JSON.stringify(data.report, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `fitdog-diagnostics-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }

  async function resetUserAccess() {
    if (!selected || !isAdmin) return;
    if (!confirm(`Reset access for ${selected.email}? This sets access to FREE and clears purchased lessons.`)) return;
    await saveUser({ accessLevel: "FREE", purchasedLessonIds: [] });
  }

  const purchasedIds = selected ? parseJsonArray(selected.purchasedLessonIds) : [];
  const completedIds = selected ? parseJsonArray(selected.completedLessonIds) : [];
  const favoriteIds = selected ? parseJsonArray(selected.favoriteLessonIds) : [];

  return (
    <div className="min-h-screen bg-soft-bg">
      <AppHeader user={user} />
      <main className="mx-auto max-w-7xl px-6 py-10">
        <h1 className="text-3xl font-black">Admin Panel</h1>
        <p className="mt-2 text-muted">{isAdmin ? "Full admin access" : "Staff read-only view"}</p>

        <div className="mt-6 flex flex-wrap gap-2">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              disabled={!isAdmin && (t === "credits" || t === "diagnostics" || t === "access" || t === "logs")}
              className={`rounded-full px-4 py-2 text-sm font-bold capitalize ${tab === t ? "bg-orange text-white" : "bg-white border border-gray-200 text-charcoal disabled:opacity-40"}`}
            >
              {t}
            </button>
          ))}
        </div>

        {message && <p className="mt-4 rounded-xl bg-success/10 px-4 py-3 text-sm font-semibold text-success">{message}</p>}
        {error && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</p>}
        {toolResult && tab === "diagnostics" && <p className="mt-4 rounded-xl bg-sky/10 px-4 py-3 text-sm font-semibold text-charcoal">{toolResult}</p>}

        {tab === "overview" && (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl bg-white p-5 shadow-sm"><p className="text-sm text-muted">Users</p><p className="text-2xl font-black">{users.length}</p></div>
            <div className="rounded-2xl bg-white p-5 shadow-sm"><p className="text-sm text-muted">Admins</p><p className="text-2xl font-black">{users.filter((u) => u.role === "ADMIN").length}</p></div>
            <div className="rounded-2xl bg-white p-5 shadow-sm"><p className="text-sm text-muted">Paid users</p><p className="text-2xl font-black">{users.filter((u) => u.accessLevel !== "FREE").length}</p></div>
            <div className="rounded-2xl bg-white p-5 shadow-sm"><p className="text-sm text-muted">Credits outstanding</p><p className="text-2xl font-black">{users.reduce((s, u) => s + u.creditBalance, 0)}</p></div>
          </div>
        )}

        {(tab === "users" || tab === "access" || tab === "credits") && (
          <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..." className="w-full rounded-xl border border-gray-200 px-4 py-3" />
              <div className="mt-4 max-h-[420px] overflow-auto divide-y divide-gray-100">
                {filtered.map((u) => (
                  <button key={u.id} onClick={() => setSelectedId(u.id)} className={`w-full py-3 text-left ${selectedId === u.id ? "text-orange" : "text-charcoal"}`}>
                    <p className="font-bold">{u.name || u.email}</p>
                    <p className="text-sm text-muted">{u.email}</p>
                  </button>
                ))}
              </div>
            </div>

            {selected && (
              <div className="rounded-3xl bg-white p-6 shadow-sm space-y-4">
                <h2 className="text-xl font-black">{tab === "access" ? "Access Details" : tab === "credits" ? "Credit Management" : "User Details"}</h2>
                <p className="text-sm text-muted">{selected.email}</p>
                <p className="text-sm"><strong>Role:</strong> {selected.role}</p>
                <p className="text-sm"><strong>Access:</strong> {accessLabel(selected.accessLevel)}</p>
                <p className="text-sm"><strong>Credits:</strong> {selected.creditBalance}</p>

                {(tab === "access" || tab === "users") && (
                  <>
                    <div>
                      <p className="text-sm font-bold">Purchased lessons ({purchasedIds.length})</p>
                      <ul className="mt-1 max-h-24 overflow-auto text-xs text-muted">
                        {purchasedIds.map((id) => <li key={id}>{getLesson(id)?.title || id}</li>)}
                      </ul>
                    </div>
                    <div>
                      <p className="text-sm font-bold">Completed ({completedIds.length})</p>
                      <ul className="mt-1 max-h-24 overflow-auto text-xs text-muted">
                        {completedIds.slice(0, 8).map((id) => <li key={id}>{getLesson(id)?.title || id}</li>)}
                      </ul>
                    </div>
                    <div>
                      <p className="text-sm font-bold">Favorites ({favoriteIds.length})</p>
                      <ul className="mt-1 max-h-24 overflow-auto text-xs text-muted">
                        {favoriteIds.slice(0, 8).map((id) => <li key={id}>{getLesson(id)?.title || id}</li>)}
                      </ul>
                    </div>
                  </>
                )}

                {isAdmin && tab === "users" && (
                  <>
                    <select id="role" defaultValue={selected.role} className="w-full rounded-xl border border-gray-200 px-4 py-3">
                      <option value="USER">USER</option>
                      <option value="STAFF">STAFF</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                    <button
                      disabled={busy}
                      onClick={() => saveUser({ role: (document.getElementById("role") as HTMLSelectElement).value })}
                      className="rounded-full bg-charcoal px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
                    >
                      Save Role
                    </button>
                  </>
                )}

                {isAdmin && tab === "access" && (
                  <>
                    <select id="accessLevel" defaultValue={selected.accessLevel} className="w-full rounded-xl border border-gray-200 px-4 py-3">
                      <option value="FREE">FREE</option>
                      <option value="SINGLE_LESSON">SINGLE_LESSON</option>
                      <option value="MONTHLY">MONTHLY</option>
                      <option value="LIFETIME">LIFETIME</option>
                    </select>
                    <button
                      disabled={busy}
                      onClick={() => saveUser({ accessLevel: (document.getElementById("accessLevel") as HTMLSelectElement).value })}
                      className="rounded-full bg-charcoal px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
                    >
                      Save Access Level
                    </button>
                    <button disabled={busy} onClick={resetUserAccess} className="rounded-full border border-red-200 px-5 py-2.5 text-sm font-bold text-red-600 disabled:opacity-60">
                      Reset User Access
                    </button>
                  </>
                )}

                {isAdmin && tab === "credits" && (
                  <>
                    <input id="grantAmount" type="number" min={1} defaultValue={1} className="w-full rounded-xl border border-gray-200 px-4 py-3" />
                    <button disabled={busy} onClick={grantCredits} className="rounded-full bg-orange px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60">Grant Credits</button>
                    <input id="creditBalance" type="number" min={0} defaultValue={selected.creditBalance} className="w-full rounded-xl border border-gray-200 px-4 py-3" />
                    <button
                      disabled={busy}
                      onClick={() => saveUser({ creditBalance: Number((document.getElementById("creditBalance") as HTMLInputElement).value) })}
                      className="rounded-full bg-charcoal px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
                    >
                      Set Balance (ledger)
                    </button>
                    {selected.recentCredits && selected.recentCredits.length > 0 && (
                      <div>
                        <p className="text-sm font-bold">Recent credit activity</p>
                        <ul className="mt-2 max-h-40 overflow-auto text-xs text-muted space-y-1">
                          {selected.recentCredits.map((tx) => (
                            <li key={tx.id}>{new Date(tx.createdAt).toLocaleString()} · {tx.amount > 0 ? "+" : ""}{tx.amount} · {tx.reason}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {tab === "diagnostics" && isAdmin && (
          <div className="mt-8 space-y-6">
            <div className="flex flex-wrap gap-3">
              <button disabled={busy} onClick={runDiagnostics} className="rounded-full bg-orange px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60">Run Full Diagnostics</button>
              <button disabled={busy} onClick={() => runAdminAction("test_videos")} className="rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-bold text-charcoal disabled:opacity-60">Test Video Playback</button>
              <button disabled={busy} onClick={() => runAdminAction("test_payments")} className="rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-bold text-charcoal disabled:opacity-60">Test Payment Products</button>
              <button disabled={busy} onClick={() => runAdminAction("test_email")} className="rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-bold text-charcoal disabled:opacity-60">Test Email Delivery</button>
              <button disabled={busy} onClick={() => runAdminAction("test_worksheet")} className="rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-bold text-charcoal disabled:opacity-60">Test Worksheet PDF</button>
              <button disabled={busy} onClick={() => runAdminAction("run_assessment_test")} className="rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-bold text-charcoal disabled:opacity-60">Run Assessment Logic Test</button>
              <button disabled={busy} onClick={() => runAdminAction("check_locked_content")} className="rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-bold text-charcoal disabled:opacity-60">Check Locked Content</button>
              <button disabled={busy} onClick={() => runAdminAction("check_images")} className="rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-bold text-charcoal disabled:opacity-60">Check Broken Images</button>
              <button disabled={busy} onClick={() => runAdminAction("refresh_course_data")} className="rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-bold text-charcoal disabled:opacity-60">Refresh Course Data</button>
              <button disabled={busy} onClick={() => runAdminAction("export_report")} className="rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-bold text-charcoal disabled:opacity-60">Export Diagnostics Report</button>
            </div>

            {diagnostics && (
              <>
                <div className="rounded-3xl bg-white p-6 shadow-sm">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-black">Overall Status</h2>
                    <Badge status={diagnostics.overall} />
                    <span className="text-sm text-muted">Last checked: {new Date(diagnostics.checkedAt).toLocaleString()}</span>
                    <span className="text-sm text-muted">Environment: {diagnostics.environment}</span>
                  </div>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {diagnostics.summaryCards?.map((card: any) => (
                      <div key={card.label} className="rounded-2xl border border-gray-100 p-4">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-bold">{card.label}</p>
                          <Badge status={card.status} />
                        </div>
                        <p className="mt-2 text-sm text-muted">{card.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {diagnostics.sections?.map((section: any) => (
                  <div key={section.title} className="rounded-3xl bg-white p-6 shadow-sm">
                    <h3 className="text-lg font-black">{section.title}</h3>
                    <div className="mt-4 space-y-3">
                      {section.items.map((item: any, idx: number) => (
                        <div key={`${section.title}-${idx}`} className="flex flex-col gap-1 border-b border-gray-50 pb-3 sm:flex-row sm:items-center sm:justify-between">
                          <p className="font-semibold">{item.label}</p>
                          <div className="flex items-center gap-2">
                            <Badge status={item.status} />
                            <p className="text-sm text-muted">{item.detail}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </>
            )}

            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-black">AI Assist Health</h2>
              <div className="mt-4 flex flex-wrap gap-3">
                <button disabled={busy} onClick={() => runAiAdminTest("test_gemini")} className="rounded-full bg-sky px-4 py-2 text-sm font-bold text-white disabled:opacity-60">Test AI Connection</button>
                <button disabled={busy} onClick={() => runAiAdminTest("test_lesson_summary")} className="rounded-full border border-gray-200 px-4 py-2 text-sm font-bold disabled:opacity-60">Test Lesson Summary</button>
                <button disabled={busy} onClick={() => runAiAdminTest("test_url_scan")} className="rounded-full border border-gray-200 px-4 py-2 text-sm font-bold disabled:opacity-60">Test Current URL Scan</button>
                <button disabled={busy} onClick={() => runAiAdminTest("test_lesson_search")} className="rounded-full border border-gray-200 px-4 py-2 text-sm font-bold disabled:opacity-60">Test Lesson Search</button>
                <button disabled={busy} onClick={() => runAiAdminTest("test_automation")} className="rounded-full border border-gray-200 px-4 py-2 text-sm font-bold disabled:opacity-60">Test Automation Tool Call</button>
                <button disabled={busy} onClick={() => runAiAdminTest("clear_cache")} className="rounded-full border border-gray-200 px-4 py-2 text-sm font-bold disabled:opacity-60">Clear AI Cache</button>
                <button disabled={busy} onClick={() => { if (confirm("Rebuild all lesson summary cache? This may take a while.")) runAiAdminTest("rebuild_cache"); }} className="rounded-full border border-gray-200 px-4 py-2 text-sm font-bold disabled:opacity-60">Rebuild Lesson Summary Cache</button>
              </div>

              {aiDiagnostics && (
                <div className="mt-6 space-y-6">
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-2xl border border-gray-100 p-4">
                      <p className="font-bold">AI Provider Status</p>
                      <Badge status={aiDiagnostics.gemini?.status === "connected" ? "healthy" : aiDiagnostics.gemini?.status === "disabled" ? "not_configured" : "critical"} />
                      <p className="mt-2 text-sm text-muted">Model: {aiDiagnostics.gemini?.model}</p>
                      <p className="text-sm text-muted">API key present: {aiDiagnostics.gemini?.apiKeyPresent ? "Yes" : "No"}</p>
                      <p className="text-sm text-muted">Avg response: {aiDiagnostics.gemini?.averageResponseTimeMs ?? "—"} ms</p>
                      {aiDiagnostics.gemini?.lastErrorMessage && aiDiagnostics.gemini?.status !== "connected" && (
                        <p className="text-sm text-red-600">{aiDiagnostics.gemini.lastErrorMessage}</p>
                      )}
                    </div>
                    <div className="rounded-2xl border border-gray-100 p-4">
                      <p className="font-bold">Lesson Context Sync</p>
                      <p className="mt-2 text-sm text-muted">{aiDiagnostics.lessonContext?.totalLessons} lessons detected</p>
                      <p className="text-sm text-muted">{aiDiagnostics.lessonContext?.summariesCached} summaries cached</p>
                      <p className="text-sm text-muted">Source: {aiDiagnostics.lessonContext?.contentSource}</p>
                    </div>
                    <div className="rounded-2xl border border-gray-100 p-4">
                      <p className="font-bold">Safety Guardrails</p>
                      <p className="mt-2 text-sm text-muted">LIMA prompt: {aiDiagnostics.guardrails?.limaSafetyPromptActive ? "Active" : "Off"}</p>
                      <p className="text-sm text-muted">Purchase confirmation: {aiDiagnostics.guardrails?.purchaseConfirmationRequired ? "Required" : "Off"}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-black">Automation Health</h3>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {aiDiagnostics.automation?.map((tool: any) => (
                        <div key={tool.name} className="rounded-xl border border-gray-100 px-3 py-2 text-sm">
                          <span className="font-bold">{tool.name}</span> · {tool.enabled ? "Enabled" : "Disabled"}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-black">Recent AI Requests</h3>
                    {!aiDiagnostics.recentLogs?.length ? (
                      <p className="mt-2 text-sm text-muted">No AI requests logged yet.</p>
                    ) : (
                      <div className="mt-3 overflow-auto">
                        <table className="w-full text-left text-sm">
                          <thead>
                            <tr className="border-b border-gray-100">
                              <th className="py-2 pr-3">Time</th>
                              <th className="py-2 pr-3">Action</th>
                              <th className="py-2 pr-3">Status</th>
                              <th className="py-2 pr-3">Ms</th>
                              <th className="py-2">Error</th>
                            </tr>
                          </thead>
                          <tbody>
                            {aiDiagnostics.recentLogs.map((row: any) => (
                              <tr key={row.id} className="border-b border-gray-50">
                                <td className="py-2 pr-3">{new Date(row.createdAt).toLocaleString()}</td>
                                <td className="py-2 pr-3">{row.actionType}</td>
                                <td className="py-2 pr-3">{row.status}</td>
                                <td className="py-2 pr-3">{row.responseTimeMs ?? "—"}</td>
                                <td className="py-2">{row.errorMessage || "—"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "trainers" && isAdmin && (
          <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black">Trainer Contract Requests</h2>
            <p className="mt-1 text-sm text-muted">Owner requests with assessment reports sent to certified trainers.</p>
            {!trainerContracts.length ? (
              <p className="mt-4 text-sm text-muted">No trainer requests yet.</p>
            ) : (
              <div className="mt-4 overflow-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="py-2 pr-4">Date</th>
                      <th className="py-2 pr-4">Owner</th>
                      <th className="py-2 pr-4">Trainer</th>
                      <th className="py-2 pr-4">Report</th>
                      <th className="py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trainerContracts.map((c) => (
                      <tr key={c.id} className="border-b border-gray-50 align-top">
                        <td className="py-3 pr-4 text-muted">{new Date(c.createdAt).toLocaleString()}</td>
                        <td className="py-3 pr-4">
                          <p className="font-bold">{c.owner.name || c.owner.email}</p>
                          <p className="text-xs text-muted">{c.owner.email}</p>
                          {c.ownerMessage && <p className="mt-1 text-xs text-charcoal">{c.ownerMessage}</p>}
                        </td>
                        <td className="py-3 pr-4">
                          <p className="font-bold">{c.trainer.name}</p>
                          <p className="text-xs text-muted">{c.trainer.email}</p>
                        </td>
                        <td className="py-3 pr-4 text-xs text-muted">{c.reportSummary || "No report"}</td>
                        <td className="py-3">
                          <Badge status={c.status === "pending" ? "warning" : "healthy"} />
                          {c.trainerNotified && <p className="mt-1 text-[10px] text-muted">Email sent</p>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tab === "logs" && isAdmin && (
          <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
            <h2 className="text-xl font-black">Activity & Error Logs</h2>
            {!errorLogs.length ? (
              <p className="mt-4 text-sm text-muted">No error log entries yet.</p>
            ) : (
              <div className="mt-4 overflow-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="py-2 pr-4">Time</th>
                      <th className="py-2 pr-4">Severity</th>
                      <th className="py-2 pr-4">Area</th>
                      <th className="py-2 pr-4">Message</th>
                      <th className="py-2">User</th>
                    </tr>
                  </thead>
                  <tbody>
                    {errorLogs.map((row) => (
                      <tr key={row.id} className="border-b border-gray-50">
                        <td className="py-2 pr-4">{new Date(row.createdAt).toLocaleString()}</td>
                        <td className="py-2 pr-4">{row.severity}</td>
                        <td className="py-2 pr-4">{row.area}</td>
                        <td className="py-2 pr-4">{row.message}</td>
                        <td className="py-2">{row.userEmail || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
