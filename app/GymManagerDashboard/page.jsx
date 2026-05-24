"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./Sidebar";

// ── Mini sparkline SVG ──────────────────────────────────────────────
function Sparkline({ data, color = "#ef4444" }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const w = 80, h = 32;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1 || 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * h;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      <polyline points={pts} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={`0,${h} ${pts} ${w},${h}`} stroke="none" fill={color} fillOpacity="0.12" />
    </svg>
  );
}

// ── Animated number ─────────────────────────────────────────────────
function AnimatedNum({ target, prefix = "", suffix = "" }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (target === 0) {
      setVal(0);
      return;
    }
    let start = 0;
    const step = Math.ceil(target / 40);
    const t = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(t); }
      else setVal(start);
    }, 30);
    return () => clearInterval(t);
  }, [target]);
  return <span>{prefix}{val.toLocaleString()}{suffix}</span>;
}

// ── Progress Bar ────────────────────────────────────────────────────
function ProgressBar({ label, value, max, color = "from-red-500 to-orange-500" }) {
  const pct = Math.round((value / (max || 1)) * 100);
  return (
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-zinc-300">{label}</span>
        <span className="text-zinc-400">{value} / {max} <span className="text-zinc-500">({pct}%)</span></span>
      </div>
      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-1000`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ── Bar Chart ───────────────────────────────────────────────────────
function BarChart({ data, labels, color = "#ef4444" }) {
  const max = Math.max(...data);
  return (
    <div className="flex items-end gap-2 h-36 mt-2">
      {data.map((v, i) => (
        <div key={i} className="flex flex-col items-center flex-1 gap-1">
          <span className="text-xs text-zinc-500">{v}k</span>
          <div className="w-full rounded-t-md transition-all duration-700"
            style={{ height: `${(v / (max || 1)) * 110}px`, background: `linear-gradient(to top, ${color}99, ${color})` }} />
          <span className="text-xs text-zinc-500 truncate w-full text-center">{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}

// ── Donut Chart ─────────────────────────────────────────────────────
function DonutChart({ segments }) {
  const total = segments.reduce((a, s) => a + s.value, 0);
  let cumulative = 0;
  const r = 40, cx = 50, cy = 50, stroke = 14;
  const circ = 2 * Math.PI * r;
  return (
    <div className="flex items-center gap-6">
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#27272a" strokeWidth={stroke} />
        {segments.map((seg, i) => {
          const dash = (seg.value / (total || 1)) * circ;
          const offset = circ - cumulative;
          cumulative += dash;
          return (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none"
              stroke={seg.color} strokeWidth={stroke}
              strokeDasharray={`${dash} ${circ}`}
              strokeDashoffset={offset}
              transform="rotate(-90 50 50)"
              style={{ transition: "stroke-dasharray 1s ease" }}
            />
          );
        })}
        <text x="50" y="55" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold">{total}</text>
      </svg>
      <div className="flex flex-col gap-2">
        {segments.map((s, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span className="w-3 h-3 rounded-full inline-block" style={{ background: s.color }} />
            <span className="text-zinc-300">{s.label}</span>
            <span className="text-zinc-500 ml-1">{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── KPI Card ────────────────────────────────────────────────────────
function KpiCard({ icon, label, value, prefix = "", suffix = "", trend, sparkData, accent = "from-red-500 to-orange-500", delay = 0 }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), delay); return () => clearTimeout(t); }, [delay]);
  const up = trend >= 0;
  return (
    <div className={`relative rounded-2xl p-5 bg-zinc-900/80 border border-zinc-800 hover:border-zinc-600 shadow-xl transition-all duration-700 overflow-hidden group
      ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
      style={{ transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms, border-color 0.3s` }}>
      {/* glow */}
      <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br ${accent} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity duration-500`} />
      <div className="flex justify-between items-start">
        <div>
          <p className="text-zinc-400 text-xs font-medium uppercase tracking-widest mb-1">{label}</p>
          <h2 className="text-3xl font-black text-white">
            {visible ? <AnimatedNum target={value} prefix={prefix} suffix={suffix} /> : "0"}
          </h2>
          <div className={`flex items-center gap-1 mt-1 text-xs font-semibold ${up ? "text-emerald-400" : "text-red-400"}`}>
            <span>{up ? "▲" : "▼"}</span>
            <span>{Math.abs(trend)}% vs last month</span>
          </div>
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br ${accent} text-white text-lg shadow-lg`}>
          {icon}
        </div>
      </div>
      {sparkData && <div className="mt-3"><Sparkline data={sparkData} /></div>}
    </div>
  );
}

// ── MAIN DASHBOARD ──────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();

  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMemberships: 0,
    todayCheckIns: 0,
    trainersCount: 0,
    newRegistrations: 0,
    monthlyRevenue: 0,
  });
  const [recentMembers, setRecentMembers] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [checkInData, setCheckInData] = useState([]);
  const [checkInLabels, setCheckInLabels] = useState([]);
  const [membershipSegments, setMembershipSegments] = useState([
    { label: "Basic", value: 0, color: "#6366f1" },
    { label: "Pro", value: 0, color: "#ef4444" },
    { label: "Inactive", value: 0, color: "#3f3f46" },
  ]);

  const fetchDashboardData = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const resCheckIn = await fetch("/api/manager/checkin", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const dataCheckIn = await resCheckIn.json();
      const todayCheckInsCount = resCheckIn.ok ? (dataCheckIn.checkIns || []).length : 0;

      const resMembers = await fetch("/api/manager/members", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const dataMembers = await resMembers.json();
      const membersList = resMembers.ok ? (dataMembers.members || []) : [];

      const resTrainers = await fetch("/api/manager/trainers", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const dataTrainers = await resTrainers.json();
      const trainersList = resTrainers.ok ? (dataTrainers.trainers || []) : [];

      const totalMembers = membersList.length;
      const activeMemberships = membersList.filter(m => m.membershipStatus === "active").length;
      const inactiveMemberships = totalMembers - activeMemberships;
      const trainersCount = trainersList.length;

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const newRegistrations = membersList.filter(m => new Date(m.createdAt) >= thirtyDaysAgo).length;

      const monthlyRevenue = membersList
        .filter(m => m.membershipStatus === "active" && m.plan)
        .reduce((sum, m) => sum + (m.plan.price || 0), 0);

      setStats({
        totalMembers,
        activeMemberships,
        todayCheckIns: todayCheckInsCount,
        trainersCount,
        newRegistrations,
        monthlyRevenue,
      });

      setRecentMembers(membersList.slice(0, 5).map(m => ({
        name: m.name || "Unknown",
        plan: m.plan ? m.plan.name : "None",
        date: m.createdAt ? new Date(m.createdAt).toLocaleDateString("en-PK", { month: "short", day: "numeric", year: "numeric" }) : "—",
        status: m.membershipStatus || "active"
      })));

      const planGroups = {};
      membersList.forEach(m => {
        if (m.membershipStatus === "inactive") return;
        const planName = m.plan ? m.plan.name : "No Plan";
        planGroups[planName] = (planGroups[planName] || 0) + 1;
      });

      const segments = Object.keys(planGroups).map((name, idx) => ({
        label: name,
        value: planGroups[name],
        color: ["#6366f1", "#ef4444", "#10b981", "#f59e0b", "#ec4899"][idx % 5]
      }));
      if (inactiveMemberships > 0) {
        segments.push({
          label: "Inactive",
          value: inactiveMemberships,
          color: "#3f3f46"
        });
      }
      setMembershipSegments(segments.length > 0 ? segments : [
        { label: "Basic", value: 0, color: "#6366f1" },
        { label: "Pro", value: 0, color: "#ef4444" },
        { label: "Inactive", value: 0, color: "#3f3f46" },
      ]);

      const trainerMembersCount = {};
      membersList.forEach(m => {
        if (m.assignedTrainer) {
          const tId = typeof m.assignedTrainer === "object" ? m.assignedTrainer._id : m.assignedTrainer;
          trainerMembersCount[tId] = (trainerMembersCount[tId] || 0) + 1;
        }
      });

      setTrainers(trainersList.map(t => ({
        name: t.name,
        specialty: t.specialty,
        members: trainerMembersCount[t._id] || 0,
        capacity: 15
      })));

      const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      const currentDayIndex = new Date().getDay();
      const checkInCounts = [12, 19, 15, 22, todayCheckInsCount, 0, 0];
      const dayIndexMapped = currentDayIndex === 0 ? 6 : currentDayIndex - 1;
      checkInCounts[dayIndexMapped] = todayCheckInsCount;

      setCheckInData(checkInCounts);
      setCheckInLabels(daysOfWeek);

    } catch (err) {
      console.error("Error fetching dashboard statistics:", err);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/Login");
      return;
    }

    fetchDashboardData();

    // Listen for custom checkin-updated events from Sidebar
    window.addEventListener("checkin-updated", fetchDashboardData);
    return () => {
      window.removeEventListener("checkin-updated", fetchDashboardData);
    };
  }, [router]);

  const kpis = [
    { icon: "👥", label: "Total Members", value: stats.totalMembers, trend: 12, sparkData: [40, 45, 55, 60, 68, 72, stats.totalMembers], accent: "from-blue-500 to-indigo-600" },
    { icon: "✅", label: "Active Memberships", value: stats.activeMemberships, trend: 8, sparkData: [35, 42, 48, 52, 58, 62, stats.activeMemberships], accent: "from-emerald-500 to-teal-600" },
    { icon: "🚪", label: "Today's Check-ins", value: stats.todayCheckIns, trend: 24, sparkData: [15, 18, 12, 25, 20, 28, stats.todayCheckIns], accent: "from-violet-500 to-purple-600" },
    { icon: "💰", label: "Monthly Revenue", value: stats.monthlyRevenue, prefix: "Rs ", trend: 15, sparkData: [120, 140, 165, 180, 210, 240, stats.monthlyRevenue / 1000], accent: "from-red-500 to-orange-500" },
    { icon: "🏋️", label: "Trainers Count", value: stats.trainersCount, trend: 5, sparkData: [3, 4, 4, 5, 5, 6, stats.trainersCount], accent: "from-amber-500 to-yellow-500" },
    { icon: "🆕", label: "New Registrations", value: stats.newRegistrations, trend: 18, sparkData: [5, 8, 12, 10, 15, 18, stats.newRegistrations], accent: "from-pink-500 to-rose-600" },
  ];

  const revenueData = [120, 150, 180, 220, 260, 310, stats.monthlyRevenue / 1000];
  const revenueLabels = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May"];

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-PK", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans">
      <Sidebar active="Dashboard" />

      {/* Main content */}
      <div className="lg:ml-60 flex flex-col min-h-screen">

        {/* Topbar */}
        <header className="sticky top-0 z-20 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/60 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Gym Manager Dashboard</h1>
            <p className="text-xs text-zinc-500">{dateStr}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <button className="w-9 h-9 rounded-xl bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-300 transition-colors">🔔</button>
            </div>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center font-bold text-sm">GM</div>
          </div>
        </header>

        <main className="flex-1 px-6 py-6 space-y-8">

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {kpis.map((k, i) => (
              <KpiCard key={k.label} {...k} delay={i * 80} />
            ))}
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">

            {/* Revenue bar chart */}
            <div className="xl:col-span-2 rounded-2xl bg-zinc-900/80 border border-zinc-800 p-5">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-white">Monthly Revenue</h3>
                <span className="text-xs text-zinc-500 bg-zinc-800 px-3 py-1 rounded-full">Last 7 months</span>
              </div>
              <p className="text-xs text-zinc-500 mb-2">Revenue in thousands (Rs)</p>
              <BarChart data={revenueData} labels={revenueLabels} color="#ef4444" />
            </div>

            {/* Membership donut */}
            <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-5">
              <h3 className="font-bold text-white mb-1">Membership Split</h3>
              <p className="text-xs text-zinc-500 mb-4">Total across all plans</p>
              <DonutChart segments={membershipSegments} />
            </div>
          </div>

          {/* Check-in chart + Trainer Capacity */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

            {/* Check-in bar chart */}
            <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-5">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-white">Weekly Check-ins</h3>
                <span className="text-xs text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full border border-emerald-400/20">This Week</span>
              </div>
              <p className="text-xs text-zinc-500 mb-2">Daily attendance count</p>
              <BarChart data={checkInData} labels={checkInLabels} color="#8b5cf6" />
            </div>

            {/* Trainer capacity progress bars */}
            <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-5">
              <h3 className="font-bold text-white mb-1">Trainer Capacity</h3>
              <p className="text-xs text-zinc-500 mb-4">Members assigned vs max capacity</p>
              {trainers.length === 0 ? (
                <div className="flex items-center justify-center py-8 text-zinc-500 text-sm">
                  No trainers registered
                </div>
              ) : (
                trainers.map((t, i) => (
                  <ProgressBar key={i} label={`${t.name} · ${t.specialty}`} value={t.members} max={t.capacity}
                    color={["from-red-500 to-orange-500","from-violet-500 to-purple-500","from-blue-500 to-indigo-500","from-emerald-500 to-teal-500"][i % 4]} />
                ))
              )}
            </div>
          </div>

          {/* Membership Goals Progress */}
          <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-5">
            <h3 className="font-bold text-white mb-1">Monthly Goals Progress</h3>
            <p className="text-xs text-zinc-500 mb-5">Track KPI targets for May 2026</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10">
              <ProgressBar label="New Registrations" value={stats.newRegistrations} max={100} color="from-pink-500 to-rose-500" />
              <ProgressBar label="Active Memberships" value={stats.activeMemberships} max={1200} color="from-emerald-500 to-teal-500" />
              <ProgressBar label="Revenue Target (Rs k)" value={Math.round(stats.monthlyRevenue / 1000)} max={350} color="from-red-500 to-orange-500" />
              <ProgressBar label="Check-in Rate (%)" value={stats.activeMemberships > 0 ? Math.round((stats.todayCheckIns / stats.activeMemberships) * 100) : 0} max={100} color="from-violet-500 to-purple-500" />
            </div>
          </div>

          {/* Recent Registrations Table */}
          <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white">Recent Registrations</h3>
                <p className="text-xs text-zinc-500">Latest new members</p>
              </div>
              <button className="text-xs text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 px-3 py-1.5 rounded-lg transition-colors">
                View All →
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-500 text-xs uppercase tracking-wider">
                    <th className="text-left px-5 py-3">Member</th>
                    <th className="text-left px-5 py-3">Plan</th>
                    <th className="text-left px-5 py-3">Joined</th>
                    <th className="text-left px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentMembers.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="text-center py-8 text-zinc-500 text-sm">
                        No recent registrations found
                      </td>
                    </tr>
                  ) : (
                    recentMembers.map((m, i) => (
                      <tr key={i} className="border-b border-zinc-800/50 hover:bg-zinc-800/40 transition-colors">
                        <td className="px-5 py-3 font-medium text-white flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-xs font-bold flex-shrink-0">
                            {m.name.split(" ").map(n => n[0]).join("")}
                          </div>
                          {m.name}
                        </td>
                        <td className="px-5 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border
                            ${m.plan === "Pro" ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-blue-500/10 text-blue-400 border-blue-500/20"}`}>
                            {m.plan}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-zinc-400">{m.date}</td>
                        <td className="px-5 py-3">
                          <span className={`flex items-center gap-1.5 text-xs font-semibold
                            ${m.status === "active" ? "text-emerald-400" : "text-zinc-500"}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${m.status === "active" ? "bg-emerald-400" : "bg-zinc-600"}`} />
                            {m.status === "active" ? "Active" : "Inactive"}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </main>

        <footer className="border-t border-zinc-800/60 px-6 py-4 text-center text-xs text-zinc-600">
          © {new Date().getFullYear()} Fitcore — Gym Manager Portal
        </footer>
      </div>
    </div>
  );
}