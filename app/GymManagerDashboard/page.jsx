"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// ── Mini sparkline SVG ──────────────────────────────────────────────
function Sparkline({ data, color = "#ef4444" }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const w = 80, h = 32;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
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
  const pct = Math.round((value / max) * 100);
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
            style={{ height: `${(v / max) * 110}px`, background: `linear-gradient(to top, ${color}99, ${color})` }} />
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
          const dash = (seg.value / total) * circ;
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

// ── Sidebar ─────────────────────────────────────────────────────────
function Sidebar({ active }) {
  const links = [
    { icon: "⊞", label: "Dashboard" },
    { icon: "👥", label: "Members" },
    { icon: "🏋️", label: "Trainers" },
    { icon: "📅", label: "Check-ins" },
    { icon: "💳", label: "Memberships" },
    { icon: "💰", label: "Revenue" },
    { icon: "⚙️", label: "Settings" },
  ];
  return (
    <aside className="hidden lg:flex flex-col w-60 min-h-screen bg-zinc-950 border-r border-zinc-800/60 px-4 py-6 fixed top-0 left-0 z-30">
      <div className="flex items-center gap-2 mb-10 px-2">
        <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18M5 6v12m14-12v12" />
        </svg>
        <span className="text-xl font-black uppercase">Fit<span className="text-red-600">core</span></span>
      </div>
      <nav className="flex flex-col gap-1 flex-1">
        {links.map((l) => (
          <button key={l.label}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
              ${l.label === active
                ? "bg-gradient-to-r from-red-600/20 to-orange-600/10 text-white border border-red-500/30"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"}`}>
            <span>{l.icon}</span>{l.label}
          </button>
        ))}
      </nav>
      <div className="mt-6 p-3 rounded-xl bg-zinc-900 border border-zinc-800">
        <p className="text-xs text-zinc-500 mb-1">Logged in as</p>
        <p className="text-sm font-semibold text-white">Gym Manager</p>
        <span className="text-xs bg-red-600/20 text-red-400 px-2 py-0.5 rounded-full border border-red-500/20">Admin</span>
      </div>
    </aside>
  );
}

// ── MAIN DASHBOARD ──────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) router.push("/login");
  }, [router]);

  // Mock data
  const kpis = [
    { icon: "👥", label: "Total Members", value: 1248, trend: 8.3, sparkData: [900, 950, 980, 1020, 1080, 1150, 1248], accent: "from-blue-500 to-indigo-600" },
    { icon: "✅", label: "Active Memberships", value: 1034, trend: 5.1, sparkData: [800, 840, 870, 910, 950, 990, 1034], accent: "from-emerald-500 to-teal-600" },
    { icon: "🚪", label: "Today's Check-ins", value: 87, trend: 12.4, sparkData: [55, 70, 62, 80, 75, 90, 87], accent: "from-violet-500 to-purple-600" },
    { icon: "💰", label: "Monthly Revenue", value: 284500, prefix: "Rs ", trend: 15.2, sparkData: [190000, 210000, 225000, 240000, 258000, 270000, 284500], accent: "from-red-500 to-orange-500" },
    { icon: "🏋️", label: "Trainers Count", value: 14, trend: -2.1, sparkData: [12, 13, 14, 13, 14, 14, 14], accent: "from-amber-500 to-yellow-500" },
    { icon: "🆕", label: "New Registrations", value: 63, trend: 18.7, sparkData: [30, 38, 42, 50, 55, 60, 63], accent: "from-pink-500 to-rose-600" },
  ];

  const revenueData = [195, 212, 230, 245, 258, 270, 284];
  const revenueLabels = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May"];

  const checkInData = [42, 68, 75, 55, 90, 83, 87];
  const checkInLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const membershipSegments = [
    { label: "Basic", value: 520, color: "#6366f1" },
    { label: "Pro", value: 514, color: "#ef4444" },
    { label: "Inactive", value: 214, color: "#3f3f46" },
  ];

  const recentMembers = [
    { name: "Ali Hassan", plan: "Pro", date: "Today", status: "active" },
    { name: "Sara Khan", plan: "Basic", date: "Today", status: "active" },
    { name: "Umar Farooq", plan: "Pro", date: "Yesterday", status: "active" },
    { name: "Nida Malik", plan: "Basic", date: "18 May", status: "inactive" },
    { name: "Bilal Ahmed", plan: "Pro", date: "17 May", status: "active" },
  ];

  const trainers = [
    { name: "Coach Raza", specialty: "Strength", members: 28, capacity: 35 },
    { name: "Ms. Ayesha", specialty: "Cardio", members: 22, capacity: 30 },
    { name: "Coach Tariq", specialty: "CrossFit", members: 30, capacity: 35 },
    { name: "Mr. Kamran", specialty: "Yoga", members: 18, capacity: 25 },
  ];

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
              {trainers.map((t, i) => (
                <ProgressBar key={i} label={`${t.name} · ${t.specialty}`} value={t.members} max={t.capacity}
                  color={["from-red-500 to-orange-500","from-violet-500 to-purple-500","from-blue-500 to-indigo-500","from-emerald-500 to-teal-500"][i % 4]} />
              ))}
            </div>
          </div>

          {/* Membership Goals Progress */}
          <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-5">
            <h3 className="font-bold text-white mb-1">Monthly Goals Progress</h3>
            <p className="text-xs text-zinc-500 mb-5">Track KPI targets for May 2026</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10">
              <ProgressBar label="New Registrations" value={63} max={100} color="from-pink-500 to-rose-500" />
              <ProgressBar label="Active Memberships" value={1034} max={1200} color="from-emerald-500 to-teal-500" />
              <ProgressBar label="Revenue Target (Rs k)" value={285} max={350} color="from-red-500 to-orange-500" />
              <ProgressBar label="Check-in Rate (%)" value={83} max={100} color="from-violet-500 to-purple-500" />
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
                  {recentMembers.map((m, i) => (
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
                  ))}
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