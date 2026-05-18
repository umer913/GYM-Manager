"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const quotes = [
  "The only bad workout is the one that didn't happen.",
  "Your body can stand almost anything. It's your mind you have to convince.",
  "Strength does not come from the body. It comes from the will.",
  "Push harder than yesterday if you want a different tomorrow.",
  "Success starts with self-discipline.",
];

function AnimatedNum({ target, prefix = "", suffix = "" }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let s = 0; const step = Math.ceil(target / 35);
    const t = setInterval(() => { s += step; if (s >= target) { setVal(target); clearInterval(t); } else setVal(s); }, 30);
    return () => clearInterval(t);
  }, [target]);
  return <span>{prefix}{val.toLocaleString()}{suffix}</span>;
}

function CircularProgress({ value, max, size = 100, stroke = 10, color = "#ef4444", label, sublabel }) {
  const r = (size - stroke) / 2, circ = 2 * Math.PI * r, pct = Math.min(value / max, 1);
  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#27272a" strokeWidth={stroke} />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.2s ease" }} />
      </svg>
      <div className="absolute flex flex-col items-center justify-center" style={{ width: size, height: size }}>
        <span className="text-lg font-black text-white">{Math.round(pct * 100)}%</span>
      </div>
      {label && <p className="text-xs text-zinc-400 mt-1">{label}</p>}
      {sublabel && <p className="text-[10px] text-zinc-600">{sublabel}</p>}
    </div>
  );
}

function ProgressBar({ label, value, max, color = "from-red-500 to-orange-500", unit = "" }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-zinc-300">{label}</span>
        <span className="text-zinc-500">{value}{unit} / {max}{unit}</span>
      </div>
      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-1000`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function KpiCard({ icon, label, value, prefix = "", suffix = "", sub, accent = "from-red-500 to-orange-500", delay = 0 }) {
  const [vis, setVis] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVis(true), delay); return () => clearTimeout(t); }, [delay]);
  return (
    <div className={`relative rounded-2xl p-5 bg-zinc-900/80 border border-zinc-800 hover:border-zinc-600 shadow-xl transition-all duration-700 overflow-hidden group
      ${vis ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
      style={{ transition: `opacity .6s ease ${delay}ms, transform .6s ease ${delay}ms, border-color .3s` }}>
      <div className={`absolute -top-10 -right-10 w-28 h-28 rounded-full bg-gradient-to-br ${accent} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity`} />
      <div className="flex justify-between items-start">
        <div>
          <p className="text-zinc-500 text-xs uppercase tracking-widest mb-1">{label}</p>
          <h2 className="text-2xl font-black text-white">
            {vis ? <AnimatedNum target={value} prefix={prefix} suffix={suffix} /> : "0"}
          </h2>
          {sub && <p className="text-xs text-zinc-500 mt-1">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${accent} text-white text-lg shadow-lg`}>{icon}</div>
      </div>
    </div>
  );
}

function WeekGrid({ data }) {
  const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  return (
    <div className="flex gap-2 mt-2">
      {days.map((d, i) => (
        <div key={d} className="flex flex-col items-center gap-1 flex-1">
          <div className={`w-full aspect-square rounded-lg flex items-center justify-center text-xs font-bold transition-all duration-300
            ${data[i] ? "bg-gradient-to-br from-emerald-500/30 to-teal-500/20 text-emerald-400 border border-emerald-500/30" : "bg-zinc-800/60 text-zinc-600 border border-zinc-800"}`}>
            {data[i] ? "✓" : "—"}
          </div>
          <span className="text-[10px] text-zinc-500">{d}</span>
        </div>
      ))}
    </div>
  );
}

function BarMini({ data, labels, color = "#ef4444" }) {
  const max = Math.max(...data);
  return (
    <div className="flex items-end gap-1.5 h-28 mt-2">
      {data.map((v, i) => (
        <div key={i} className="flex flex-col items-center flex-1 gap-1">
          <span className="text-[10px] text-zinc-600">{v}</span>
          <div className="w-full rounded-t-md transition-all duration-700"
            style={{ height: `${(v / max) * 90}px`, background: `linear-gradient(to top, ${color}66, ${color})` }} />
          <span className="text-[10px] text-zinc-600">{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}

export default function MemberDashboard() {
  const router = useRouter();
  const [quote] = useState(quotes[Math.floor(Math.random() * quotes.length)]);

  useEffect(() => {
    if (!localStorage.getItem("token")) router.push("/login");
  }, [router]);

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
  const dateStr = now.toLocaleDateString("en-PK", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  // Mock data
  const memberName = "Ali Hassan";
  const kpis = [
    { icon: "💳", label: "Membership Status", value: 1, prefix: "", suffix: "", sub: "Active — Pro Plan", accent: "from-emerald-500 to-teal-600", display: "Active" },
    { icon: "⏳", label: "Days Remaining", value: 42, sub: "Expires July 1, 2026", accent: "from-amber-500 to-yellow-500" },
    { icon: "🏋️", label: "Today's Workout", value: 1, sub: "Chest & Triceps Day", accent: "from-violet-500 to-purple-600", display: "Chest" },
    { icon: "🔥", label: "Calories Burned", value: 485, suffix: " kcal", sub: "Today's session", accent: "from-red-500 to-orange-500" },
    { icon: "⚖️", label: "Current Weight", value: 78, suffix: " kg", sub: "↓ 2kg this month", accent: "from-blue-500 to-indigo-600" },
    { icon: "📅", label: "Attendance Count", value: 22, sub: "This month (May)", accent: "from-pink-500 to-rose-600" },
  ];

  const weekAttendance = [true, true, false, true, true, true, false]; // Mon-Sun
  const caloriesWeek = [420, 510, 0, 480, 530, 485, 0];
  const calLabels = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

  const todayWorkout = [
    { exercise: "Bench Press", sets: "4×10", done: true },
    { exercise: "Incline Dumbbell Press", sets: "3×12", done: true },
    { exercise: "Cable Fly", sets: "3×15", done: false },
    { exercise: "Tricep Dips", sets: "3×12", done: false },
    { exercise: "Overhead Extension", sets: "3×15", done: false },
    { exercise: "Skull Crushers", sets: "3×10", done: false },
  ];
  const workoutDone = todayWorkout.filter(w => w.done).length;

  const sideLinks = [
    { icon: "⊞", label: "Dashboard" },
    { icon: "🏋️", label: "My Workouts" },
    { icon: "📅", label: "Attendance" },
    { icon: "📊", label: "Progress" },
    { icon: "💳", label: "My Plan" },
    { icon: "👤", label: "Profile" },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 min-h-screen bg-zinc-950 border-r border-zinc-800/60 px-4 py-6 fixed top-0 left-0 z-30">
        <div className="flex items-center gap-2 mb-10 px-2">
          <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18M5 6v12m14-12v12" />
          </svg>
          <span className="text-xl font-black uppercase">Fit<span className="text-red-600">core</span></span>
        </div>
        <nav className="flex flex-col gap-1 flex-1">
          {sideLinks.map(l => (
            <button key={l.label}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                ${l.label === "Dashboard" ? "bg-gradient-to-r from-red-600/20 to-orange-600/10 text-white border border-red-500/30" : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"}`}>
              <span>{l.icon}</span>{l.label}
            </button>
          ))}
        </nav>
        <div className="mt-6 p-3 rounded-xl bg-zinc-900 border border-zinc-800">
          <p className="text-xs text-zinc-500 mb-1">Logged in as</p>
          <p className="text-sm font-semibold text-white">{memberName}</p>
          <span className="text-xs bg-emerald-600/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">Member</span>
        </div>
      </aside>

      <div className="lg:ml-60 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="sticky top-0 z-20 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/60 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Member Dashboard</h1>
            <p className="text-xs text-zinc-500">{dateStr}</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="w-9 h-9 rounded-xl bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-300 transition-colors">🔔</button>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center font-bold text-sm">AH</div>
          </div>
        </header>

        <main className="flex-1 px-6 py-6 space-y-6">

          {/* Welcome Banner */}
          <div className="relative rounded-2xl overflow-hidden p-6 bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-900/80 border border-zinc-800">
            <div className="absolute inset-0 bg-gradient-to-r from-red-600/5 via-orange-500/5 to-transparent pointer-events-none" />
            <div className="absolute -top-16 -right-16 w-48 h-48 bg-gradient-to-br from-red-500/10 to-orange-500/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <p className="text-zinc-400 text-sm">{greeting} 👋</p>
              <h2 className="text-2xl font-black text-white mt-1">{memberName}</h2>
              <p className="text-zinc-500 text-sm mt-2 italic max-w-lg">&ldquo;{quote}&rdquo;</p>
              <div className="mt-4 flex items-center gap-3">
                <span className="text-xs bg-emerald-500/15 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20 font-semibold">Pro Plan — Active</span>
                <span className="text-xs bg-violet-500/15 text-violet-400 px-3 py-1 rounded-full border border-violet-500/20 font-semibold">Chest & Triceps Day</span>
              </div>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {kpis.map((k, i) => (
              <KpiCard key={k.label} icon={k.icon} label={k.label}
                value={k.display ? 0 : k.value}
                prefix={k.prefix || ""} suffix={k.suffix || ""}
                sub={k.sub} accent={k.accent} delay={i * 80}
              />
            ))}
          </div>

          {/* Daily Goals + Workout */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">

            {/* Daily Goals */}
            <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-5">
              <h3 className="font-bold text-white mb-1">Daily Goal Progress</h3>
              <p className="text-xs text-zinc-500 mb-5">Track your targets for today</p>
              <div className="flex justify-around mb-4">
                <div className="relative"><CircularProgress value={485} max={600} size={90} stroke={8} color="#ef4444" label="Calories" sublabel="485 / 600" /></div>
                <div className="relative"><CircularProgress value={7200} max={10000} size={90} stroke={8} color="#8b5cf6" label="Steps" sublabel="7.2k / 10k" /></div>
                <div className="relative"><CircularProgress value={2.1} max={3} size={90} stroke={8} color="#06b6d4" label="Water (L)" sublabel="2.1 / 3.0" /></div>
              </div>
              <ProgressBar label="Workout Completion" value={workoutDone} max={todayWorkout.length} color="from-emerald-500 to-teal-500" />
              <ProgressBar label="Protein Intake (g)" value={120} max={160} color="from-amber-500 to-yellow-500" unit="g" />
              <ProgressBar label="Sleep (hrs)" value={7} max={8} color="from-indigo-500 to-blue-500" unit="h" />
            </div>

            {/* Today's Workout */}
            <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-5">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-bold text-white">Today&apos;s Workout</h3>
                <span className="text-xs text-violet-400 bg-violet-500/10 px-3 py-1 rounded-full border border-violet-500/20">Chest & Triceps</span>
              </div>
              <p className="text-xs text-zinc-500 mb-4">{workoutDone}/{todayWorkout.length} exercises completed</p>
              <div className="space-y-2">
                {todayWorkout.map((w, i) => (
                  <div key={i} className={`flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all duration-300
                    ${w.done ? "bg-emerald-500/5 border-emerald-500/20" : "bg-zinc-800/40 border-zinc-800 hover:border-zinc-700"}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold
                        ${w.done ? "bg-emerald-500 text-white" : "bg-zinc-700 text-zinc-400"}`}>
                        {w.done ? "✓" : i + 1}
                      </div>
                      <span className={`text-sm ${w.done ? "text-zinc-300 line-through" : "text-white"}`}>{w.exercise}</span>
                    </div>
                    <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-md">{w.sets}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Attendance + Calories Charts */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-5">
              <h3 className="font-bold text-white mb-1">This Week&apos;s Attendance</h3>
              <p className="text-xs text-zinc-500 mb-2">5 out of 7 days — Great consistency! 🔥</p>
              <WeekGrid data={weekAttendance} />
            </div>
            <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-5">
              <h3 className="font-bold text-white mb-1">Calories Burned This Week</h3>
              <p className="text-xs text-zinc-500 mb-1">Total: {caloriesWeek.reduce((a,b)=>a+b,0)} kcal</p>
              <BarMini data={caloriesWeek} labels={calLabels} color="#ef4444" />
            </div>
          </div>

          {/* Active Plan Card */}
          <div className="relative rounded-2xl overflow-hidden border border-zinc-800">
            <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 via-orange-500/5 to-transparent pointer-events-none" />
            <div className="p-5 relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs bg-red-500/15 text-red-400 px-2 py-0.5 rounded-full border border-red-500/20 font-bold uppercase tracking-wider">Active Plan</span>
                </div>
                <h3 className="text-xl font-black text-white">Pro Membership</h3>
                <p className="text-sm text-zinc-400 mt-1">Personal trainer sessions + premium classes included</p>
                <div className="flex gap-4 mt-3 text-xs text-zinc-500">
                  <span>Started: <span className="text-zinc-300">May 20, 2026</span></span>
                  <span>Expires: <span className="text-zinc-300">July 1, 2026</span></span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">Rs 8,000</p>
                <p className="text-xs text-zinc-500">/month</p>
                <button className="mt-2 text-xs bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white px-4 py-2 rounded-lg font-bold transition-all duration-300 shadow-lg shadow-red-500/20">Renew Plan</button>
              </div>
            </div>
            <div className="px-5 pb-4">
              <ProgressBar label="Plan Duration" value={42} max={60} color="from-red-500 to-orange-500" unit=" days" />
            </div>
          </div>

        </main>

        <footer className="border-t border-zinc-800/60 px-6 py-4 text-center text-xs text-zinc-600">
          © {new Date().getFullYear()} Fitcore — Member Portal
        </footer>
      </div>
    </div>
  );
}
