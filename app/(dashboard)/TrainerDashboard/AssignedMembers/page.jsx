"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../Sidebar";
import MemberDetailModal from "../MemberDetailModal";
import { apiCall } from "../../../../utils/api";

export default function AssignedMembersPage() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/Login"); return; }
    (async () => {
      const { data: result, ok, status } = await apiCall("/api/trainer/dashboard");
      if (ok && result.success) {
        setData(result);
      } else {
        setError(result.message || "Failed to load assigned members.");
        if (status === 401 || status === 403) { localStorage.removeItem("token"); router.push("/Login"); }
      }
      setLoading(false);
    })();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-zinc-900 flex flex-col justify-center items-center gap-4">
        <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-zinc-500 tracking-widest uppercase">Loading members…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-zinc-900 flex flex-col justify-center items-center p-6 text-center gap-4">
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-sm max-w-md">{error}</div>
        <button onClick={() => window.location.reload()} className="px-5 py-2.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 rounded-xl text-sm transition cursor-pointer">
          Try Again
        </button>
      </div>
    );
  }

  const { trainer, assignedMembers } = data;
  const initials = trainer.name.split(" ").map((part) => part[0]).join("").toUpperCase().slice(0, 2);

  const filteredMembers = assignedMembers.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || member.membershipStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeCount   = assignedMembers.filter((m) => m.membershipStatus === "active").length;
  const inactiveCount = assignedMembers.filter((m) => m.membershipStatus === "inactive").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-zinc-900 text-neutral-100 font-sans selection:bg-red-500 selection:text-white">
      <Sidebar active="Assigned Members" trainer={trainer} />

      <div className="lg:ml-60 flex flex-col min-h-screen pt-14 lg:pt-0">
        <header className="sticky top-0 z-20 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-md border-b border-zinc-900/60 px-5 sm:px-8 py-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-red-500">Trainer Portal</p>
            <h1 className="text-lg sm:text-xl font-black uppercase tracking-tight text-white mt-0.5 leading-none">Assigned Members</h1>
          </div>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center font-black text-sm text-white shadow-lg shadow-red-500/20">
            {initials}
          </div>
        </header>

        <main className="flex-1 px-5 sm:px-8 py-6 space-y-6 max-w-6xl mx-auto w-full">

          {/* Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: "Total Members", value: assignedMembers.length,  accent: "from-red-500 to-orange-500" },
              { label: "Active",        value: activeCount,             accent: "from-emerald-500 to-teal-500" },
              { label: "Inactive",      value: inactiveCount,           accent: "from-zinc-500 to-zinc-600" },
            ].map(({ label, value, bigLabel, accent }) => (
              <div key={label} className="relative rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-zinc-700 p-6 group transition">
                <span className="absolute -bottom-3 -right-2 text-7xl font-black uppercase tracking-tighter text-white/[0.04] select-none pointer-events-none leading-none">{bigLabel}</span>
                <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${accent}`} />
                <div className={`absolute -top-8 -right-8 w-28 h-28 rounded-full bg-gradient-to-br ${accent} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`} />
                <div className="relative z-10">
                  <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500 mb-3">{label}</p>
                  <p className={`text-4xl font-black leading-none text-transparent bg-clip-text bg-gradient-to-r ${accent}`}>{value}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}><circle cx="11" cy="11" r="8"/><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35"/></svg>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-zinc-950/50 border border-zinc-800 text-white placeholder-zinc-600 focus:outline-none focus:border-red-500 transition text-sm"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 rounded-xl bg-zinc-950/50 border border-zinc-800 text-white focus:outline-none focus:border-red-500 transition text-sm cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>

          {/* Members Grid */}
          {filteredMembers.length === 0 ? (
            <div className="rounded-2xl bg-zinc-900/60 border border-dashed border-zinc-700 p-12 text-center">
              <div className="w-14 h-14 rounded-2xl bg-zinc-800 mx-auto flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <p className="text-zinc-400 text-sm">{searchTerm || statusFilter !== "all" ? "No members match your filters." : "No members assigned yet."}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredMembers.map((member) => {
                const memberInitials = member.name.split(" ").map((p) => p[0]).join("").toUpperCase().slice(0, 2);
                const joinedDate = member.createdAt
                  ? new Date(member.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })
                  : "—";
                return (
                  <div
                    key={member._id}
                    className="rounded-2xl bg-zinc-900/60 border border-zinc-800/80 p-5 hover:border-red-500/30 hover:-translate-y-0.5 transition-all cursor-pointer group"
                    onClick={() => setSelectedMember(member)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center font-black text-sm text-white shadow-md shadow-red-500/20">
                          {memberInitials}
                        </div>
                        <div>
                          <p className="font-black text-white uppercase tracking-tight text-sm group-hover:text-red-400 transition">{member.name}</p>
                          <p className="text-xs text-zinc-500">{member.email}</p>
                        </div>
                      </div>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full border shrink-0 ${
                        member.membershipStatus === "active"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-zinc-800 text-zinc-400 border-zinc-700"
                      }`}>
                        {member.membershipStatus === "active" ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-zinc-500 mb-4">
                      <div className="flex items-center justify-between">
                        <span>Plan</span>
                        <span className="text-white font-semibold">{member.plan?.name || "No Plan"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Joined</span>
                        <span className="text-white font-semibold">{joinedDate}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Workout plan</span>
                        {member.weeklyWorkoutPlan?.length === 7
                          ? <span className="text-emerald-400 font-semibold">✓ Set</span>
                          : <span className="text-zinc-600 font-semibold">Not set</span>}
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Diet plan</span>
                        {member.weeklyDietPlan?.calories
                          ? <span className="text-emerald-400 font-semibold">✓ Set</span>
                          : <span className="text-zinc-600 font-semibold">Not set</span>}
                      </div>
                    </div>

                    <button className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-600/15 to-orange-500/10 text-red-400 border border-red-500/20 hover:from-red-600/25 hover:to-orange-500/15 transition text-xs font-black uppercase tracking-wide">
                      Manage Plan & Attendance
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </main>

        <footer className="border-t border-zinc-900 px-6 py-5 text-center text-xs text-zinc-600 mt-auto">
          © {new Date().getFullYear()} Fitcore — Trainer Portal
        </footer>
      </div>

      {selectedMember && <MemberDetailModal member={selectedMember} onClose={() => setSelectedMember(null)} />}
    </div>
  );
}
