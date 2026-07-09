"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { apiCall } from "../../utils/api";

const NAV_LINKS = [
  { icon: "⊞", label: "Dashboard",   path: "/GymManagerDashboard" },
  { icon: "👥", label: "Members",     path: "/GymManagerDashboard/members" },
  { icon: "🏋️", label: "Trainers",    path: "/GymManagerDashboard/Trainers" },
  { icon: "📅", label: "Check-ins",   path: "#" },
  { icon: "💳", label: "Memberships", path: "/GymManagerDashboard/Memberships" },
  { icon: "⚙️", label: "Settings",    path: "/GymManagerDashboard/Settings" },
];

export default function Sidebar({ active }) {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [checkIns, setCheckIns] = useState([]);
  const [members, setMembers] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all"); // "all" | "member" | "trainer"
  const [checkingInId, setCheckingInId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchCheckIns = async () => {
    setLoading(true);
    const { data, ok } = await apiCall("/api/manager/checkin");
    if (ok) setCheckIns(data.checkIns || []);
    setLoading(false);
  };

  const fetchSearchData = async () => {
    const [memRes, trRes] = await Promise.all([
      apiCall("/api/manager/members"),
      apiCall("/api/manager/trainers"),
    ]);
    if (memRes.ok) setMembers(memRes.data.members || []);
    if (trRes.ok) setTrainers(trRes.data.trainers || []);
  };

  useEffect(() => {
    if (drawerOpen) { fetchCheckIns(); fetchSearchData(); }
  }, [drawerOpen]);

  const handleNav = (link) => {
    if (link.label === "Check-ins") setDrawerOpen(true);
    else if (link.path !== "#") router.push(link.path);
  };

  const handleCheckIn = async (id, role) => {
    setCheckingInId(id);
    const { data, ok } = await apiCall("/api/manager/checkin", {
      method: "POST",
      body: JSON.stringify({ id, role }),
    });
    if (ok) {
      setCheckIns(prev => [data.checkIn, ...prev]);
      setSearch("");
      window.dispatchEvent(new Event("checkin-updated"));
    } else {
      alert(data.message || "Failed to check in");
    }
    setCheckingInId(null);
  };

  const handleDelete = async (checkInId) => {
    if (!confirm("Cancel this check-in?")) return;
    setDeletingId(checkInId);
    const { data, ok } = await apiCall(`/api/manager/checkin?id=${checkInId}`, { method: "DELETE" });
    if (ok) {
      setCheckIns(prev => prev.filter(c => c._id !== checkInId));
      window.dispatchEvent(new Event("checkin-updated"));
    } else {
      alert(data.message || "Failed to cancel check-in");
    }
    setDeletingId(null);
  };

  // Already checked-in IDs
  const checkedInIds = new Set(checkIns.map(c => c.user?._id || c.trainer?._id));

  const matchedMembers  = search ? members.filter(m => m.name?.toLowerCase().includes(search.toLowerCase()) && !checkedInIds.has(m._id)) : [];
  const matchedTrainers = search ? trainers.filter(t => t.name?.toLowerCase().includes(search.toLowerCase()) && !checkedInIds.has(t._id)) : [];

  const visibleCheckIns = tab === "all" ? checkIns : checkIns.filter(c => c.role === tab);

  return (
    <>
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 min-h-screen bg-zinc-950 border-r border-zinc-800/60 px-4 py-6 fixed top-0 left-0 z-30">
        <div className="flex items-center gap-2 mb-10 px-2 cursor-pointer" onClick={() => router.push("/GymManagerDashboard")}>
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow">
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M6.5 6.5h1v11h-1zM16.5 6.5h1v11h-1z" fill="currentColor" stroke="none"/>
              <rect x="4" y="8" width="3" height="8" rx="1" fill="currentColor" stroke="none"/>
              <rect x="17" y="8" width="3" height="8" rx="1" fill="currentColor" stroke="none"/>
              <line x1="7" y1="12" x2="17" y2="12" strokeWidth={2}/>
            </svg>
          </div>
          <span className="text-xl font-black uppercase">Fit<span className="text-red-600">core</span></span>
        </div>

        <nav className="flex flex-col gap-1 flex-1">
          {NAV_LINKS.map(l => (
            <button key={l.label} onClick={() => handleNav(l)}
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
          <p className="text-sm font-semibold">Gym Manager</p>
          <span className="text-xs bg-red-600/20 text-red-400 px-2 py-0.5 rounded-full border border-red-500/20">Admin</span>
        </div>
      </aside>

      {/* Check-ins Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setDrawerOpen(false)} />
          <div className="relative w-full max-w-md h-full bg-zinc-900 border-l border-zinc-800 shadow-2xl p-6 flex flex-col justify-between text-white overflow-y-auto">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex justify-between items-center pb-4 border-b border-zinc-800">
                <div>
                  <h3 className="text-lg font-black uppercase tracking-wider flex items-center gap-2">📅 Today's Check-ins</h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {new Date().toLocaleDateString("en-PK", { weekday: "short", month: "short", day: "numeric" })}
                  </p>
                </div>
                <button onClick={() => setDrawerOpen(false)}
                  className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition">✕</button>
              </div>

              {/* Search */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wide">Check-in Member or Trainer</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">🔍</span>
                  <input type="text" placeholder="Search by name..." value={search} onChange={e => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-950 text-white placeholder-zinc-500 border border-zinc-800 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm" />
                </div>

                {search && (
                  <div className="bg-zinc-950 border border-zinc-800 rounded-xl max-h-48 overflow-y-auto divide-y divide-zinc-800/60 shadow-2xl">
                    {matchedMembers.length === 0 && matchedTrainers.length === 0 ? (
                      <div className="p-3 text-center text-zinc-500 text-xs">No matches or already checked in</div>
                    ) : (
                      <>
                        {matchedMembers.map(m => (
                          <div key={m._id} className="p-3 flex justify-between items-center gap-3 hover:bg-zinc-900/60 transition">
                            <div>
                              <p className="text-xs font-semibold">{m.name}</p>
                              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-full uppercase font-bold">Member</span>
                            </div>
                            <button disabled={checkingInId === m._id} onClick={() => handleCheckIn(m._id, "member")}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition disabled:opacity-50">
                              {checkingInId === m._id ? "..." : "+ Check In"}
                            </button>
                          </div>
                        ))}
                        {matchedTrainers.map(t => (
                          <div key={t._id} className="p-3 flex justify-between items-center gap-3 hover:bg-zinc-900/60 transition">
                            <div>
                              <p className="text-xs font-semibold">{t.name}</p>
                              <span className="text-[10px] bg-violet-500/10 text-violet-400 border border-violet-500/20 px-1.5 py-0.5 rounded-full uppercase font-bold">Trainer</span>
                            </div>
                            <button disabled={checkingInId === t._id} onClick={() => handleCheckIn(t._id, "trainer")}
                              className="px-3 py-1 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-lg transition disabled:opacity-50">
                              {checkingInId === t._id ? "..." : "+ Check In"}
                            </button>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Tabs */}
              <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800">
                {[
                  { id: "all",     label: `All (${checkIns.length})` },
                  { id: "member",  label: `Members (${checkIns.filter(c => c.role === "member").length})` },
                  { id: "trainer", label: `Trainers (${checkIns.filter(c => c.role === "trainer").length})` },
                ].map(t => (
                  <button key={t.id} onClick={() => setTab(t.id)}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                      tab === t.id
                        ? t.id === "member"  ? "bg-emerald-500/25 text-emerald-400"
                        : t.id === "trainer" ? "bg-violet-500/25 text-violet-400"
                        : "bg-zinc-800 text-white"
                        : "text-zinc-400 hover:text-white"
                    }`}>
                    {t.label}
                  </button>
                ))}
              </div>

              {/* List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wide">Checked In</h4>
                {loading ? (
                  <div className="flex justify-center items-center py-10">
                    <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : visibleCheckIns.length === 0 ? (
                  <div className="text-center py-10 text-zinc-500 text-sm">No check-ins yet.</div>
                ) : (
                  <div className="space-y-2">
                    {visibleCheckIns.map(c => {
                      const isMember = c.role === "member";
                      const initials = c.name?.split(" ").map(n => n[0]).join("").toUpperCase() || "?";
                      const time = new Date(c.checkInTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
                      return (
                        <div key={c._id} className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-zinc-700 transition">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs border shadow-md ${
                              isMember ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-violet-500/10 text-violet-400 border-violet-500/20"
                            }`}>
                              {initials}
                            </div>
                            <div>
                              <p className="text-sm font-semibold">{c.name}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-full border ${
                                  isMember ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-violet-500/10 text-violet-400 border-violet-500/20"
                                }`}>{c.role}</span>
                                <span className="text-[10px] text-zinc-500">🕒 {time}</span>
                              </div>
                            </div>
                          </div>
                          <button disabled={deletingId === c._id} onClick={() => handleDelete(c._id)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 transition"
                            title="Cancel Check-in">
                            {deletingId === c._id ? "..." : "🗑️"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-800 mt-6">
              <button onClick={() => setDrawerOpen(false)}
                className="w-full py-3 bg-zinc-950 hover:bg-zinc-900 text-zinc-400 hover:text-white font-bold rounded-xl transition border border-zinc-800 text-sm">
                Close Panel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
