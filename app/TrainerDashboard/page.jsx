"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import KpiCard from "../../components/KpiCard";
import ProgressBar from "../../components/ProgressBar";
import WeekGrid from "../../components/WeekGrid";
import MemberDetailModal from "./MemberDetailModal";
import { apiCall } from "../../utils/api";

const MOTTO = [
  "Consistency is your strongest rep.",
  "Small progress compounds into real strength.",
  "Your schedule is your advantage.",
  "Coach the habit, not just the workout.",
];

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
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex flex-col justify-center items-center">
        <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-gray-500 dark:text-zinc-400">Loading workspace...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex flex-col justify-center items-center p-6 text-center">
        <div className="p-4 bg-violet-50 dark:bg-violet-500/10 border border-violet-200 dark:border-violet-500/20 text-violet-700 dark:text-violet-300 rounded-2xl text-sm max-w-md mb-4">{error}</div>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-white rounded-xl text-sm transition cursor-pointer shadow-sm">
          Try Again
        </button>
      </div>
    );
  }

  const { trainer, assignedMembers, todayCheckIns, weekCheckIns, totals } = data;
  const initials = trainer.name.split(" ").map((p) => p[0]).join("").toUpperCase().slice(0, 2);
  const now = new Date();
  const dateStr = now.toLocaleDateString("en-PK", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  const timeStr = now.toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" });
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const weekGrid = weekCheckIns.map((count) => Boolean(count));

  const kpis = [
    { icon: "👥", label: "Assigned Members", value: totals.assignedMembers, sub: "Under your guidance",  accent: "from-violet-500 to-indigo-600" },
    { icon: "✅", label: "Today's Check-ins", value: totals.todayCheckIns,   sub: "Completed today",      accent: "from-emerald-500 to-teal-600" },
    { icon: "📈", label: "Weekly Check-ins",  value: totals.weeklyCheckIns,  sub: "7-day total",          accent: "from-amber-500 to-orange-500" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-white font-sans">
      <Sidebar active="Dashboard" trainer={trainer} />

      <div className="lg:ml-64 flex flex-col min-h-screen pt-14 lg:pt-0">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-gray-200 dark:border-zinc-800/60 px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-violet-600 dark:text-violet-400 font-bold">Trainer Portal</p>
            <h1 className="text-lg sm:text-xl font-bold mt-0.5 text-gray-900 dark:text-white">Dashboard</h1>
            <p className="text-xs text-gray-500 dark:text-zinc-500 hidden sm:block">{dateStr}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:block text-right">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{trainer.name}</p>
              <p className="text-xs text-gray-500 dark:text-zinc-500">{trainer.specialty}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center font-bold text-sm text-white shadow">
              {initials}
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 py-5 space-y-5 max-w-6xl w-full mx-auto">

          {/* Welcome Banner */}
          <div className="relative rounded-2xl overflow-hidden bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-sm p-5 sm:p-6">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-violet-500/10 to-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 grid gap-5 md:grid-cols-[1fr_auto] items-start">
              <div>
                <p className="text-sm text-gray-500 dark:text-zinc-400">{greeting}, {trainer.name.split(" ")[0]}</p>
                <h2 className="mt-1.5 text-xl sm:text-2xl font-black text-gray-900 dark:text-white">Run your sessions with clarity.</h2>
                <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400 max-w-xl italic">&ldquo;{motto}&rdquo;</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-500/20">
                    {trainer.specialty}
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 border border-gray-200 dark:border-zinc-700">
                    {trainer.timings}
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 border border-gray-200 dark:border-zinc-700">
                    Updated {timeStr}
                  </span>
                </div>
              </div>
              <div className="rounded-xl border border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800/50 p-4 min-w-[160px]">
                <p className="text-xs text-gray-500 dark:text-zinc-500 uppercase tracking-wider font-semibold mb-2">Today</p>
                <p className="text-2xl font-black text-gray-900 dark:text-white">{todayCheckIns.length}</p>
                <p className="text-xs text-gray-500 dark:text-zinc-400 mt-1">check-in{todayCheckIns.length !== 1 ? "s" : ""} completed</p>
              </div>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {kpis.map((item, i) => <KpiCard key={item.label} {...item} delay={i * 80} />)}
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-gray-900 dark:text-white">Weekly Attendance</h3>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-500/20">7 Days</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-zinc-500 mb-5">Days with at least one check-in</p>
              <WeekGrid data={weekGrid} />
            </div>

            <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-gray-900 dark:text-white">Training Load</h3>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 border border-gray-200 dark:border-zinc-700">Roster</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-zinc-500 mb-4">Member assignment vs capacity</p>
              <ProgressBar label="Roster fill" value={totals.assignedMembers} max={20} color="from-violet-500 to-indigo-500" />
              <ProgressBar label="Today's activity" value={totals.todayCheckIns} max={Math.max(10, totals.assignedMembers)} color="from-emerald-500 to-teal-500" />
            </div>
          </div>

          {/* Assigned Members Table */}
          <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 overflow-hidden shadow-sm">
            <div className="px-5 py-4 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">Assigned Members</h3>
                <p className="text-xs text-gray-500 dark:text-zinc-500">Members who have selected you as their trainer</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-500/20">
                {totals.assignedMembers} total
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-zinc-500 text-xs uppercase tracking-wider">
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
                      <td colSpan="6" className="text-center py-10 text-gray-400 dark:text-zinc-500 text-sm">
                        <span className="block text-3xl mb-2">👥</span>
                        No members assigned yet
                      </td>
                    </tr>
                  ) : (
                    assignedMembers.map((member) => (
                      <tr key={member._id} className="border-b border-gray-100 dark:border-zinc-800/50 hover:bg-gray-50 dark:hover:bg-zinc-800/40 transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500/20 to-indigo-500/20 dark:from-violet-500/30 dark:to-indigo-500/20 flex items-center justify-center text-xs font-bold text-violet-700 dark:text-violet-300 shrink-0">
                              {member.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
                            </div>
                            <span className="font-medium text-gray-900 dark:text-white">{member.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-gray-500 dark:text-zinc-400 hidden sm:table-cell">{member.email}</td>
                        <td className="px-5 py-3 text-gray-500 dark:text-zinc-400 hidden md:table-cell">{member.plan?.name || "No Plan"}</td>
                        <td className="px-5 py-3 text-gray-500 dark:text-zinc-400 hidden lg:table-cell">
                          {member.createdAt ? new Date(member.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                        </td>
                        <td className="px-5 py-3">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                            member.membershipStatus === "active"
                              ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20"
                              : "bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-zinc-400 border-gray-200 dark:border-zinc-700"
                          }`}>
                            {member.membershipStatus === "active" ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <button
                            onClick={() => setSelectedMember(member)}
                            className="text-xs px-3 py-1.5 rounded-lg bg-violet-50 dark:bg-violet-600/20 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-500/20 hover:bg-violet-100 dark:hover:bg-violet-600/30 transition cursor-pointer font-medium"
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

        <footer className="border-t border-gray-200 dark:border-zinc-800/60 px-6 py-4 text-center text-xs text-gray-400 dark:text-zinc-600">
          © {new Date().getFullYear()} Fitcore — Trainer Portal
        </footer>
      </div>

      {selectedMember && <MemberDetailModal member={selectedMember} onClose={() => setSelectedMember(null)} />}
    </div>
  );
}
