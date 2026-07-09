"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import KpiCard from "../../components/KpiCard";
import ProgressBar from "../../components/ProgressBar";
import WeekGrid from "../../components/WeekGrid";
import { apiCall } from "../../utils/api";

const QUOTES = [
  "The only bad workout is the one that didn't happen.",
  "Your body can stand almost anything. It's your mind you have to convince.",
  "Strength does not come from the body. It comes from the will.",
  "Push harder than yesterday if you want a different tomorrow.",
  "Success starts with self-discipline.",
];

export default function MemberDashboard() {
  const router = useRouter();
  const [quote] = useState(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/Login"); return; }
    (async () => {
      const { data: result, ok, status } = await apiCall("/api/member/dashboard");
      if (ok && result.success) {
        setData(result);
      } else {
        setError(result.message || "Failed to load dashboard data.");
        if (status === 401) { localStorage.removeItem("token"); router.push("/Login"); }
      }
      setLoading(false);
    })();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex flex-col justify-center items-center">
        <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-gray-500 dark:text-zinc-400">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex flex-col justify-center items-center p-6 text-center">
        <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 rounded-2xl text-sm max-w-md mb-4">⚠️ {error}</div>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 text-gray-700 dark:text-white rounded-xl text-sm transition cursor-pointer shadow-sm">
          Try Again
        </button>
      </div>
    );
  }

  const { member, totalCheckIns, weekAttendance } = data;
  const initials = member.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  const isSubscribed = !!member.plan && member.membershipStatus === "active" && (!member.membershipExpiresAt || new Date(member.membershipExpiresAt) >= new Date());
  const planBadge = member.plan?.allowsTrainer ? "👑 Premium" : "💳 Subscribed";
  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
  const dateStr = now.toLocaleDateString("en-PK", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  const kpis = [
    {
      icon: "💳", label: "Membership",
      value: 0, sub: member.plan ? `Active — ${member.plan.name}` : "No Active Plan",
      accent: member.membershipStatus === "active" ? "from-emerald-500 to-teal-600" : "from-gray-400 to-gray-500",
    },
    {
      icon: "⏳", label: "Days Remaining",
      value: member.daysRemaining,
      sub: member.membershipExpiresAt
        ? `Expires ${new Date(member.membershipExpiresAt).toLocaleDateString("en-PK", { month: "short", day: "numeric", year: "numeric" })}`
        : "No expiry set",
      accent: member.daysRemaining > 7 ? "from-amber-500 to-yellow-500" : "from-red-500 to-orange-500",
    },
    {
      icon: "📅", label: "Total Check-ins",
      value: totalCheckIns, sub: "All-time attendance sessions",
      accent: "from-pink-500 to-rose-600",
    },
  ];

  const weekCount = weekAttendance.filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-zinc-900 text-neutral-100 font-sans selection:bg-red-500 selection:text-white">
      <Sidebar active="Dashboard" member={member} />

      <div className="lg:ml-60 flex flex-col min-h-screen pt-14 lg:pt-0">
        {/* Header */}
        <header className="sticky top-0 lg:top-0 z-20 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-900 px-4 sm:px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.25em] text-red-500 font-bold">Member Portal</p>
            <h1 className="text-lg sm:text-xl font-bold mt-0.5 text-white">Dashboard</h1>
            <p className="text-xs text-zinc-500 hidden sm:block">{dateStr}</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center font-bold text-sm text-white shadow-lg shadow-red-500/20">
            {initials}
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-6 py-5 space-y-5 max-w-6xl w-full mx-auto">

          {/* Welcome Banner */}
          <div className="relative rounded-2xl overflow-hidden bg-zinc-900/60 border border-zinc-800/80 p-5 sm:p-6">
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <p className="text-sm text-zinc-400">{greeting} 👋</p>
                <h2 className="text-xl sm:text-2xl font-black mt-1 text-white">{member.name}</h2>
                <p className="text-zinc-500 text-sm mt-1.5 italic max-w-lg">&ldquo;{quote}&rdquo;</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                    isSubscribed
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : member.plan
                        ? "bg-red-500/10 text-red-400 border-red-500/20"
                        : "bg-zinc-800 text-zinc-400 border-zinc-700"
                  }`}>
                    {member.plan ? `${member.plan.name} — ${planBadge}` : "No Plan"}
                  </span>
                  {member.trainer && (
                    <span className="text-xs bg-red-500/10 text-red-400 px-2.5 py-1 rounded-full border border-red-500/20 font-semibold">
                      🏋️ {member.trainer.name}
                    </span>
                  )}
                </div>
              </div>
              {/* Quick stat */}
              <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-1 shrink-0">
                <div className="text-center sm:text-right">
                  <p className="text-3xl font-black text-white">{weekCount}</p>
                  <p className="text-xs text-zinc-500">days this week</p>
                </div>
                <div className="text-center sm:text-right">
                  <p className="text-3xl font-black text-white">{totalCheckIns}</p>
                  <p className="text-xs text-zinc-500">total check-ins</p>
                </div>
              </div>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {kpis.map((k, i) => <KpiCard key={k.label} {...k} delay={i * 80} />)}
          </div>

          {/* Weekly Attendance + Plan */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800/80 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-white">This Week</h3>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                  {weekCount} / 7 days
                </span>
              </div>
              <p className="text-xs text-zinc-500 mb-5">
                {weekCount === 0 ? "No check-ins yet this week. Let's go! 🏋️"
                  : weekCount < 3 ? `${weekCount} days — Keep building the habit! 💪`
                  : `${weekCount} days — Great consistency! 🔥`}
              </p>
              <WeekGrid data={weekAttendance} />
            </div>

            <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800/80 p-5 shadow-sm flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-white">My Plan</h3>
                <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${
                  member.plan
                    ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                    : "text-zinc-400 bg-zinc-800 border-zinc-700"
                }`}>
                  {member.plan ? "Active" : "No plan"}
                </span>
              </div>
              <p className="text-xs text-zinc-500 mb-4 flex-1">
                {member.plan
                  ? "Your subscription is active. Manage or compare other plans anytime."
                  : "Browse admin-created plans and subscribe to unlock your membership."}
              </p>
              <button
                onClick={() => router.push("/MemberDashboard/Plans")}
                className="w-full py-3 rounded-xl text-sm font-bold border transition cursor-pointer bg-gradient-to-r from-red-600/15 to-orange-500/10 text-red-400 border-red-500/20 hover:from-red-600/25 hover:to-orange-500/15"
              >
                {member.plan ? "Manage Subscription" : "View Plans"}
              </button>
            </div>
          </div>

          {/* Active Plan Detail */}
          {member.plan ? (
            <div className="relative rounded-2xl overflow-hidden bg-zinc-900/60 border border-zinc-800/80 shadow-sm">
              <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 via-orange-500/5 to-transparent pointer-events-none" />
              <div className="p-5 relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-500/15 text-red-400 border border-red-500/20">
                    {member.membershipStatus === "active" ? "✓ Active Plan" : "Expired Plan"}
                  </span>
                  <h3 className="text-xl font-black mt-2 text-white">{member.plan.name}</h3>
                  {member.plan.features?.length > 0 && (
                    <p className="text-sm text-zinc-400 mt-1">{member.plan.features.join(" • ")}</p>
                  )}
                  <div className="flex flex-wrap gap-4 mt-3 text-xs text-zinc-500">
                    <span>Started: <span className="text-zinc-300">{new Date(member.createdAt).toLocaleDateString("en-PK", { month: "short", day: "numeric", year: "numeric" })}</span></span>
                    {member.membershipExpiresAt && (
                      <span>Expires: <span className="text-zinc-300">{new Date(member.membershipExpiresAt).toLocaleDateString("en-PK", { month: "short", day: "numeric", year: "numeric" })}</span></span>
                    )}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
                    Rs {member.plan.price.toLocaleString()}
                  </p>
                  <p className="text-xs text-zinc-550">/ {member.plan.duration}</p>
                </div>
              </div>
              {member.membershipExpiresAt && (() => {
                const pct = Math.min(100, Math.max(0, Math.round(
                  (Date.now() - new Date(member.createdAt)) /
                  (new Date(member.membershipExpiresAt) - new Date(member.createdAt)) * 100
                )));
                return <div className="px-5 pb-4"><ProgressBar label="Plan Duration Elapsed" value={pct} max={100} unit="%" /></div>;
              })()}
            </div>
          ) : (
            <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800/80 p-8 text-center shadow-sm">
              <span className="text-4xl block mb-3">💳</span>
              <h3 className="text-lg font-bold text-white">No Active Plan</h3>
              <p className="text-sm text-zinc-400 mt-1 max-w-sm mx-auto">Contact the gym to select a plan and start your journey.</p>
            </div>
          )}

        </main>

        <footer className="border-t border-zinc-900 px-6 py-4 text-center text-xs text-zinc-600 mt-auto">
          © {new Date().getFullYear()} Fitcore — Member Portal
        </footer>
      </div>
    </div>
  );
}
