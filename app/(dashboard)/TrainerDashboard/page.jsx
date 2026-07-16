"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import ProgressBar from "../../../components/ProgressBar";
import WeekGrid from "../../../components/WeekGrid";
import MemberDetailModal from "./MemberDetailModal";
import { apiCall } from "../../../utils/api";

const MOTTO = [
  "Consistency is your strongest rep.",
  "Small progress compounds into real strength.",
  "Your schedule is your advantage.",
  "Coach the habit, not just the workout.",
];

function StatCard({ label, value, sub, bigLabel, accent = "from-red-500 to-orange-500", delay = 0 }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div
      className={`relative rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-zinc-700 group transition-all duration-700 p-6
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
      style={{ transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms, border-color 0.3s` }}
    >
      <span className="absolute -bottom-3 -right-2 text-7xl font-black uppercase tracking-tighter text-white/[0.04] select-none pointer-events-none leading-none">
        {bigLabel}
      </span>
      <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${accent}`} />
      <div className={`absolute -top-8 -right-8 w-28 h-28 rounded-full bg-gradient-to-br ${accent} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity duration-500`} />
      <div className="relative z-10">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500 mb-3">{label}</p>
        <p className={`text-4xl font-black leading-none text-transparent bg-clip-text bg-gradient-to-r ${accent}`}>{value}</p>
        {sub && <p className="text-xs text-zinc-500 mt-2 leading-snug">{sub}</p>}
      </div>
    </div>
  );
}

export default function TrainerDashboard() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMember, setSelectedMember] = useState(null);
  const motto = useMemo(() => MOTTO[Math.floor(Math.random() * MOTTO.length)], []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/Login"); return; }
    (async () => {
      const { data: result, ok, status } = await apiCall("/api/trainer/dashboard");
      if (ok && result.success) {
        setData(result);
      } else {
        setError(result.message || "Failed to load trainer dashboard.");
        if (status === 401 || status === 403) { localStorage.removeItem("token"); router.push("/Login"); }
      }
      setLoading(false);
    })();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-zinc-900 flex flex-col justify-center items-center gap-4">
        <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-zinc-500 tracking-widest uppercase">Loading workspace…</p>
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

  const { trainer, assignedMembers, todayCheckIns, weekCheckIns, totals } = data;
  const initials = trainer.name.split(" ").map((p) => p[0]).join("").toUpperCase().slice(0, 2);
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-PK", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
  const weekGrid = weekCheckIns.map((count) => Boolean(count));

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-zinc-900 text-neutral-100 font-sans selection:bg-red-500 selection:text-white">
      <Sidebar active="Dashboard" trainer={trainer} />

      <div className="lg:ml-60 flex flex-col min-h-screen pt-14 lg:pt-0">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-md border-b border-zinc-900/60 px-5 sm:px-8 py-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-red-500">Trainer Portal</p>
            <h1 className="text-lg sm:text-xl font-black uppercase tracking-tight text-white mt-0.5 leading-none">Dashboard</h1>
            <p className="text-[11px] text-zinc-600 mt-0.5 hidden sm:block">{dateStr}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <p className="text-xs font-semibold text-white">{trainer.name}</p>
              <p className="text-[10px] text-zinc-500">{trainer.specialty}</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center font-black text-sm text-white shadow-lg shadow-red-500/20">
              {initials}
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-8 py-6 space-y-5 max-w-6xl w-full mx-auto">

          {/* Welcome Banner */}
          <div className="relative rounded-2xl overflow-hidden border border-zinc-800/80 shadow-[0_0_40px_rgba(220,38,38,0.08)]">
            <div className="absolute inset-0 bg-gradient-to-r from-red-900/20 to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-zinc-950/80 to-zinc-900/60 pointer-events-none" />
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-red-600/10 blur-[80px] rounded-full pointer-events-none" />

            <div className="relative z-10 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-6">
              <div className="flex-1">
                <p className="text-sm text-zinc-400">{greeting} </p>
                <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mt-1 leading-tight">{trainer.name}</h2>
                <p className="text-sm text-zinc-500 mt-2 italic max-w-md leading-relaxed">&ldquo;{motto}&rdquo;</p>
                <div className="mt-4 flex gap-2 items-center">
                  <div className="h-0.5 w-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-full" />
                  <div className="h-0.5 w-4 bg-gradient-to-r from-red-500 to-orange-500 rounded-full opacity-60" />
                  <div className="h-0.5 w-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-full opacity-30" />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-bold border bg-red-500/10 text-red-400 border-red-500/20">
                    {trainer.specialty}
                  </span>
                  <span className="inline-flex items-center text-xs px-3 py-1 rounded-full font-bold border bg-zinc-800 text-zinc-400 border-zinc-700">
                    {trainer.timings}
                  </span>
                </div>
              </div>
     
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard label="Assigned Members"  value={totals.assignedMembers} sub="Under your guidance" accent="from-red-500 to-orange-500" delay={0} />
            <StatCard label="Today's Check-ins" value={totals.todayCheckIns} sub="Completed today" accent="from-emerald-500 to-teal-500" delay={80} />
            <StatCard label="Weekly Check-ins" value={totals.weeklyCheckIns} sub="7-day total" accent="from-amber-500 to-yellow-500" delay={160} />
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800/80 p-5">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-black text-white uppercase tracking-tight text-sm">Weekly Attendance</h3>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">7 Days</span>
              </div>
              <p className="text-xs text-zinc-500 mb-5">Days with at least one member check-in</p>
              <WeekGrid data={weekGrid} />
            </div>

            <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800/80 p-5">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-black text-white uppercase tracking-tight text-sm">Training Load</h3>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">Roster</span>
              </div>
              <p className="text-xs text-zinc-500 mb-4">Member assignment vs capacity</p>
              <ProgressBar label="Roster fill" value={totals.assignedMembers} max={20} color="from-red-500 to-orange-500" />
              <ProgressBar label="Today's activity" value={totals.todayCheckIns} max={Math.max(10, totals.assignedMembers)} color="from-emerald-500 to-teal-500" />
            </div>
          </div>

          {/* Assigned Members Table */}
          <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800/80 overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-800/80 flex items-center justify-between">
              <div>
                <h3 className="font-black text-white uppercase tracking-tight text-sm">Assigned Members</h3>
                <p className="text-xs text-zinc-500 mt-0.5">Members who have selected you as their trainer</p>
              </div>
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                {totals.assignedMembers} total
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800/80 text-zinc-500 text-xs uppercase tracking-wider">
                    <th className="text-left px-5 py-3">Member</th>
                    <th className="text-left px-5 py-3 hidden sm:table-cell">Email</th>
                    <th className="text-left px-5 py-3 hidden md:table-cell">Plan</th>
                    <th className="text-left px-5 py-3 hidden lg:table-cell">Joined</th>
                    <th className="text-left px-5 py-3">Status</th>
                    <th className="text-left px-5 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {assignedMembers.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-12 text-zinc-500 text-sm">
                        <span className="block text-3xl mb-2">👥</span>
                        No members assigned yet
                      </td>
                    </tr>
                  ) : (
                    assignedMembers.map((member) => (
                      <tr key={member._id} className="border-b border-zinc-800/40 hover:bg-zinc-800/30 transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center text-xs font-black text-red-400 shrink-0">
                              {member.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                            </div>
                            <span className="font-semibold text-white">{member.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-zinc-400 hidden sm:table-cell">{member.email}</td>
                        <td className="px-5 py-3 text-zinc-400 hidden md:table-cell">{member.plan?.name || "No Plan"}</td>
                        <td className="px-5 py-3 text-zinc-400 hidden lg:table-cell">
                          {member.createdAt ? new Date(member.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                        </td>
                        <td className="px-5 py-3">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${
                            member.membershipStatus === "active"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                              : "bg-zinc-800 text-zinc-400 border-zinc-700"
                          }`}>
                            {member.membershipStatus === "active" ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <button
                            onClick={() => setSelectedMember(member)}
                            className="text-xs px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-600/15 to-orange-500/10 text-red-400 border border-red-500/20 hover:from-red-600/25 hover:to-orange-500/15 transition cursor-pointer font-bold"
                          >
                            Manage
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </main>

        <footer className="border-t border-zinc-900 px-6 py-5 text-center text-xs text-zinc-600 mt-auto">
          © {new Date().getFullYear()} Fitcore — Trainer Portal
        </footer>
      </div>

      {selectedMember && <MemberDetailModal member={selectedMember} onClose={() => setSelectedMember(null)} />}
    </div>
  );
}
