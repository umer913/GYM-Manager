"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import BarChart from "../../../components/BarChart";
import DonutChart from "../../../components/DonutChart";
import ProgressBar from "../../../components/ProgressBar";
import { apiCall } from "../../../utils/api";

// ── StatCard ─────────────────────────────────────────────────────────
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
      <span className="absolute -bottom-3 -right-2 text-7xl font-black uppercase tracking-tighter text-white/[0.04] select-none pointer-events-none leading-none">
        {bigLabel}
      </span>
      <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r ${accent}`} />
      <div className={`absolute -top-8 -right-8 w-28 h-28 rounded-full bg-gradient-to-br ${accent} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity duration-500`} />
      <div className="relative z-10">
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-500 mb-3">{label}</p>
        <p className={`text-4xl font-black leading-none text-transparent bg-clip-text bg-gradient-to-r ${accent}`}>
          {value}
        </p>
        {sub && <p className="text-xs text-zinc-500 mt-2 leading-snug">{sub}</p>}
      </div>
    </div>
  );
}

// ── QR Code Modal ────────────────────────────────────────────────────
function QrCodeModal({ onClose }) {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState(30);
  const [gymLoc, setGymLoc] = useState(null);
  const [coords, setCoords] = useState(null);
  const [newAddress, setNewAddress] = useState("");
  const [updatingLoc, setUpdatingLoc] = useState(false);

  const fetchToken = async () => {
    const { data, ok } = await apiCall("/api/manager/qr-session");
    if (ok && data.success) {
      setToken(data.token);
      setGymLoc(data.gymLocation);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchToken();
    setTimeLeft(30);
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) { fetchToken(); return 30; }
        return prev - 1;
      });
    }, 1000);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) =>
        setCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude })
      );
    }
    return () => clearInterval(timer);
  }, []);

  const handleSyncGPS = async () => {
    if (!coords) return alert("GPS not ready. Please allow location access.");
    setUpdatingLoc(true);
    const { data, ok } = await apiCall("/api/manager/qr-session", {
      method: "POST",
      body: JSON.stringify({ latitude: coords.latitude, longitude: coords.longitude }),
    });
    if (ok && data.success) {
      setGymLoc(data.gymLocation);
      alert(`Gym location synced: "${data.gymLocation.address}"`);
    } else {
      alert(data.message || "Failed to sync location.");
    }
    setUpdatingLoc(false);
  };

  const handleUpdateAddress = async (e) => {
    e.preventDefault();
    if (!newAddress) return;
    setUpdatingLoc(true);
    const { data, ok } = await apiCall("/api/manager/qr-session", {
      method: "POST",
      body: JSON.stringify({ address: newAddress }),
    });
    if (ok && data.success) {
      setGymLoc(data.gymLocation);
      setNewAddress("");
      alert(`Gym address updated: "${data.gymLocation.address}"`);
    } else {
      alert(data.message || "Failed to update address.");
    }
    setUpdatingLoc(false);
  };

  const qrUrl = token
    ? `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(token)}`
    : "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md">
      <div className="relative w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-6 text-white text-center">
        <div className="flex justify-between items-center pb-3 border-b border-zinc-800">
          <h3 className="font-bold text-sm uppercase tracking-wider flex items-center gap-1.5">
             Gym Attendance QR
          </h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition text-sm">✕</button>
        </div>

        <div className="flex flex-col items-center space-y-4 py-4">
          {loading ? (
            <div className="w-48 h-48 rounded-xl bg-zinc-950 border border-zinc-800 flex flex-col justify-center items-center gap-3">
              <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-zinc-500">Generating code...</p>
            </div>
          ) : qrUrl ? (
            <div className="p-3 bg-white rounded-xl border border-zinc-700">
              <img src={qrUrl} alt="Attendance QR Code" className="w-48 h-48" />
            </div>
          ) : (
            <p className="text-sm text-red-400">Failed to generate code</p>
          )}
          <span className="text-sm font-black text-red-500 bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-full">
            Refreshes in {timeLeft}s
          </span>
        </div>

        <div className="bg-zinc-950 rounded-xl p-3 border border-zinc-800 text-left space-y-2 text-xs">
          <p className="font-bold text-zinc-300 text-center uppercase tracking-wide border-b border-zinc-900 pb-1.5 mb-1.5">Gym Location Settings</p>
          <p className="text-zinc-500 font-semibold uppercase text-[9px]">Active Address:</p>
          <p className="bg-zinc-900 p-2 rounded border border-zinc-800 text-zinc-300">{gymLoc?.address || "Resolving..."}</p>

          <button
            disabled={updatingLoc || !coords}
            onClick={handleSyncGPS}
            className="w-full py-1.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-zinc-300 font-semibold rounded-lg text-[10px] transition cursor-pointer"
          >
            {updatingLoc ? "Updating..." : "📍 Sync to My GPS"}
          </button>

          <form onSubmit={handleUpdateAddress} className="space-y-1 pt-1">
            <label className="text-[9px] font-bold text-zinc-500 uppercase">Change Gym Address</label>
            <div className="flex gap-1.5">
              <input
                type="text"
                placeholder="e.g. DHA Phase 5 Lahore"
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                className="flex-1 px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-red-500"
              />
              <button type="submit" disabled={updatingLoc || !newAddress}
                className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-white rounded text-[10px] font-bold transition disabled:opacity-50 cursor-pointer">
                Set
              </button>
            </div>
          </form>

          {gymLoc && (
            <div className="pt-1 border-t border-zinc-900 text-[9px] font-mono text-zinc-500 flex justify-between">
              <span>Lat: {gymLoc.latitude.toFixed(4)}</span>
              <span>Lng: {gymLoc.longitude.toFixed(4)}</span>
            </div>
          )}
        </div>

        <button onClick={onClose} className="w-full py-2.5 bg-zinc-950 hover:bg-zinc-900 text-zinc-400 hover:text-white font-bold rounded-xl transition border border-zinc-800 text-xs cursor-pointer">
          Hide Code
        </button>
      </div>
    </div>
  );
}

// ── Main Dashboard ───────────────────────────────────────────────────
export default function DashboardPage() {
  const router = useRouter();
  const [showQR, setShowQR] = useState(false);

  const [stats, setStats] = useState({
    totalMembers: 0, activeMemberships: 0, todayCheckIns: 0,
    trainersCount: 0, newRegistrations: 0, monthlyRevenue: 0,
  });
  const [recentMembers, setRecentMembers] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [checkInData, setCheckInData] = useState([0, 0, 0, 0, 0, 0, 0]);
  const [membershipSegments, setMembershipSegments] = useState([
    { label: "Basic", value: 0, color: "#6366f1" },
    { label: "Pro", value: 0, color: "#ef4444" },
    { label: "Inactive", value: 0, color: "#3f3f46" },
  ]);

  const fetchData = async () => {
    const [ciRes, memRes, trRes] = await Promise.all([
      apiCall("/api/manager/checkin"),
      apiCall("/api/manager/members"),
      apiCall("/api/manager/trainers"),
    ]);

    const checkIns = ciRes.ok ? (ciRes.data.checkIns || []) : [];
    const membersList = memRes.ok ? (memRes.data.members || []) : [];
    const trainersList = trRes.ok ? (trRes.data.trainers || []) : [];

    const totalMembers = membersList.length;
    const activeMemberships = membersList.filter(m => m.membershipStatus === "active").length;
    const trainersCount = trainersList.length;
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const newRegistrations = membersList.filter(m => new Date(m.createdAt) >= thirtyDaysAgo).length;
    const monthlyRevenue = membersList
      .filter(m => m.membershipStatus === "active" && m.plan)
      .reduce((sum, m) => sum + (m.plan.price || 0), 0);

    setStats({ totalMembers, activeMemberships, todayCheckIns: checkIns.length, trainersCount, newRegistrations, monthlyRevenue });

    setRecentMembers(membersList.slice(0, 5).map(m => ({
      name: m.name || "Unknown",
      plan: m.plan?.name || "None",
      date: m.createdAt ? new Date(m.createdAt).toLocaleDateString("en-PK", { month: "short", day: "numeric", year: "numeric" }) : "—",
      status: m.membershipStatus || "active",
    })));

    const planGroups = {};
    membersList.filter(m => m.membershipStatus !== "inactive").forEach(m => {
      const name = m.plan?.name || "No Plan";
      planGroups[name] = (planGroups[name] || 0) + 1;
    });
    const inactive = totalMembers - activeMemberships;
    const segments = Object.keys(planGroups).map((name, idx) => ({
      label: name, value: planGroups[name],
      color: ["#6366f1", "#ef4444", "#10b981", "#f59e0b", "#ec4899"][idx % 5],
    }));
    if (inactive > 0) segments.push({ label: "Inactive", value: inactive, color: "#3f3f46" });
    setMembershipSegments(segments.length > 0 ? segments : [
      { label: "Basic", value: 0, color: "#6366f1" },
      { label: "Pro", value: 0, color: "#ef4444" },
      { label: "Inactive", value: 0, color: "#3f3f46" },
    ]);

    const trainerMemberCount = {};
    membersList.forEach(m => {
      if (m.assignedTrainer) {
        const id = typeof m.assignedTrainer === "object" ? m.assignedTrainer._id : m.assignedTrainer;
        trainerMemberCount[id] = (trainerMemberCount[id] || 0) + 1;
      }
    });
    setTrainers(trainersList.map(t => ({ name: t.name, specialty: t.specialty, members: trainerMemberCount[t._id] || 0, capacity: 15 })));

    // Weekly check-in chart — only today's slot is real, rest start at 0
    const counts = [0, 0, 0, 0, 0, 0, 0];
    const dayIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
    counts[dayIdx] = checkIns.length;
    setCheckInData(counts);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/Login"); return; }
    fetchData();
    window.addEventListener("checkin-updated", fetchData);
    return () => window.removeEventListener("checkin-updated", fetchData);
  }, [router]);

  const kpis = [
    { label: "Total Members", value: stats.totalMembers, sub: "Registered in the system", accent: "from-blue-500 to-indigo-600" },
    { label: "Active Memberships", value: stats.activeMemberships, sub: "With active plan", accent: "from-emerald-500 to-teal-600" },
    { label: "Monthly Revenue", value: `Rs ${stats.monthlyRevenue.toLocaleString()}`, sub: "Active plan subscribers", accent: "from-red-500 to-orange-500" },
  ];

  const REVENUE_DATA = [0, 0, 0, 0, 0, 0, Math.round(stats.monthlyRevenue / 1000)];
  const REVENUE_LABELS = ["6mo ago", "5mo ago", "4mo ago", "3mo ago", "2mo ago", "Last mo", "This mo"];
  const CHECKIN_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const dateStr = new Date().toLocaleDateString("en-PK", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-zinc-900 text-neutral-100 font-sans selection:bg-red-500 selection:text-white">
      <Sidebar active="Dashboard" />

      <div className="lg:ml-60 flex flex-col min-h-screen pt-14 lg:pt-0">

        {/* Header */}
        <header className="sticky top-14 lg:top-0 z-20 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-md border-b border-zinc-900/60 px-5 sm:px-8 py-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-red-500">Gym Manager Portal</p>
            <h1 className="text-lg sm:text-xl font-black uppercase tracking-tight text-white mt-0.5 leading-none">Dashboard</h1>
            <p className="text-[11px] text-zinc-600 mt-0.5 hidden sm:block">{dateStr}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowQR(true)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
            >
              Attendance QR
            </button>

          </div>
        </header>

        <main className="flex-1 px-4 sm:px-8 py-6 space-y-5 max-w-6xl w-full mx-auto">

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {kpis.map((k, i) => <StatCard key={k.label} {...k} delay={i * 80} />)}
          </div>

          {/* Charts row */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            <div className="xl:col-span-2 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 p-5">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-black uppercase tracking-tight text-sm">Monthly Revenue</h3>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">Last 7 months</span>
              </div>
              <p className="text-[11px] text-zinc-500 mb-4">Revenue in thousands (Rs)</p>
              <BarChart data={REVENUE_DATA} labels={REVENUE_LABELS} color="#ef4444" />
            </div>
            <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800/80 p-5">
              <h3 className="font-black uppercase tracking-tight text-sm mb-1">Membership Split</h3>
              <p className="text-[11px] text-zinc-500 mb-4">Total across all plans</p>
              <DonutChart segments={membershipSegments} />
            </div>
          </div>

          {/* Check-ins + Trainer Capacity */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800/80 p-5">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-black uppercase tracking-tight text-sm">Weekly Check-ins</h3>
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">This Week</span>
              </div>
              <p className="text-[11px] text-zinc-500 mb-4">Daily attendance count</p>
              <BarChart data={checkInData} labels={CHECKIN_LABELS} color="#8b5cf6" />
            </div>
            <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800/80 p-5">
              <h3 className="font-black uppercase tracking-tight text-sm mb-1">Trainer Capacity</h3>
              <p className="text-[11px] text-zinc-500 mb-4">Members assigned vs max capacity</p>
              {trainers.length === 0 ? (
                <div className="flex items-center justify-center py-8 text-zinc-500 text-sm">No trainers registered</div>
              ) : (
                trainers.map((t, i) => (
                  <ProgressBar key={i}
                    label={`${t.name} · ${t.specialty}`}
                    value={t.members} max={t.capacity}
                    color={["from-red-500 to-orange-500", "from-violet-500 to-purple-500", "from-blue-500 to-indigo-500", "from-emerald-500 to-teal-500"][i % 4]}
                  />
                ))
              )}
            </div>
          </div>

          {/* Monthly Goals */}
          <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800/80 p-5">
            <h3 className="font-black uppercase tracking-tight text-sm mb-1">Monthly Goals Progress</h3>
            <p className="text-[11px] text-zinc-500 mb-5">Track KPI targets</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10">
              <ProgressBar label="New Registrations" value={stats.newRegistrations} max={100} color="from-pink-500 to-rose-500" />
              <ProgressBar label="Active Memberships" value={stats.activeMemberships} max={1200} color="from-emerald-500 to-teal-500" />
              <ProgressBar label="Revenue Target (Rs k)" value={Math.round(stats.monthlyRevenue / 1000)} max={350} color="from-red-500 to-orange-500" />
              <ProgressBar label="Check-in Rate (%)"
                value={stats.activeMemberships > 0 ? Math.round((stats.todayCheckIns / stats.activeMemberships) * 100) : 0}
                max={100} color="from-violet-500 to-purple-500"
              />
            </div>
          </div>



        </main>

        <footer className="border-t border-zinc-900/60 px-6 py-5 text-center text-xs text-zinc-600 mt-auto">
          © {new Date().getFullYear()} Fitcore — Gym Manager Portal
        </footer>
      </div>

      {showQR && <QrCodeModal onClose={() => setShowQR(false)} />}
    </div>
  );
}
