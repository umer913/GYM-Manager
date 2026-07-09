"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../Sidebar";
import { apiCall } from "../../../utils/api";

export default function MembersPage() {
  const router = useRouter();
  const [members, setMembers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editPlan, setEditPlan] = useState("");
  const [editTrainer, setEditTrainer] = useState("");
  const [editStatus, setEditStatus] = useState("active");
  const [updating, setUpdating] = useState(false);

  const fetchAll = async () => {
    const [memRes, planRes, trRes] = await Promise.all([
      apiCall("/api/manager/members"),
      apiCall("/api/manager/plans"),
      apiCall("/api/manager/trainers"),
    ]);
    if (memRes.ok) setMembers(memRes.data.members || []);
    else setError(memRes.data.message || "Failed to fetch members");
    if (planRes.ok) setPlans(planRes.data.plans || []);
    if (trRes.ok) setTrainers(trRes.data.trainers || []);
    setLoading(false);
  };

  useEffect(() => {
    if (!localStorage.getItem("token")) { router.push("/Login"); return; }
    fetchAll();
  }, [router]);

  const openMember = (m) => {
    setSelectedMember(m);
    setEditPlan(m.plan?._id || "");
    setEditTrainer(m.assignedTrainer?._id || "");
    setEditStatus(m.membershipStatus || "active");
    setEditMode(false);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    const { data, ok } = await apiCall("/api/manager/members", {
      method: "PUT",
      body: JSON.stringify({
        memberId: selectedMember._id,
        planId: editPlan || null,
        assignedTrainerId: editTrainer || null,
        status: editStatus,
      }),
    });
    if (ok) {
      setMembers(prev => prev.map(m => m._id === selectedMember._id ? data.member : m));
      setSelectedMember(data.member);
      setEditMode(false);
    } else {
      alert(data.message || "Failed to update membership");
    }
    setUpdating(false);
  };

  const filtered = members.filter(m =>
    [m.name, m.email, m.phone, m.plan?.name].some(v => v?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const dateStr = new Date().toLocaleDateString("en-PK", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const selectedPlan = plans.find(p => p._id === editPlan);

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans">
      <Sidebar active="Members" />

      <div className="lg:ml-60 flex flex-col min-h-screen">
        <header className="sticky top-0 z-20 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/60 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Manage Members</h1>
            <p className="text-xs text-zinc-500">{dateStr}</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center font-bold text-sm">GM</div>
        </header>

        <main className="flex-1 px-6 py-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Total Members",      value: members.length,                                 accent: "from-blue-500 to-indigo-600" },
              { label: "Active Memberships", value: members.filter(m => m.membershipStatus === "active").length, accent: "from-emerald-500 to-teal-600" },
              { label: "Verified Users",     value: members.filter(m => m.isVerified).length,       accent: "from-violet-500 to-purple-600" },
            ].map(s => (
              <div key={s.label} className="rounded-2xl p-5 bg-zinc-900/80 border border-zinc-800 shadow-xl relative overflow-hidden">
                <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br ${s.accent} opacity-10 blur-2xl`} />
                <p className="text-zinc-400 text-xs font-medium uppercase tracking-widest mb-1">{s.label}</p>
                <h2 className="text-3xl font-black">{loading ? "..." : s.value}</h2>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-6 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="font-bold text-lg">Gym Members List</h3>
                <p className="text-xs text-zinc-500">View member details, assign plans and trainers</p>
              </div>
              <div className="relative w-full sm:w-72">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">🔍</span>
                <input type="text" placeholder="Search by name, email, plan..." value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-800 text-white placeholder-zinc-500 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm" />
              </div>
            </div>

            {error && <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">⚠️ {error}</div>}

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-zinc-400 text-sm">Loading members...</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 text-zinc-500 text-sm">No members found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wider">
                      <th className="text-left px-5 py-3">Member</th>
                      <th className="text-left px-5 py-3">Phone</th>
                      <th className="text-left px-5 py-3">Plan</th>
                      <th className="text-left px-5 py-3">Subscription</th>
                      <th className="text-left px-5 py-3">Trainer</th>
                      <th className="text-left px-5 py-3">Status</th>
                      <th className="text-right px-5 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(m => (
                      <tr key={m._id} className="border-b border-zinc-800/50 hover:bg-zinc-800/40 transition-colors">
                        <td className="px-5 py-3 font-medium text-white flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {m.name?.split(" ").map(n => n[0]).join("").toUpperCase() || "M"}
                          </div>
                          <div>
                            <p className="font-semibold">{m.name}</p>
                            <p className="text-xs text-zinc-500">{m.email}</p>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-zinc-300">{m.phone || "—"}</td>
                        <td className="px-5 py-3">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                            m.plan?.allowsTrainer ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-zinc-800 text-zinc-400 border-zinc-700"
                          }`}>
                            {m.plan?.name || "None"}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex flex-col gap-1">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                              m.subscriptionStatus === "active"
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : m.subscriptionStatus === "expired"
                                  ? "bg-red-500/10 text-red-400 border-red-500/20"
                                  : "bg-zinc-800 text-zinc-400 border-zinc-700"
                            }`}>
                              <span>{m.subscriptionBadge?.icon || "💳"}</span>
                              {m.subscriptionLabel || (m.plan ? "Subscribed" : "No Plan")}
                            </span>
                            {m.subscriptionExpiresAt && (
                              <span className="text-[10px] text-zinc-500">
                                Expires {new Date(m.subscriptionExpiresAt).toLocaleDateString("en-PK", { month: "short", day: "numeric", year: "numeric" })}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-5 py-3 text-zinc-300 font-medium">
                          {m.assignedTrainer ? `🏋️ ${m.assignedTrainer.name}` : "—"}
                        </td>
                        <td className="px-5 py-3">
                          <span className={`flex items-center gap-1 text-xs font-semibold ${m.membershipStatus === "inactive" ? "text-zinc-500" : "text-emerald-400"}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${m.membershipStatus === "inactive" ? "bg-zinc-600" : "bg-emerald-400"}`} />
                            {m.membershipStatus === "inactive" ? "Inactive" : "Active"}
                          </span>
                          <span className="text-[10px] text-zinc-500">{m.isVerified ? "Verified" : "Unverified"}</span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <button onClick={() => openMember(m)}
                            className="text-xs text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 px-3 py-1.5 rounded-lg transition font-bold">
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>

        <footer className="border-t border-zinc-800/60 px-6 py-4 text-center text-xs text-zinc-600">
          © {new Date().getFullYear()} Fitcore — Gym Manager Portal
        </footer>
      </div>

      {/* Member Drawer */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => { if (!updating) setSelectedMember(null); }} />
          <div className="relative w-full max-w-md h-full bg-zinc-900 border-l border-zinc-800 shadow-2xl p-6 flex flex-col justify-between text-white overflow-y-auto">
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-zinc-800">
                <h3 className="text-lg font-black uppercase tracking-wider">
                  {editMode ? "Edit Subscription" : "Member Profile"}
                </h3>
                <button onClick={() => { if (!updating) setSelectedMember(null); }}
                  className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition">
                  ✕
                </button>
              </div>

              {/* Avatar */}
              <div className="flex flex-col items-center gap-3 py-2">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-2xl font-black shadow-lg">
                  {selectedMember.name?.split(" ").map(n => n[0]).join("").toUpperCase() || "M"}
                </div>
                <h2 className="text-xl font-bold">{selectedMember.name}</h2>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                  selectedMember.plan?.allowsTrainer ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-zinc-800 text-zinc-400 border-zinc-700"
                }`}>
                  {selectedMember.plan ? `${selectedMember.plan.name} (${selectedMember.plan.duration})` : "No Active Plan"}
                </span>
              </div>

              {!editMode ? (
                <div className="space-y-4">
                  <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-3 text-sm">
                    {[
                      ["Email Address", selectedMember.email],
                      ["Phone Number", selectedMember.phone || "—"],
                      ["Assigned Trainer", selectedMember.assignedTrainer ? `🏋️ ${selectedMember.assignedTrainer.name} (${selectedMember.assignedTrainer.specialty})` : "No trainer assigned"],
                      ["Membership Expiry", selectedMember.membershipExpiresAt ? new Date(selectedMember.membershipExpiresAt).toLocaleDateString("en-PK", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) : "—"],
                    ].map(([label, val]) => (
                      <div key={label}>
                        <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">{label}</p>
                        <p className="font-semibold">{val}</p>
                      </div>
                    ))}
                    <div>
                      <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mb-1">Account Status</p>
                      <div className="flex gap-2">
                        <span className={`px-2 py-0.5 rounded-md text-xs font-semibold border ${selectedMember.membershipStatus === "inactive" ? "bg-zinc-800 text-zinc-400 border-zinc-700" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"}`}>
                          {selectedMember.membershipStatus === "inactive" ? "Inactive" : "Active"}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md text-xs font-semibold border ${selectedMember.isVerified ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"}`}>
                          {selectedMember.isVerified ? "Email Verified" : "Email Unverified"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => setEditMode(true)}
                    className="w-full py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold rounded-xl transition shadow cursor-pointer">
                    ✏ Edit Subscription Details
                  </button>
                </div>
              ) : (
                <form onSubmit={handleUpdate} className="space-y-4">
                  <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Subscription Plan</label>
                      <select value={editPlan}
                        onChange={e => {
                          setEditPlan(e.target.value);
                          if (!plans.find(p => p._id === e.target.value)?.allowsTrainer) setEditTrainer("");
                        }}
                        className="w-full px-3 py-2.5 rounded-lg bg-zinc-900 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm">
                        <option value="">None (No Plan)</option>
                        {plans.map(p => (
                          <option key={p._id} value={p._id}>{p.name} (Rs {p.price.toLocaleString()} · {p.duration})</option>
                        ))}
                      </select>
                    </div>

                    {selectedPlan?.allowsTrainer ? (
                      <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Select Trainer</label>
                        <select value={editTrainer} required onChange={e => setEditTrainer(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-lg bg-zinc-900 border border-emerald-800/80 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm">
                          <option value="">-- Choose Trainer --</option>
                          {trainers.map(t => <option key={t._id} value={t._id}>{t.name} ({t.specialty} · {t.timings})</option>)}
                        </select>
                        <p className="text-[10px] text-emerald-400 font-semibold mt-1">✓ Plan allows trainer selection</p>
                      </div>
                    ) : (
                      <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-500">
                        🚫 Trainer selection not available for this plan.
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Status</label>
                      <select value={editStatus} onChange={e => setEditStatus(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg bg-zinc-900 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm">
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" disabled={updating} onClick={() => setEditMode(false)}
                      className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 font-bold rounded-xl transition text-sm disabled:opacity-50">
                      Cancel
                    </button>
                    <button type="submit" disabled={updating}
                      className="flex-1 py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 font-bold rounded-xl transition text-sm disabled:opacity-50">
                      {updating ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              )}
            </div>

            <div className="pt-4 border-t border-zinc-800 mt-6">
              <button disabled={updating} onClick={() => setSelectedMember(null)}
                className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-bold rounded-xl transition disabled:opacity-50 text-sm">
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
