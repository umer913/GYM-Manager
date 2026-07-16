"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import ProgressBar from "../../../components/ProgressBar";
import WeekGrid from "../../../components/WeekGrid";
import { apiCall } from "../../../utils/api";

const QUOTES = [
  "The only bad workout is the one that didn't happen.",
  "Your body can stand almost anything. It's your mind you have to convince.",
  "Strength does not come from the body. It comes from the will.",
  "Push harder than yesterday if you want a different tomorrow.",
  "Success starts with self-discipline.",
];

// Stylish text-only stat card
function StatCard({ label, value, sub, accent = "from-red-500 to-orange-500", bigLabel, delay = 0 }) {
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
      {/* large faded background word */}
      <span className="absolute -bottom-3 -right-2 text-7xl font-black uppercase tracking-tighter text-white/[0.04] select-none pointer-events-none leading-none">
        {bigLabel}
      </span>

      {/* top accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${accent}`} />

      {/* glow blob */}
      <div className={`absolute -top-8 -right-8 w-28 h-28 rounded-full bg-gradient-to-br ${accent} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity duration-500`} />

      <div className="relative z-10">
        {/* label */}
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500 mb-3">{label}</p>

        {/* main value — large gradient text */}
        <p className={`text-4xl font-black leading-none text-transparent bg-clip-text bg-gradient-to-r ${accent}`}>
          {value}
        </p>

        {/* sub text */}
        {sub && (
          <p className="text-xs text-zinc-500 mt-2 leading-snug">{sub}</p>
        )}
      </div>
    </div>
  );
}

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

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-zinc-900 flex flex-col justify-center items-center gap-4">
        <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-zinc-500 tracking-widest uppercase">Loading dashboard…</p>
      </div>
    );
  }

  /* ── Error ── */
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-zinc-900 flex flex-col justify-center items-center p-6 text-center gap-4">
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-sm max-w-md">
          ⚠️ {error}
        </div>
        <button
          onClick={() => window.location.reload()}
          className="px-5 py-2.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 rounded-xl text-sm transition cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  const { member, totalCheckIns, weekAttendance } = data;
  const initials = member.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  const isSubscribed =
    !!member.plan &&
    member.membershipStatus === "active" &&
    (!member.membershipExpiresAt || new Date(member.membershipExpiresAt) >= new Date());

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
  const dateStr = now.toLocaleDateString("en-PK", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  const weekCount = weekAttendance.filter(Boolean).length;

  const planProgress = (() => {
    if (!member.membershipExpiresAt || !member.createdAt) return null;
    const start = new Date(member.createdAt).getTime();
    const end   = new Date(member.membershipExpiresAt).getTime();
    return Math.min(100, Math.max(0, Math.round((Date.now() - start) / (end - start) * 100)));
  })();

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-zinc-900 text-neutral-100 font-sans selection:bg-red-500 selection:text-white">
      <Sidebar active="Dashboard" member={member} />

      <div className="lg:ml-60 flex flex-col min-h-screen pt-14 lg:pt-0">

        {/* ── Header ── */}
        <header className="sticky top-0 z-20 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-md border-b border-zinc-900/60 px-5 sm:px-8 py-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-red-500">Member Portal</p>
            <h1 className="text-lg sm:text-xl font-black uppercase tracking-tight text-white mt-0.5 leading-none">
              Dashboard
            </h1>
            <p className="text-[11px] text-zinc-600 mt-0.5 hidden sm:block">{dateStr}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <p className="text-xs font-semibold text-white">{member.name}</p>
              <p className="text-[10px] text-zinc-500">{member.email}</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center font-black text-sm text-white shadow-lg shadow-red-500/20">
              {initials}
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 sm:px-8 py-6 space-y-5 max-w-6xl w-full mx-auto">

          {/* ── Hero / Welcome banner ── */}
          <div className="relative rounded-2xl overflow-hidden border border-zinc-800/80 shadow-[0_0_40px_rgba(220,38,38,0.08)]">
            {/* red gradient accent — mirrors home page hero overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-red-900/20 to-transparent pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-zinc-950/80 to-zinc-900/60 pointer-events-none" />
            {/* decorative blur */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-red-600/10 blur-[80px] rounded-full pointer-events-none" />

            <div className="relative z-10 p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-6">
              <div className="flex-1">
                <p className="text-sm text-zinc-400">{greeting}</p>
                <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white mt-1 leading-tight">
                  {member.name}
                </h2>
                <p className="text-sm text-zinc-500 mt-2 italic max-w-md leading-relaxed">
                  &ldquo;{quote}&rdquo;
                </p>

                {/* decorative line — same as home "Forge Your Legacy" section */}
                <div className="mt-4 flex gap-2 items-center">
                  <div className="h-0.5 w-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-full" />
                  <div className="h-0.5 w-4 bg-gradient-to-r from-red-500 to-orange-500 rounded-full opacity-60" />
                  <div className="h-0.5 w-2 bg-gradient-to-r from-red-500 to-orange-500 rounded-full opacity-30" />
                </div>

                {/* badges */}
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {member.plan ? (
                    <span className={`inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-bold border ${
                      isSubscribed
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-red-500/10 text-red-400 border-red-500/20"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isSubscribed ? "bg-emerald-400" : "bg-red-400"}`} />
                      {member.plan.name}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-bold border bg-zinc-800 text-zinc-400 border-zinc-700">
                      No Plan
                    </span>
                  )}
                  {member.trainer && (
                    <span className="inline-flex items-center gap-1.5 text-xs bg-red-500/10 text-red-400 px-3 py-1 rounded-full border border-red-500/20 font-bold">
                        {member.trainer.name}
                    </span>
                  )}
                </div>
              </div>

  
            </div>
          </div>

          {/* ── KPI cards ── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard
              label="Membership"
          
              value={member.plan ? "Active" : "None"}
              sub={member.plan ? member.plan.name : "No active plan"}
              accent={member.membershipStatus === "active" ? "from-emerald-500 to-teal-500" : "from-zinc-500 to-zinc-600"}
              delay={0}
            />
            <StatCard
              label="Days Remaining"
            
              value={member.daysRemaining ?? "—"}
              sub={member.membershipExpiresAt
                ? `Expires ${new Date(member.membershipExpiresAt).toLocaleDateString("en-PK", { month: "short", day: "numeric", year: "numeric" })}`
                : "No expiry set"}
              accent={member.daysRemaining > 7 ? "from-amber-500 to-yellow-500" : "from-red-500 to-orange-500"}
              delay={80}
            />
            <StatCard
              label="Total Check-ins"
             
              value={totalCheckIns}
              sub="All-time attendance sessions"
              accent="from-red-500 to-orange-500"
              delay={160}
            />
          </div>

          {/* ── Weekly attendance + plan ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* weekly grid */}
            <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800/80 p-5">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-black text-white uppercase tracking-tight text-sm">This Week</h3>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">
                  {weekCount} / 7 days
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 mb-4">
                {weekCount === 0
                  ? "No check-ins yet. Let's go!  "
                  : weekCount < 3
                  ? `${weekCount} days — keep building the habit `
                  : `${weekCount} days — great consistency! 🔥`}
              </p>
              <WeekGrid data={weekAttendance} />
              {/* thin progress bar */}
              <div className="mt-4 h-1 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-700"
                  style={{ width: `${(weekCount / 7) * 100}%` }}
                />
              </div>
            </div>

            {/* plan CTA — mirrors home page plan card style */}
            <div className="relative p-[1px] rounded-2xl bg-gradient-to-br from-zinc-700 to-zinc-900 hover:-translate-y-1 transition-transform duration-300 flex flex-col h-full">
              <div className="rounded-2xl bg-zinc-950/95 p-5 flex flex-col h-full">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-black text-white uppercase tracking-tight text-sm">My Plan</h3>
                  <span className={`text-xs px-2.5 py-1 rounded-full border font-bold ${
                    member.plan
                      ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                      : "text-zinc-400 bg-zinc-800 border-zinc-700"
                  }`}>
                    {member.plan ? "Active" : "No plan"}
                  </span>
                </div>

                <p className="text-xs text-zinc-400 mb-4 flex-1 leading-relaxed">
                  {member.plan
                    ? "Your subscription is active. Manage or compare other available plans."
                    : "Browse plans created by the gym admin and subscribe to unlock your membership."}
                </p>

                {member.plan && (
                  <div className="mb-4">
                    <p className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400">
                      {member.plan.name}
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      Rs {member.plan.price?.toLocaleString()} / {member.plan.duration}
                    </p>
                  </div>
                )}

                <button
                  onClick={() => router.push("/MemberDashboard/Plans")}
                  className="w-full py-3 rounded-xl text-sm font-bold transition-all duration-300 flex justify-center items-center gap-2 cursor-pointer bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white shadow-lg shadow-red-500/20"
                >
                  {member.plan ? "Manage Subscription" : "View Plans"}
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* ── Active plan detail ── */}
          {member.plan ? (
            <div className="relative p-[1px] rounded-2xl bg-gradient-to-br from-red-500 via-red-600 to-orange-500 shadow-[0_0_30px_rgba(220,38,38,0.15)]">
              <div className="rounded-2xl bg-zinc-950/95 backdrop-blur-xl p-5 sm:p-6">

                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">
                  <div className="flex-1">
                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                      member.membershipStatus === "active"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-red-500/10 text-red-400 border-red-500/20"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${member.membershipStatus === "active" ? "bg-emerald-400 animate-pulse" : "bg-red-400"}`} />
                      {member.membershipStatus === "active" ? "Active Plan" : "Expired Plan"}
                    </span>

                    <h3 className="text-2xl font-black uppercase tracking-tight text-white mt-2">{member.plan.name}</h3>

                    {member.plan.features?.length > 0 && (
                      <p className="text-sm text-zinc-400 mt-1">{member.plan.features.join(" • ")}</p>
                    )}

                    <div className="flex flex-wrap gap-5 mt-3 text-xs text-zinc-500">
                      <span>
                        Started:{" "}
                        <span className="text-zinc-300">
                          {new Date(member.createdAt).toLocaleDateString("en-PK", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      </span>
                      {member.membershipExpiresAt && (
                        <span>
                          Expires:{" "}
                          <span className="text-zinc-300">
                            {new Date(member.membershipExpiresAt).toLocaleDateString("en-PK", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* price — same treatment as home plan cards */}
                  <div className="shrink-0 sm:text-right">
                    <p className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400">
                      Rs {member.plan.price?.toLocaleString()}
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">/ {member.plan.duration}</p>
                  </div>
                </div>

                {/* duration elapsed */}
                {planProgress !== null && (
                  <div className="mt-5">
                    <ProgressBar
                      label="Plan Duration Elapsed"
                      value={planProgress}
                      max={100}
                      unit="%"
                      color={planProgress > 80 ? "from-red-500 to-orange-500" : "from-red-500 to-orange-500"}
                    />
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* no plan empty state */
            <div className="rounded-2xl bg-zinc-900/60 border border-dashed border-zinc-700 p-10 text-center">
              <span className="text-5xl block mb-3">💳</span>
              <h3 className="text-xl font-black uppercase tracking-tight text-white">No Active Plan</h3>
              <p className="text-sm text-zinc-400 mt-2 max-w-sm mx-auto leading-relaxed">
                Contact the gym admin to get assigned a plan and start your fitness journey.
              </p>
              <button
                onClick={() => router.push("/MemberDashboard/Plans")}
                className="mt-5 inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-sm transition-all duration-300 hover:scale-105 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white shadow-lg shadow-red-500/20 cursor-pointer"
              >
                Browse Plans
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </button>
            </div>
          )}

        </main>

        <footer className="border-t border-zinc-900 px-6 py-5 text-center text-xs text-zinc-600 mt-auto">
          © {new Date().getFullYear()} Fitcore — Member Portal
        </footer>
      </div>
    </div>
  );
}
