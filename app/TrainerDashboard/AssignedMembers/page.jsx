"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../Sidebar";
import MemberDetailModal from "../MemberDetailModal";
import { apiCall } from "../../../utils/api";

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
    if (!token) {
      router.push("/Login");
      return;
    }

    (async () => {
      const { data: result, ok, status } = await apiCall("/api/trainer/dashboard");
      if (ok && result.success) {
        setData(result);
      } else {
        setError(result.message || "Failed to load assigned members.");
        if (status === 401 || status === 403) {
          localStorage.removeItem("token");
          router.push("/Login");
        }
      }
      setLoading(false);
    })();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col justify-center items-center">
        <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-zinc-400">Loading assigned members...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col justify-center items-center p-6 text-center">
        <div className="p-4 bg-violet-500/10 border border-violet-500/20 text-violet-300 rounded-xl text-sm max-w-md mb-4">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-white rounded-xl text-sm transition cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  const { trainer, assignedMembers } = data;
  const initials = trainer.name.split(" ").map((part) => part[0]).join("").toUpperCase().slice(0, 2);

  // Filter logic
  const filteredMembers = assignedMembers.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || member.membershipStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeCount = assignedMembers.filter((m) => m.membershipStatus === "active").length;
  const inactiveCount = assignedMembers.filter((m) => m.membershipStatus === "inactive").length;

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans">
      <Sidebar active="Assigned Members" trainer={trainer} />

      <div className="lg:ml-64 flex flex-col min-h-screen">
        <header className="sticky top-0 z-20 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/60 px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-violet-400 font-semibold">Trainer Portal</p>
            <h1 className="text-xl font-bold mt-1">Assigned Members</h1>
            <p className="text-xs text-zinc-500">Manage weekly plans, diet, and attendance</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:block text-right">
              <p className="text-sm font-semibold">{trainer.name}</p>
              <p className="text-xs text-zinc-500">{trainer.specialty}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center font-bold text-sm">
              {initials}
            </div>
          </div>
        </header>

        <main className="flex-1 px-6 py-6 space-y-6">
          {/* Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Total Members</p>
                  <p className="text-3xl font-black mt-2">{assignedMembers.length}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center text-2xl">👥</div>
              </div>
            </div>

            <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Active</p>
                  <p className="text-3xl font-black mt-2 text-emerald-400">{activeCount}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-2xl">✅</div>
              </div>
            </div>

            <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Inactive</p>
                  <p className="text-3xl font-black mt-2 text-zinc-400">{inactiveCount}</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center text-2xl">⏸️</div>
              </div>
            </div>
          </div>

          {/* Search & Filter */}
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition text-sm"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-violet-500 transition text-sm cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
          </div>

          {/* Members Grid */}
          {filteredMembers.length === 0 ? (
            <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-zinc-800 mx-auto flex items-center justify-center text-3xl mb-4">👤</div>
              <p className="text-zinc-400 text-sm">
                {searchTerm || statusFilter !== "all" ? "No members match your filters" : "No members assigned yet"}
              </p>
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
                    className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-5 hover:border-violet-500/30 transition-all cursor-pointer group"
                    onClick={() => setSelectedMember(member)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center font-bold text-sm">
                          {memberInitials}
                        </div>
                        <div>
                          <p className="font-semibold text-white group-hover:text-violet-300 transition">{member.name}</p>
                          <p className="text-xs text-zinc-500">{member.email}</p>
                        </div>
                      </div>
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                          member.membershipStatus === "active"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                            : "bg-zinc-800 text-zinc-400 border-zinc-700"
                        }`}
                      >
                        {member.membershipStatus === "active" ? "Active" : "Inactive"}
                      </span>
                    </div>

                    <div className="space-y-2 text-xs text-zinc-500">
                      <div className="flex items-center justify-between">
                        <span>Plan:</span>
                        <span className="text-white font-medium">{member.plan?.name || "No Plan"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Joined:</span>
                        <span className="text-white font-medium">{joinedDate}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Workout plan:</span>
                        {member.weeklyWorkoutPlan?.length === 7 ? (
                          <span className="text-emerald-400 font-medium">✓ Set</span>
                        ) : (
                          <span className="text-zinc-600 font-medium">Not set</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Diet plan:</span>
                        {member.weeklyDietPlan?.calories ? (
                          <span className="text-emerald-400 font-medium">✓ Set</span>
                        ) : (
                          <span className="text-zinc-600 font-medium">Not set</span>
                        )}
                      </div>
                    </div>

                    <button className="w-full mt-4 py-2 rounded-lg bg-violet-600/20 text-violet-300 border border-violet-500/20 hover:bg-violet-600/30 transition text-xs font-semibold">
                      Manage Plan & Attendance
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </main>

        <footer className="border-t border-zinc-800/60 px-6 py-4 text-center text-xs text-zinc-600">
          © {new Date().getFullYear()} Fitcore — Trainer Portal
        </footer>
      </div>

      {selectedMember && <MemberDetailModal member={selectedMember} onClose={() => setSelectedMember(null)} />}
    </div>
  );
}
