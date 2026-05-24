"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../Sidebar";

export default function MembersPage() {
  const router = useRouter();
  const [members, setMembers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);

  // Edit Subscription States
  const [editMode, setEditMode] = useState(false);
  const [editPlan, setEditPlan] = useState("");
  const [editTrainer, setEditTrainer] = useState("");
  const [editStatus, setEditStatus] = useState("active");
  const [updating, setUpdating] = useState(false);

  const fetchMembersData = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/Login");
      return;
    }

    try {
      // Fetch members
      const res = await fetch("/api/manager/members", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (res.ok) {
        setMembers(data.members || []);
      } else {
        setError(data.message || "Failed to fetch members");
      }

      // Fetch plans
      const plansRes = await fetch("/api/manager/plans", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      const plansData = await plansRes.json();
      if (plansRes.ok) {
        setPlans(plansData.plans || []);
      }

      // Fetch trainers
      const trainersRes = await fetch("/api/manager/trainers", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      const trainersData = await trainersRes.json();
      if (trainersRes.ok) {
        setTrainers(trainersData.trainers || []);
      }

    } catch (err) {
      setError("An error occurred while fetching members dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembersData();
  }, [router]);

  const handleSelectMember = (member) => {
    setSelectedMember(member);
    setEditPlan(member.plan?._id || "");
    setEditTrainer(member.assignedTrainer?._id || "");
    setEditStatus(member.membershipStatus || "active");
    setEditMode(false);
  };

  const handleUpdateSubscription = async (e) => {
    e.preventDefault();
    setUpdating(true);
    const token = localStorage.getItem("token");

    try {
      const res = await fetch("/api/manager/members", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          memberId: selectedMember._id,
          planId: editPlan || null,
          assignedTrainerId: editTrainer || null,
          status: editStatus
        })
      });

      const data = await res.json();
      if (res.ok) {
        setMembers(prev => prev.map(m => m._id === selectedMember._id ? data.member : m));
        setSelectedMember(data.member);
        setEditMode(false);
        alert("Subscription plan and trainer details updated successfully!");
      } else {
        alert(data.message || "Failed to update membership");
      }
    } catch (err) {
      alert("An error occurred while saving subscription details.");
    } finally {
      setUpdating(false);
    }
  };

  // Filter members based on search query
  const filteredMembers = members.filter(m =>
    m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.phone?.includes(searchQuery) ||
    m.plan?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalMembers = members.length;
  const activeMembers = members.filter(m => m.membershipStatus === "active" || m.membershipStatus === undefined).length;
  const verifiedMembers = members.filter(m => m.isVerified).length;

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-PK", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  // Check if selected plan allows trainer selection
  const selectedPlanObj = plans.find(p => p._id === editPlan);
  const trainerSelectionAllowed = selectedPlanObj?.allowsTrainer;

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-red-500 selection:text-white">
      <Sidebar active="Members" />

      {/* Main content */}
      <div className="lg:ml-60 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="sticky top-0 z-20 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/60 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Manage Members</h1>
            <p className="text-xs text-zinc-500">{dateStr}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center font-bold text-sm">GM</div>
          </div>
        </header>

        <main className="flex-1 px-6 py-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl p-5 bg-zinc-900/80 border border-zinc-800 shadow-xl relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 opacity-10 blur-2xl" />
              <p className="text-zinc-400 text-xs font-medium uppercase tracking-widest mb-1">Total Members</p>
              <h2 className="text-3xl font-black text-white">{loading ? "..." : totalMembers}</h2>
            </div>
            <div className="rounded-2xl p-5 bg-zinc-900/80 border border-zinc-800 shadow-xl relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 opacity-10 blur-2xl" />
              <p className="text-zinc-400 text-xs font-medium uppercase tracking-widest mb-1">Active Memberships</p>
              <h2 className="text-3xl font-black text-white">{loading ? "..." : activeMembers}</h2>
            </div>
            <div className="rounded-2xl p-5 bg-zinc-900/80 border border-zinc-800 shadow-xl relative overflow-hidden group">
              <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 opacity-10 blur-2xl" />
              <p className="text-zinc-400 text-xs font-medium uppercase tracking-widest mb-1">Verified Users</p>
              <h2 className="text-3xl font-black text-white">{loading ? "..." : verifiedMembers}</h2>
            </div>
          </div>

          {/* Search and Table Container */}
          <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-6 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="font-bold text-white text-lg">Gym Members List</h3>
                <p className="text-xs text-zinc-500">View member details, assign plans and trainers</p>
              </div>
              <div className="relative w-full sm:w-72">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">🔍</span>
                <input
                  type="text"
                  placeholder="Search by name, email, plan..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-800 text-white placeholder-zinc-500 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all text-sm"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                ⚠️ {error}
              </div>
            )}

            {/* Loading/Table Section */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-zinc-400 text-sm font-semibold">Loading members...</span>
              </div>
            ) : filteredMembers.length === 0 ? (
              <div className="text-center py-20 text-zinc-500 text-sm">
                No members found.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wider">
                      <th className="text-left px-5 py-3">Member</th>
                      <th className="text-left px-5 py-3">Phone</th>
                      <th className="text-left px-5 py-3">Plan</th>
                      <th className="text-left px-5 py-3">Assigned Trainer</th>
                      <th className="text-left px-5 py-3">Status</th>
                      <th className="text-right px-5 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMembers.map((m) => (
                      <tr key={m._id} className="border-b border-zinc-800/50 hover:bg-zinc-800/40 transition-colors">
                        <td className="px-5 py-3 font-medium text-white flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {m.name ? m.name.split(" ").map(n => n[0]).join("").toUpperCase() : "M"}
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
                            {m.plan ? m.plan.name : "None"}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <span className="text-zinc-300 font-medium">
                            {m.assignedTrainer ? `🏋️ ${m.assignedTrainer.name}` : "—"}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex flex-col gap-1">
                            <span className={`flex items-center gap-1 text-xs font-semibold ${
                              m.membershipStatus === "inactive" ? "text-zinc-505" : "text-emerald-400"
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${m.membershipStatus === "inactive" ? "bg-zinc-650" : "bg-emerald-400"}`} />
                              {m.membershipStatus === "inactive" ? "Inactive" : "Active"}
                            </span>
                            <span className="text-[10px] text-zinc-550">
                              {m.isVerified ? "Verified" : "Unverified"}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <button
                            onClick={() => handleSelectMember(m)}
                            className="text-xs text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 px-3 py-1.5 rounded-lg transition-colors font-bold"
                          >
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

      {/* Details Slide-out Drawer / Modal */}
      {selectedMember && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity duration-300">
          <div className="absolute inset-0" onClick={() => { if (!updating) setSelectedMember(null); }} />
          
          <div className="relative w-full max-w-md h-full bg-zinc-900 border-l border-zinc-800 shadow-2xl p-6 flex flex-col justify-between transition-transform duration-300 text-white overflow-y-auto">
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-zinc-800">
                <h3 className="text-lg font-black uppercase tracking-wider">
                  {editMode ? "Edit subscription" : "Member Profile"}
                </h3>
                <button
                  onClick={() => { if (!updating) setSelectedMember(null); }}
                  className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              <div className="flex flex-col items-center gap-3 py-2">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-2xl font-black shadow-lg">
                  {selectedMember.name ? selectedMember.name.split(" ").map(n => n[0]).join("").toUpperCase() : "M"}
                </div>
                <h2 className="text-xl font-bold">{selectedMember.name}</h2>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                  selectedMember.plan?.allowsTrainer ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-zinc-800 text-zinc-400 border-zinc-750"
                }`}>
                  {selectedMember.plan ? `${selectedMember.plan.name} (${selectedMember.plan.duration})` : "No Active Plan"}
                </span>
              </div>

              {!editMode ? (
                // VIEW DETAILS MODE
                <div className="space-y-4">
                  <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 space-y-3">
                    <div>
                      <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Email Address</p>
                      <p className="text-sm font-semibold">{selectedMember.email}</p>
                    </div>
                    <div>
                      <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Phone Number</p>
                      <p className="text-sm font-semibold">{selectedMember.phone || "—"}</p>
                    </div>
                    <div>
                      <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Assigned Trainer</p>
                      <p className="text-sm font-semibold text-emerald-400">
                        {selectedMember.assignedTrainer ? `🏋️ ${selectedMember.assignedTrainer.name} (${selectedMember.assignedTrainer.specialty})` : "No trainer assigned"}
                      </p>
                    </div>
                    <div>
                      <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Membership Expiry</p>
                      <p className="text-sm font-semibold">
                        {selectedMember.membershipExpiresAt 
                          ? new Date(selectedMember.membershipExpiresAt).toLocaleDateString("en-PK", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
                          : "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Account Status</p>
                      <div className="flex gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded-md text-xs font-semibold border ${
                          selectedMember.membershipStatus === "inactive" ? "bg-zinc-800 text-zinc-400 border-zinc-700" : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        }`}>
                          {selectedMember.membershipStatus === "inactive" ? "Inactive" : "Active"}
                        </span>
                        <span className={`px-2 py-0.5 rounded-md text-xs font-semibold border ${
                          selectedMember.isVerified ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                        }`}>
                          {selectedMember.isVerified ? "Email Verified" : "Email Unverified"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setEditMode(true)}
                    className="w-full py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold rounded-xl transition-all shadow-md"
                  >
                    ✏ Edit Subscription Details
                  </button>
                </div>
              ) : (
                // EDIT SUBSCRIPTION PLAN & TRAINER
                <form onSubmit={handleUpdateSubscription} className="space-y-4">
                  <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-850 space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Subscription Plan</label>
                      <select
                        value={editPlan}
                        onChange={(e) => {
                          setEditPlan(e.target.value);
                          // Reset trainer if the new plan doesn't support trainer selection
                          const selected = plans.find(p => p._id === e.target.value);
                          if (!selected?.allowsTrainer) {
                            setEditTrainer("");
                          }
                        }}
                        className="w-full px-3 py-2.5 rounded-lg bg-zinc-900 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                      >
                        <option value="">None (No Plan)</option>
                        {plans.map(p => (
                          <option key={p._id} value={p._id}>
                            {p.name} (Rs {p.price.toLocaleString()} · {p.duration})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Trainer Selector: Only visible if trainer selection is allowed */}
                    {trainerSelectionAllowed ? (
                      <div>
                        <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">
                          Select Trainer of Choice
                        </label>
                        <select
                          value={editTrainer}
                          required
                          onChange={(e) => setEditTrainer(e.target.value)}
                          className="w-full px-3 py-2.5 rounded-lg bg-zinc-900 border border-emerald-800/80 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                        >
                          <option value="">-- Choose Personal Trainer --</option>
                          {trainers.map(t => (
                            <option key={t._id} value={t._id}>
                              {t.name} ({t.specialty} · {t.timings})
                            </option>
                          ))}
                        </select>
                        <p className="text-[10px] text-emerald-400 font-semibold mt-1">
                          ✓ Plan allows custom trainer selection
                        </p>
                      </div>
                    ) : (
                      <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-lg text-xs text-zinc-500">
                        🚫 Trainer selection is not available for the selected plan. Select a Premium Plan to assign a trainer.
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Status</label>
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value)}
                        className="w-full px-3 py-2.5 rounded-lg bg-zinc-900 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={updating}
                      onClick={() => setEditMode(false)}
                      className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-750 font-bold rounded-xl transition text-sm disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={updating}
                      className="flex-1 py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 font-bold rounded-xl transition text-sm shadow-md disabled:opacity-50"
                    >
                      {updating ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              )}
            </div>

            <div className="pt-4 border-t border-zinc-800 mt-6">
              <button
                disabled={updating}
                onClick={() => setSelectedMember(null)}
                className="w-full py-3 bg-zinc-850 hover:bg-zinc-800 text-zinc-300 font-bold rounded-xl transition-all disabled:opacity-50 text-sm"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
