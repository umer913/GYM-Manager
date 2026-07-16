"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../Sidebar";
import { apiCall } from "../../../../utils/api";
import { useToast, useConfirm } from "../../../../components/ui/UIProvider";

// ── helpers ────────────────────────────────────────────────────────────────────

function initials(name = "") {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?";
}

function StatusBadge({ status }) {
  const map = {
    active:   "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    expired:  "bg-red-500/10    text-red-400    border-red-500/20",
    inactive: "bg-zinc-800      text-zinc-400   border-zinc-700",
    none:     "bg-zinc-800      text-zinc-400   border-zinc-700",
  };
  const label = { active: "Active", expired: "Expired", inactive: "Inactive", none: "No Plan" };
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${map[status] || map.none}`}>
      {label[status] || "No Plan"}
    </span>
  );
}

// ── Edit Member Modal ──────────────────────────────────────────────────────────

function EditMemberModal({ member, plans, trainers, onClose, onSaved }) {
  const confirm = useConfirm();

  // Normalize IDs to strings to avoid object vs string comparison issues
  const originalTrainerId = String(member.assignedTrainer?._id || "");
  const originalPlanId    = String(member.plan?._id || "");

  const [planId, setPlanId]       = useState(originalPlanId);
  const [trainerId, setTrainerId] = useState(originalTrainerId);
  const [status, setStatus]       = useState(member.membershipStatus || "inactive");
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState("");

  // Only flag as changed if the trainer is actually different from what was saved
  const trainerChanged = trainerId !== originalTrainerId;
  const hadTrainer     = !!originalTrainerId;

  const handleTrainerChange = (e) => setTrainerId(e.target.value);

  const handleSave = async () => {
    // Warn before changing away from an existing trainer
    if (trainerChanged && hadTrainer) {
      const oldTrainerName = member.assignedTrainer?.name || "current trainer";
      const newTrainer     = trainers.find(t => String(t._id) === trainerId);
      const newTrainerName = newTrainer?.name || (trainerId ? "new trainer" : "No Trainer");

      const confirmed = await confirm({
        variant: "delete",
        title: "Change Trainer?",
        message: `Switching from "${oldTrainerName}" to "${newTrainerName}" will permanently delete this member's workout plan and diet plan. This cannot be undone.`,
        confirmText: "Yes, Change Trainer",
        cancelText: "Keep Current Trainer",
      });
      if (!confirmed) return;
    }

    setSaving(true); setError("");
    const body = { memberId: member._id };
    if (planId    !== originalPlanId)    body.planId = planId || null;
    if (trainerChanged)                  body.assignedTrainerId = trainerId || null;
    if (status !== member.membershipStatus) body.status = status;

    const { data, ok } = await apiCall("/api/manager/members", {
      method: "PUT",
      body: JSON.stringify(body),
    });
    setSaving(false);
    if (ok && data.success) { onSaved(data.member); onClose(); }
    else setError(data.message || "Failed to update member.");
  };

  const sel = "w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-white focus:outline-none focus:border-red-500 transition cursor-pointer";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 space-y-5 text-white animate-modal-pop max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/>
              </svg>
            </div>
            <div>
              <p className="font-black text-white text-sm">{member.name}</p>
              <p className="text-xs text-zinc-500">{member.email}</p>
            </div>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition cursor-pointer">
            ✕
          </button>
        </div>

        {error && <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl">⚠️ {error}</div>}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Assign Plan</label>
            <select value={planId} onChange={(e) => setPlanId(e.target.value)} className={sel}>
              <option value="">— No Plan —</option>
              {plans.map((p) => <option key={p._id} value={p._id}>{p.name} · Rs {p.price?.toLocaleString()} / {p.duration}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Assign Trainer</label>
            <select value={trainerId} onChange={handleTrainerChange} className={sel}>
              <option value="">— No Trainer —</option>
              {trainers.map((t) => <option key={t._id} value={t._id}>{t.name} · {t.specialty}</option>)}
            </select>
            {/* Warning shown inline when trainer is being changed */}
            {trainerChanged && hadTrainer && (
              <div className="mt-2 flex items-start gap-2 p-2.5 rounded-lg bg-amber-500/8 border border-amber-500/20">
                <svg className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                </svg>
                <p className="text-xs text-amber-400 leading-relaxed">
                  Changing trainer will <span className="font-bold">permanently delete</span> this member's current workout and diet plan.
                </p>
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">Membership Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className={sel}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        <div className="flex gap-2 pt-2 border-t border-zinc-800">
          <button onClick={onClose}
            className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 font-bold rounded-xl text-sm transition cursor-pointer">
            Cancel
          </button>
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-2.5 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 font-bold rounded-xl text-sm transition disabled:opacity-50 cursor-pointer shadow-lg shadow-red-500/20">
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function MembersPage() {
  const router  = useRouter();
  const toast   = useToast();
  const confirm = useConfirm();

  const [members, setMembers]   = useState([]);
  const [plans, setPlans]       = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [search, setSearch]     = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editMember, setEditMember]     = useState(null);
  const [page, setPage]                 = useState(1);
  const ITEMS_PER_PAGE = 15;

  const fetchAll = async () => {
    setLoading(true);
    const [mRes, pRes, tRes] = await Promise.all([
      apiCall("/api/manager/members"),
      apiCall("/api/manager/plans"),
      apiCall("/api/manager/trainers"),
    ]);
    if (mRes.ok) setMembers(mRes.data.members || []);
    else setError(mRes.data.message || "Failed to load members.");
    if (pRes.ok) setPlans(pRes.data.plans || []);
    if (tRes.ok) setTrainers(tRes.data.trainers || []);
    setLoading(false);
  };

  useEffect(() => {
    if (!localStorage.getItem("token")) { router.push("/Login"); return; }
    fetchAll();
  }, [router]);

  useEffect(() => { setPage(1); }, [search, statusFilter]);

  const filtered = useMemo(() => members.filter((m) => {
    const matchSearch = !search ||
      m.name?.toLowerCase().includes(search.toLowerCase()) ||
      m.email?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || m.subscriptionStatus === statusFilter;
    return matchSearch && matchStatus;
  }), [members, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const safePage   = Math.min(page, totalPages);
  const paginatedMembers = useMemo(() => {
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    return filtered.slice(start, start + ITEMS_PER_PAGE);
  }, [filtered, safePage]);

  const counts = useMemo(() => ({
    total:    members.length,
    active:   members.filter((m) => m.subscriptionStatus === "active").length,
    expired:  members.filter((m) => m.subscriptionStatus === "expired").length,
    inactive: members.filter((m) => m.subscriptionStatus === "inactive" || m.subscriptionStatus === "none").length,
  }), [members]);

  const handleSaved = (updated) => {
    setMembers((prev) => prev.map((m) => m._id === updated._id ? { ...m, ...updated } : m));
    toast.success(`${updated.name} updated successfully.`);
  };

  const handleDelete = async (member) => {
    const confirmed = await confirm({
      variant: "delete",
      title: `Delete "${member.name}"?`,
      message: "This member and all their data will be permanently removed. This action cannot be undone.",
      confirmText: "Delete Member",
    });
    if (!confirmed) return;
    const { data, ok } = await apiCall("/api/manager/members", {
      method: "DELETE",
      body: JSON.stringify({ memberId: member._id }),
    });
    if (ok && data.success) {
      setMembers((prev) => prev.filter((m) => m._id !== member._id));
      toast.success(`${member.name} has been deleted.`);
    } else {
      toast.error(data.message || "Failed to delete member.");
    }
  };

  const dateStr = new Date().toLocaleDateString("en-PK", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans">
      <Sidebar active="Members" />

      <div className="lg:ml-60 flex flex-col min-h-screen pt-14 lg:pt-0">

        <header className="sticky top-14 lg:top-0 z-20 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/60 px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Members</h1>
            <p className="text-xs text-zinc-500 hidden sm:block">{dateStr}</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center font-bold text-sm shadow-lg shadow-red-500/20">GM</div>
        </header>

        <main className="flex-1 px-3 sm:px-6 py-6 space-y-6 max-w-7xl mx-auto w-full">

          {error && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">⚠️ {error}</div>}

          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Total Members", value: counts.total,    accent: "from-red-500 to-orange-500" },
              { label: "Active",        value: counts.active,   accent: "from-emerald-500 to-teal-500" },
              { label: "Expired",       value: counts.expired,  accent: "from-amber-500 to-yellow-500" },
              { label: "No Plan",       value: counts.inactive, accent: "from-zinc-500 to-zinc-600" },
            ].map(({ label, value, accent }) => (
              <div key={label} className="relative rounded-2xl overflow-hidden bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 p-5 group transition">
                <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${accent}`} />
                <div className="relative z-10">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">{label}</p>
                  <p className={`text-3xl font-black leading-none text-transparent bg-clip-text bg-gradient-to-r ${accent}`}>{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Search + filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35"/>
              </svg>
              <input type="text" placeholder="Search by name or email…" value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-red-500 transition text-sm" />
            </div>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-red-500 transition text-sm cursor-pointer">
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="expired">Expired</option>
              <option value="inactive">Inactive</option>
              <option value="none">No Plan</option>
            </select>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
              <p className="text-zinc-500 text-sm">Loading members…</p>
            </div>
          ) : paginatedMembers.length === 0 ? (
            <div className="rounded-2xl bg-zinc-900/80 border border-dashed border-zinc-700 p-14 text-center">
              <div className="w-14 h-14 rounded-2xl bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
              </div>
              <p className="text-zinc-400 text-sm">{search ? "No members match your search." : "No members registered yet."}</p>
            </div>
          ) : (
            <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 overflow-hidden">
              <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
                <h3 className="font-bold text-white">All Members</h3>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                  {Math.min(safePage * ITEMS_PER_PAGE, filtered.length)} / {filtered.length}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wider">
                      <th className="text-left px-3 sm:px-5 py-3">Member</th>
                      <th className="text-left px-3 sm:px-5 py-3 hidden sm:table-cell">Email</th>
                      <th className="text-left px-3 sm:px-5 py-3 hidden md:table-cell">Plan</th>
                      <th className="text-left px-3 sm:px-5 py-3 hidden lg:table-cell">Trainer</th>
                      <th className="text-left px-3 sm:px-5 py-3 hidden lg:table-cell">Expires</th>
                      <th className="text-left px-3 sm:px-5 py-3">Status</th>
                      <th className="text-left px-3 sm:px-5 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedMembers.map((m) => (
                      <tr key={m._id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                        <td className="px-3 sm:px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center text-xs font-black text-red-400 shrink-0">
                              {initials(m.name)}
                            </div>
                            <span className="font-semibold text-white text-sm truncate max-w-[80px] sm:max-w-none">{m.name}</span>
                          </div>
                        </td>
                        <td className="px-3 sm:px-5 py-3 text-zinc-400 hidden sm:table-cell text-xs">{m.email}</td>
                        <td className="px-3 sm:px-5 py-3 text-zinc-400 hidden md:table-cell">
                          {m.plan
                            ? <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border bg-zinc-800 border-zinc-700 text-zinc-300">{m.plan.name}</span>
                            : <span className="text-zinc-600">—</span>}
                        </td>
                        <td className="px-3 sm:px-5 py-3 text-zinc-400 hidden lg:table-cell text-xs">
                          {m.assignedTrainer?.name || <span className="text-zinc-600">—</span>}
                        </td>
                        <td className="px-3 sm:px-5 py-3 text-zinc-400 hidden lg:table-cell text-xs">
                          {m.subscriptionExpiresAt
                            ? new Date(m.subscriptionExpiresAt).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })
                            : <span className="text-zinc-600">—</span>}
                        </td>
                        <td className="px-3 sm:px-5 py-3">
                          <StatusBadge status={m.subscriptionStatus} />
                        </td>
                        <td className="px-3 sm:px-5 py-3">
                          <div className="flex items-center gap-1.5">
                            <button onClick={() => setEditMember(m)}
                              className="text-xs px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition cursor-pointer font-bold">
                              Edit
                            </button>
                            <button onClick={() => handleDelete(m)}
                              className="text-xs px-2.5 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition cursor-pointer font-bold"
                              title="Delete member">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-5 py-3 border-t border-zinc-800/50 flex items-center justify-between gap-3">
                  <p className="text-xs text-zinc-500">
                    Showing {(safePage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(safePage * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
                  </p>
                  <div className="flex items-center gap-1">
                    <button disabled={safePage === 1} onClick={() => setPage(p => Math.max(1, p - 1))}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition cursor-pointer disabled:opacity-30 disabled:cursor-default bg-zinc-800 hover:bg-zinc-700 text-zinc-300">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
                    </button>
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                      const start   = Math.max(1, Math.min(safePage - 2, totalPages - 4));
                      const pageNum = start + i;
                      if (pageNum > totalPages) return null;
                      return (
                        <button key={pageNum} onClick={() => setPage(pageNum)}
                          className={`w-8 h-8 rounded-lg text-xs font-bold transition cursor-pointer ${pageNum === safePage ? "bg-red-500/15 text-red-400 border border-red-500/25" : "bg-zinc-800 hover:bg-zinc-700 text-zinc-400"}`}>
                          {pageNum}
                        </button>
                      );
                    })}
                    <button disabled={safePage === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition cursor-pointer disabled:opacity-30 disabled:cursor-default bg-zinc-800 hover:bg-zinc-700 text-zinc-300">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/></svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

        </main>

        <footer className="border-t border-zinc-800/60 px-6 py-4 text-center text-xs text-zinc-600">
          © {new Date().getFullYear()} Fitcore — Gym Manager Portal
        </footer>
      </div>

      {editMember && (
        <EditMemberModal
          member={editMember}
          plans={plans}
          trainers={trainers}
          onClose={() => setEditMember(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
