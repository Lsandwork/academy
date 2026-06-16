"use client";

import { useEffect, useMemo, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { getLesson } from "@/data/academyCourses";
import { SafeUser, accessLabel, parseJsonArray, roleLabel } from "@/lib/user";
import type { AccessLevel, Role } from "@prisma/client";
import type { DiagnosticStatus } from "@/lib/diagnostics";
import { PaymentProcessorPanel } from "@/components/admin/PaymentProcessorPanel";

type AdminUser = SafeUser & {
  recentCredits?: Array<{ id: string; amount: number; reason: string; createdAt: string; lessonId?: string | null }>;
};

type ErrorRow = { id: string; severity: string; area: string; message: string; userEmail?: string | null; url?: string | null; device?: string | null; status: string; createdAt: string };

type ActivityRow = {
  id: string;
  userId?: string | null;
  userEmail?: string | null;
  actorId?: string | null;
  actorEmail?: string | null;
  category: string;
  action: string;
  summary: string;
  metadata?: string | null;
  targetType?: string | null;
  targetId?: string | null;
  createdAt: string;
};

const activityCategories = ["all", "auth", "profile", "lesson", "message", "admin", "payment", "trainer", "credits", "assessment"] as const;

type TrainerContractRow = {
  id: string;
  status: string;
  dogName?: string | null;
  dogBreed?: string | null;
  dogAge?: string | null;
  ownerMessage?: string | null;
  reportSummary?: string | null;
  trainerNotified: boolean;
  adminNotified: boolean;
  createdAt: string;
  owner: { id: string; name?: string | null; email: string };
  trainer: { id: string; name: string; email: string; title: string };
};

type AdminNotificationRow = {
  id: string;
  type: string;
  title: string;
  body: string;
  readAt?: string | null;
  createdAt: string;
};

const tabs = ["overview", "users", "credits", "trainers", "payment-processor", "diagnostics", "logs"] as const;

function tabLabel(tab: (typeof tabs)[number]) {
  if (tab === "payment-processor") return "Payment Processor";
  return tab;
}

const roleOptions: { value: Role; label: string; description: string }[] = [
  { value: "USER", label: "Standard user", description: "Regular academy member — library, lessons, and messaging." },
  { value: "TRAINER", label: "Trainer", description: "Certified trainer portal — assigned clients and full curriculum." },
  { value: "STAFF", label: "Staff", description: "Staff panel access — view users and trainer requests." },
  { value: "ADMIN", label: "Administrator", description: "Full admin access — manage users, access, credits, and settings." }
];

const accessOptions: { value: AccessLevel; label: string; description: string }[] = [
  { value: "FREE", label: "Free", description: "Free preview lessons only." },
  { value: "SINGLE_LESSON", label: "Single lesson", description: "Purchased individual lessons only." },
  { value: "MONTHLY", label: "Monthly membership", description: "Full access to all current lessons." },
  { value: "LIFETIME", label: "Lifetime access", description: "Permanent access to all current and future lessons." }
];

function roleBadgeClass(role: Role) {
  switch (role) {
    case "ADMIN":
      return "bg-orange/10 text-orange";
    case "STAFF":
      return "bg-sky/10 text-sky";
    case "TRAINER":
      return "bg-success/10 text-success";
    default:
      return "bg-gray-100 text-muted";
  }
}

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
  const [activityLogs, setActivityLogs] = useState<ActivityRow[]>([]);
  const [logsView, setLogsView] = useState<"activity" | "errors">("activity");
  const [activityCategory, setActivityCategory] = useState<(typeof activityCategories)[number]>("all");
  const [activitySearch, setActivitySearch] = useState("");
  const [trainerContracts, setTrainerContracts] = useState<TrainerContractRow[]>([]);
  const [adminNotifications, setAdminNotifications] = useState<AdminNotificationRow[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [busy, setBusy] = useState(false);
  const [editRole, setEditRole] = useState<Role>("USER");
  const [editAccessLevel, setEditAccessLevel] = useState<AccessLevel>("FREE");
  const [showAddUser, setShowAddUser] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newName, setNewName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<Role>("USER");
  const [newAccessLevel, setNewAccessLevel] = useState<AccessLevel>("FREE");
  const [newMustChangePassword, setNewMustChangePassword] = useState(true);
  const [createdTempPassword, setCreatedTempPassword] = useState<string | null>(null);

  const selected = users.find((u) => u.id === selectedId);

  const [usersLoaded, setUsersLoaded] = useState(false);

  async function loadUsers() {
    const res = await fetch("/api/admin/users");
    const data = await res.json();
    if (!res.ok || !data.users) {
      setError(data.error || "Could not load users.");
      setUsersLoaded(true);
      return;
    }
    setUsers(data.users);
    if (data.users[0] && !selectedId) setSelectedId(data.users[0].id);
    setUsersLoaded(true);
    setError("");
  }

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    if (selected) {
      setEditRole(selected.role);
      setEditAccessLevel(selected.accessLevel);
    }
  }, [selected?.id, selected?.role, selected?.accessLevel]);

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
      if (logsView === "errors") {
        fetch("/api/admin/errors")
          .then((r) => r.json())
          .then((data) => {
            if (data.errors) setErrorLogs(data.errors);
          });
      } else {
        const params = new URLSearchParams({ limit: "150" });
        if (activityCategory !== "all") params.set("category", activityCategory);
        if (activitySearch.trim()) params.set("q", activitySearch.trim());
        fetch(`/api/admin/activity-logs?${params}`)
          .then((r) => r.json())
          .then((data) => {
            if (data.logs) setActivityLogs(data.logs);
          });
      }
    }
  }, [tab, isAdmin, logsView, activityCategory, activitySearch]);

  useEffect(() => {
    if (!isAdmin) return;
    fetch("/api/admin/notifications")
      .then((r) => r.json())
      .then((data) => {
        if (data.notifications) {
          setAdminNotifications(data.notifications);
          setUnreadNotifications(data.unreadCount || 0);
        }
      });
  }, [isAdmin, tab, message]);

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

  async function markNotificationRead(id: string) {
    await fetch("/api/admin/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    });
    setAdminNotifications((list) => list.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n)));
    setUnreadNotifications((c) => Math.max(0, c - 1));
  }

  async function reviewContract(contractId: string, action: "approve" | "decline") {
    if (!isAdmin) return;
    const label = action === "approve" ? "approve this trainer assignment" : "decline this request";
    if (!confirm(`Are you sure you want to ${label}?`)) return;
    setBusy(true);
    setError("");
    const res = await fetch(`/api/admin/trainer-contracts/${contractId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action })
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(data.error || "Could not update assignment.");
      return;
    }
    setTrainerContracts((list) =>
      list.map((c) => (c.id === contractId ? { ...c, status: data.contract.status } : c))
    );
    setMessage(data.message || "Assignment updated.");
  }

  async function saveUser(fields: Record<string, unknown>, confirmMessage = "Save changes to this user?") {
    if (!selected || !isAdmin) return;
    if (!confirm(confirmMessage)) return;
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
    await loadUsers();
  }

  async function saveUserAccess() {
    if (!selected || !isAdmin) return;

    const roleChanged = editRole !== selected.role;
    const accessChanged = editAccessLevel !== selected.accessLevel;

    if (!roleChanged && !accessChanged) {
      setError("No changes to save.");
      return;
    }

    if (selected.id === user.id && roleChanged && editRole !== "ADMIN") {
      setError("You cannot remove your own administrator access.");
      return;
    }

    const parts: string[] = [];
    if (roleChanged) parts.push(`role to ${roleLabel(editRole)}`);
    if (accessChanged) parts.push(`access to ${accessLabel(editAccessLevel)}`);

    await saveUser(
      {
        ...(roleChanged ? { role: editRole } : {}),
        ...(accessChanged ? { accessLevel: editAccessLevel } : {})
      },
      `Update ${selected.email}: change ${parts.join(" and ")}?`
    );
  }

  function resetAddUserForm() {
    setNewEmail("");
    setNewName("");
    setNewPassword("");
    setNewRole("USER");
    setNewAccessLevel("FREE");
    setNewMustChangePassword(true);
    setCreatedTempPassword(null);
  }

  function handleNewRoleChange(role: Role) {
    setNewRole(role);
    if (role !== "USER" && newAccessLevel === "FREE") {
      setNewAccessLevel("LIFETIME");
    }
  }

  async function createUser() {
    if (!isAdmin) return;

    const email = newEmail.trim();
    if (!email) {
      setError("Email is required.");
      return;
    }

    if (newPassword && newPassword.length < 8) {
      setError("Password must be at least 8 characters, or leave blank for a temporary password.");
      return;
    }

    if (!confirm(`Create account for ${email} as ${roleLabel(newRole)}?`)) return;

    setBusy(true);
    setError("");
    setMessage("");
    setCreatedTempPassword(null);

    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        name: newName.trim() || undefined,
        password: newPassword.trim() || undefined,
        role: newRole,
        accessLevel: newAccessLevel,
        mustChangePassword: newPassword.trim() ? newMustChangePassword : true
      })
    });

    const data = await res.json();
    setBusy(false);

    if (!res.ok) {
      setError(data.error || "Could not create user.");
      return;
    }

    setMessage(data.message || "User created.");
    if (data.temporaryPassword) {
      setCreatedTempPassword(data.temporaryPassword);
    }

    setNewEmail("");
    setNewName("");
    setNewPassword("");
    setNewRole("USER");
    setNewAccessLevel("FREE");
    setNewMustChangePassword(true);
    setShowAddUser(false);
    await loadUsers();
    if (data.user?.id) {
      setSelectedId(data.user.id);
      setEditRole(data.user.role);
      setEditAccessLevel(data.user.accessLevel);
    }
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
    await loadUsers();
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
    await saveUser(
      { accessLevel: "FREE", purchasedLessonIds: [] },
      `Reset access for ${selected.email}? This sets access to FREE and clears purchased lessons.`
    );
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
              disabled={!isAdmin && (t === "credits" || t === "payment-processor" || t === "diagnostics" || t === "logs")}
              className={`rounded-full px-4 py-2 text-sm font-bold capitalize ${tab === t ? "bg-orange text-white" : "bg-white border border-gray-200 text-charcoal disabled:opacity-40"}`}
            >
              {tabLabel(t)}
            </button>
          ))}
        </div>

        {message && <p className="mt-4 rounded-xl bg-success/10 px-4 py-3 text-sm font-semibold text-success">{message}</p>}
        {error && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">{error}</p>}
        {toolResult && tab === "diagnostics" && <p className="mt-4 rounded-xl bg-sky/10 px-4 py-3 text-sm font-semibold text-charcoal">{toolResult}</p>}

        {tab === "overview" && (
          <div className="mt-8 space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl bg-white p-5 shadow-sm"><p className="text-sm text-muted">Users</p><p className="text-2xl font-black">{users.length}</p></div>
              <div className="rounded-2xl bg-white p-5 shadow-sm"><p className="text-sm text-muted">Admins</p><p className="text-2xl font-black">{users.filter((u) => u.role === "ADMIN").length}</p></div>
              <div className="rounded-2xl bg-white p-5 shadow-sm"><p className="text-sm text-muted">Paid users</p><p className="text-2xl font-black">{users.filter((u) => u.accessLevel !== "FREE").length}</p></div>
              <div className="rounded-2xl bg-white p-5 shadow-sm"><p className="text-sm text-muted">Credits outstanding</p><p className="text-2xl font-black">{users.reduce((s, u) => s + u.creditBalance, 0)}</p></div>
            </div>

            {isAdmin && (
              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-xl font-black">Trainer contact notifications</h2>
                  {unreadNotifications > 0 && (
                    <span className="rounded-full bg-orange/10 px-3 py-1 text-xs font-black text-orange">
                      {unreadNotifications} unread
                    </span>
                  )}
                </div>
                {!adminNotifications.length ? (
                  <p className="mt-4 text-sm text-muted">No trainer contact requests yet.</p>
                ) : (
                  <div className="mt-4 space-y-3">
                    {adminNotifications.slice(0, 8).map((n) => (
                      <div
                        key={n.id}
                        className={`rounded-2xl border p-4 ${!n.readAt ? "border-orange/30 bg-orange/5" : "border-gray-100"}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-bold">{n.title}</p>
                            <p className="mt-2 whitespace-pre-line text-sm text-muted">{n.body}</p>
                            <p className="mt-2 text-xs text-muted">{new Date(n.createdAt).toLocaleString()}</p>
                          </div>
                          {!n.readAt && (
                            <button
                              type="button"
                              onClick={() => markNotificationRead(n.id)}
                              className="shrink-0 rounded-full border border-gray-200 px-3 py-1 text-xs font-bold text-charcoal hover:border-orange/30"
                            >
                              Mark read
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {(tab === "users" || tab === "credits") && (
          <>
            {tab === "users" && isAdmin && (
              <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-black">Add user</h2>
                    <p className="mt-1 text-sm text-muted">
                      Create a login and assign role permissions (standard user, trainer, staff, or admin).
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddUser((open) => !open);
                      if (showAddUser) resetAddUserForm();
                    }}
                    className="rounded-full bg-orange px-5 py-2.5 text-sm font-bold text-white hover:bg-orange-dark"
                  >
                    {showAddUser ? "Cancel" : "+ Add user"}
                  </button>
                </div>

                {createdTempPassword && (
                  <div className="mt-4 rounded-2xl border border-orange/30 bg-orange/5 px-4 py-3 text-sm">
                    <p className="font-bold text-charcoal">Temporary password (copy now — shown once):</p>
                    <p className="mt-1 font-mono text-orange">{createdTempPassword}</p>
                    <p className="mt-2 text-xs text-muted">The user must change this password on first login.</p>
                  </div>
                )}

                {showAddUser && (
                  <div className="mt-6 grid gap-4 md:grid-cols-2">
                    <div>
                      <label htmlFor="newEmail" className="text-sm font-bold text-charcoal">
                        Email
                      </label>
                      <input
                        id="newEmail"
                        type="email"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        placeholder="person@example.com"
                        className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="newName" className="text-sm font-bold text-charcoal">
                        Name (optional)
                      </label>
                      <input
                        id="newName"
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Display name"
                        className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
                      />
                    </div>
                    <div>
                      <label htmlFor="newPassword" className="text-sm font-bold text-charcoal">
                        Password (optional)
                      </label>
                      <input
                        id="newPassword"
                        type="text"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Leave blank to auto-generate"
                        className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm"
                      />
                      <p className="mt-1.5 text-xs text-muted">Min 8 characters. Blank generates a one-time temporary password.</p>
                    </div>
                    <div>
                      <label htmlFor="newRole" className="text-sm font-bold text-charcoal">
                        Account role
                      </label>
                      <select
                        id="newRole"
                        value={newRole}
                        onChange={(e) => handleNewRoleChange(e.target.value as Role)}
                        className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm"
                      >
                        {roleOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      <p className="mt-1.5 text-xs text-muted">
                        {roleOptions.find((o) => o.value === newRole)?.description}
                      </p>
                    </div>
                    <div>
                      <label htmlFor="newAccessLevel" className="text-sm font-bold text-charcoal">
                        Lesson access
                      </label>
                      <select
                        id="newAccessLevel"
                        value={newAccessLevel}
                        onChange={(e) => setNewAccessLevel(e.target.value as AccessLevel)}
                        className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm"
                      >
                        {accessOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-end">
                      <label className="flex items-center gap-2 text-sm text-charcoal">
                        <input
                          type="checkbox"
                          checked={newPassword.trim() ? newMustChangePassword : true}
                          disabled={!newPassword.trim()}
                          onChange={(e) => setNewMustChangePassword(e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300"
                        />
                        Require password change on first login
                      </label>
                    </div>
                    <div className="md:col-span-2">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={createUser}
                        className="rounded-full bg-charcoal px-6 py-3 text-sm font-bold text-white disabled:opacity-60"
                      >
                        {busy ? "Creating…" : "Create account"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
            <div className="rounded-3xl bg-white p-6 shadow-sm">
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..." className="w-full rounded-xl border border-gray-200 px-4 py-3" />
              <div className="mt-4 max-h-[420px] overflow-auto divide-y divide-gray-100">
                {!usersLoaded ? (
                  <p className="py-4 text-sm text-muted">Loading users…</p>
                ) : filtered.length ? (
                  filtered.map((u) => (
                    <button key={u.id} onClick={() => setSelectedId(u.id)} className={`w-full py-3 text-left ${selectedId === u.id ? "text-orange" : "text-charcoal"}`}>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-bold truncate">{u.name || u.email}</p>
                          <p className="text-sm text-muted truncate">{u.email}</p>
                        </div>
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${roleBadgeClass(u.role)}`}>
                          {u.role}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted">{accessLabel(u.accessLevel)}</p>
                    </button>
                  ))
                ) : (
                  <p className="py-4 text-sm text-muted">No users found. {error || "Try refreshing the page."}</p>
                )}
              </div>
            </div>

            {selected && (
              <div className="rounded-3xl bg-white p-6 shadow-sm space-y-4">
                <h2 className="text-xl font-black">{tab === "credits" ? "Credit Management" : "User Details"}</h2>
                <p className="text-sm text-muted">{selected.email}</p>

                {tab === "users" && (
                  <>
                    <div className="flex flex-wrap gap-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-black uppercase ${roleBadgeClass(selected.role)}`}>
                        {roleLabel(selected.role)}
                      </span>
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-charcoal">
                        {accessLabel(selected.accessLevel)}
                      </span>
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-charcoal">
                        {selected.creditBalance} credits
                      </span>
                    </div>

                    {isAdmin && (
                      <div className="rounded-2xl border border-orange/20 bg-orange/5 p-5 space-y-4">
                        <div>
                          <h3 className="text-sm font-black uppercase tracking-wide text-charcoal">User access &amp; role</h3>
                          <p className="mt-1 text-xs text-muted">
                            Change account type (standard user, trainer, staff, admin) and lesson access level.
                          </p>
                        </div>

                        <div>
                          <label htmlFor="editRole" className="text-sm font-bold text-charcoal">
                            Account role
                          </label>
                          <select
                            id="editRole"
                            value={editRole}
                            onChange={(e) => setEditRole(e.target.value as Role)}
                            className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm"
                          >
                            {roleOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          <p className="mt-1.5 text-xs text-muted">
                            {roleOptions.find((o) => o.value === editRole)?.description}
                          </p>
                        </div>

                        <div>
                          <label htmlFor="editAccessLevel" className="text-sm font-bold text-charcoal">
                            Lesson access
                          </label>
                          <select
                            id="editAccessLevel"
                            value={editAccessLevel}
                            onChange={(e) => setEditAccessLevel(e.target.value as AccessLevel)}
                            className="mt-2 w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm"
                          >
                            {accessOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                          <p className="mt-1.5 text-xs text-muted">
                            {accessOptions.find((o) => o.value === editAccessLevel)?.description}
                          </p>
                        </div>

                        <div className="flex flex-col gap-2 sm:flex-row">
                          <button
                            type="button"
                            disabled={busy}
                            onClick={saveUserAccess}
                            className="rounded-full bg-orange px-5 py-2.5 text-sm font-bold text-white disabled:opacity-60"
                          >
                            Save access changes
                          </button>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={resetUserAccess}
                            className="rounded-full border border-red-200 px-5 py-2.5 text-sm font-bold text-red-600 disabled:opacity-60"
                          >
                            Reset to free
                          </button>
                        </div>
                      </div>
                    )}

                    {!isAdmin && (
                      <p className="text-sm text-muted">Staff can view users. Only administrators can change roles and access.</p>
                    )}

                    <div>
                      <p className="text-sm font-bold">Purchased lessons ({purchasedIds.length})</p>
                      <ul className="mt-1 max-h-24 overflow-auto text-xs text-muted">
                        {purchasedIds.map((id) => (
                          <li key={id}>{getLesson(id)?.title || id}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-sm font-bold">Completed ({completedIds.length})</p>
                      <ul className="mt-1 max-h-24 overflow-auto text-xs text-muted">
                        {completedIds.slice(0, 8).map((id) => (
                          <li key={id}>{getLesson(id)?.title || id}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-sm font-bold">Favorites ({favoriteIds.length})</p>
                      <ul className="mt-1 max-h-24 overflow-auto text-xs text-muted">
                        {favoriteIds.slice(0, 8).map((id) => (
                          <li key={id}>{getLesson(id)?.title || id}</li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}

                {tab === "credits" && isAdmin && (
                  <>
                    <p className="text-sm"><strong>Credits:</strong> {selected.creditBalance}</p>
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
          </>
        )}

        {tab === "payment-processor" && isAdmin && <PaymentProcessorPanel />}

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
            <h2 className="text-xl font-black">Trainer Assignments</h2>
            <p className="mt-1 text-sm text-muted">Review dog assignments and approve trainers before they can message clients.</p>
            {!trainerContracts.length ? (
              <p className="mt-4 text-sm text-muted">No trainer requests yet.</p>
            ) : (
              <div className="mt-4 overflow-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-gray-100">
                      <th className="py-2 pr-4">Date</th>
                      <th className="py-2 pr-4">Dog</th>
                      <th className="py-2 pr-4">Owner</th>
                      <th className="py-2 pr-4">Trainer</th>
                      <th className="py-2 pr-4">Report</th>
                      <th className="py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trainerContracts.map((c) => (
                      <tr key={c.id} className="border-b border-gray-50 align-top">
                        <td className="py-3 pr-4 text-muted">{new Date(c.createdAt).toLocaleString()}</td>
                        <td className="py-3 pr-4">
                          <p className="font-bold">{c.dogName || "—"}</p>
                          <p className="text-xs text-muted">{[c.dogBreed, c.dogAge].filter(Boolean).join(" · ")}</p>
                        </td>
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
                          <Badge status={c.status === "pending_admin" || c.status === "pending" ? "warning" : c.status === "approved" || c.status === "active" ? "healthy" : "critical"} />
                          <p className="mt-1 text-[10px] uppercase text-muted">{c.status.replace("_", " ")}</p>
                          {(c.status === "pending_admin" || c.status === "pending") && (
                            <div className="mt-3 flex flex-col gap-2">
                              <button
                                disabled={busy}
                                onClick={() => reviewContract(c.id, "approve")}
                                className="rounded-full bg-success px-3 py-1.5 text-xs font-bold text-white disabled:opacity-60"
                              >
                                Approve
                              </button>
                              <button
                                disabled={busy}
                                onClick={() => reviewContract(c.id, "decline")}
                                className="rounded-full border border-gray-200 px-3 py-1.5 text-xs font-bold disabled:opacity-60"
                              >
                                Decline
                              </button>
                            </div>
                          )}
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
          <div className="mt-8 space-y-4">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setLogsView("activity")}
                className={`rounded-full px-4 py-2 text-sm font-bold ${logsView === "activity" ? "bg-orange text-white" : "bg-white border border-gray-200 text-charcoal"}`}
              >
                User Activity
              </button>
              <button
                onClick={() => setLogsView("errors")}
                className={`rounded-full px-4 py-2 text-sm font-bold ${logsView === "errors" ? "bg-orange text-white" : "bg-white border border-gray-200 text-charcoal"}`}
              >
                Error Logs
              </button>
            </div>

            {logsView === "activity" ? (
              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h2 className="text-xl font-black">User Activity</h2>
                    <p className="mt-1 text-sm text-muted">Logins, messages, admin changes, lessons, payments, and trainer requests.</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <select
                      value={activityCategory}
                      onChange={(e) => setActivityCategory(e.target.value as (typeof activityCategories)[number])}
                      className="rounded-xl border border-gray-200 px-3 py-2 text-sm"
                    >
                      {activityCategories.map((c) => (
                        <option key={c} value={c}>
                          {c === "all" ? "All categories" : c}
                        </option>
                      ))}
                    </select>
                    <input
                      value={activitySearch}
                      onChange={(e) => setActivitySearch(e.target.value)}
                      placeholder="Search email or summary…"
                      className="rounded-xl border border-gray-200 px-3 py-2 text-sm min-w-[200px]"
                    />
                  </div>
                </div>
                {!activityLogs.length ? (
                  <p className="mt-4 text-sm text-muted">No activity logged yet.</p>
                ) : (
                  <div className="mt-4 overflow-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="py-2 pr-4">Time</th>
                          <th className="py-2 pr-4">Category</th>
                          <th className="py-2 pr-4">User</th>
                          <th className="py-2 pr-4">Action</th>
                          <th className="py-2">Summary</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activityLogs.map((row) => (
                          <tr key={row.id} className="border-b border-gray-50 align-top">
                            <td className="py-2 pr-4 whitespace-nowrap text-muted">{new Date(row.createdAt).toLocaleString()}</td>
                            <td className="py-2 pr-4">
                              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-black uppercase">{row.category}</span>
                            </td>
                            <td className="py-2 pr-4">
                              <p className="font-semibold">{row.userEmail || "—"}</p>
                              {row.actorEmail && row.actorEmail !== row.userEmail && (
                                <p className="text-xs text-muted">by {row.actorEmail}</p>
                              )}
                            </td>
                            <td className="py-2 pr-4 font-mono text-xs">{row.action}</td>
                            <td className="py-2">{row.summary}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-3xl bg-white p-6 shadow-sm">
                <h2 className="text-xl font-black">Error Logs</h2>
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
          </div>
        )}
      </main>
    </div>
  );
}
