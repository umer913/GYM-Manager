"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { apiCall } from "../../utils/api";

const NAV_LINKS = [
  {
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
    label: "Dashboard", path: "/GymManagerDashboard",
  },
  {
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" /><path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
    label: "Members", path: "/GymManagerDashboard/members",
  },
  {
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M6.5 6.5h1v11h-1zM16.5 6.5h1v11h-1z" fill="currentColor" stroke="none" />
        <rect x="4" y="8" width="3" height="8" rx="1" fill="currentColor" stroke="none" />
        <rect x="17" y="8" width="3" height="8" rx="1" fill="currentColor" stroke="none" />
        <line x1="7" y1="12" x2="17" y2="12" strokeWidth={2} />
      </svg>
    ),
    label: "Trainers", path: "/GymManagerDashboard/Trainers",
  },
  {
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    label: "Check-ins", path: "#",
  },
  {
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
    label: "Memberships", path: "/GymManagerDashboard/Memberships",
  },
  {
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
    label: "Settings", path: "/GymManagerDashboard/Settings",
  },
];

const LogoIcon = () => (
  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M6.5 6.5h1v11h-1zM16.5 6.5h1v11h-1z" fill="currentColor" stroke="none" />
    <rect x="4" y="8" width="3" height="8" rx="1" fill="currentColor" stroke="none" />
    <rect x="17" y="8" width="3" height="8" rx="1" fill="currentColor" stroke="none" />
    <line x1="7" y1="12" x2="17" y2="12" strokeWidth={2} />
  </svg>
);

export default function Sidebar({ active }) {
  const router = useRouter();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [checkIns, setCheckIns] = useState([]);
  const [members, setMembers] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("all");
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
    else if (link.path !== "#") { router.push(link.path); setMobileOpen(false); }
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

  const handleLogout = () => {
    if (confirm("Are you sure you want to log out?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("appTheme");
      router.push("/Login");
    }
  };

  const checkedInIds = new Set(checkIns.map(c => c.user?._id || c.trainer?._id));
  const matchedMembers  = search ? members.filter(m => m.name?.toLowerCase().includes(search.toLowerCase()) && !checkedInIds.has(m._id)) : [];
  const matchedTrainers = search ? trainers.filter(t => t.name?.toLowerCase().includes(search.toLowerCase()) && !checkedInIds.has(t._id)) : [];
  const visibleCheckIns = tab === "all" ? checkIns : checkIns.filter(c => c.role === tab);
  const isActive = (link) => link.label === active || pathname === link.path;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <button
        onClick={() => handleNav({ label: "Dashboard", path: "/GymManagerDashboard" })}
        className="flex items-center gap-2.5 px-1 mb-8 cursor-pointer group"
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg shadow-red-500/20 group-hover:scale-110 transition-transform duration-300">
          <LogoIcon />
        </div>
        <span className="text-xl font-black uppercase tracking-tight text-white group-hover:text-red-500 transition-colors duration-200">
          Fit<span className="text-red-500">core</span>
        </span>
      </button>

      {/* Admin chip */}
      <div className="flex items-center gap-3 px-3 py-2.5 mb-6 rounded-xl bg-zinc-900 border border-zinc-800">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-xs font-black text-white shrink-0 shadow-md shadow-red-500/20">
          GM
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-white truncate">Gym Manager</p>
          <p className="text-[10px] text-zinc-500 truncate">admin@fitcore.com</p>
        </div>
        <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md bg-red-500/10 text-red-400 border border-red-500/20 shrink-0 uppercase tracking-wide">
          Admin
        </span>
      </div>

      {/* Nav label */}
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 px-3 mb-2">Navigation</p>

      {/* Nav links */}
      <nav className="flex flex-col gap-0.5 flex-1">
        {NAV_LINKS.map((l) => {
          const activeLink = isActive(l);
          return (
            <button
              key={l.label}
              onClick={() => handleNav(l)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer w-full text-left border
                ${activeLink
                  ? "bg-gradient-to-r from-red-500/15 to-orange-500/10 text-red-400 border-red-500/25 shadow-sm shadow-red-500/5"
                  : "text-zinc-400 border-transparent hover:text-white hover:bg-zinc-900/70"
                }`}
            >
              <span className={`transition-colors duration-150 ${activeLink ? "text-red-400" : "text-zinc-600"}`}>
                {l.icon}
              </span>
              <span className="flex-1">{l.label}</span>
              {activeLink && <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="mt-4 pt-4 border-t border-zinc-800 space-y-1">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-semibold text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 min-h-screen bg-zinc-950 border-r border-zinc-800/80 px-4 py-6 fixed top-0 left-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-zinc-950 border-b border-zinc-800/80 px-4 h-14 flex items-center justify-between">
        <button onClick={() => router.push("/GymManagerDashboard")} className="flex items-center gap-2 cursor-pointer group">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform">
            <LogoIcon />
          </div>
          <span className="text-base font-black uppercase text-white">Fit<span className="text-red-500">core</span></span>
        </button>
        <button onClick={() => setMobileOpen(true)} className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-300 hover:bg-zinc-900 transition cursor-pointer">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative w-72 max-w-[85vw] h-full bg-zinc-950 border-r border-zinc-800/80 px-4 py-6 shadow-2xl overflow-y-auto">
            <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:bg-zinc-900 transition cursor-pointer">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Check-ins Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
          <div className="absolute inset-0" onClick={() => setDrawerOpen(false)} />
          <div className="relative w-full max-w-md h-full bg-zinc-900 border-l border-zinc-800 shadow-2xl p-6 flex flex-col justify-between text-white overflow-y-auto">
            <div className="space-y-6">
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
