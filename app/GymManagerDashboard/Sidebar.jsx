"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

export default function Sidebar({ active }) {
  const router = useRouter();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [checkIns, setCheckIns] = useState([]);
  const [members, setMembers] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all"); // "all", "member", "trainer"
  const [checkingInId, setCheckingInId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const links = [
    { icon: "⊞", label: "Dashboard", path: "/GymManagerDashboard" },
    { icon: "👥", label: "Members", path: "/GymManagerDashboard/members" },
    { icon: "🏋️", label: "Trainers", path: "/GymManagerDashboard/Trainers" },
    { icon: "📅", label: "Check-ins", path: "#" },
    { icon: "💳", label: "Memberships", path: "/GymManagerDashboard/Memberships" },
    { icon: "💰", label: "Revenue", path: "#" },
    { icon: "⚙️", label: "Settings", path: "/GymManagerDashboard/Settings" },
  ];

  const fetchCheckIns = async () => {
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("/api/manager/checkin", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setCheckIns(data.checkIns || []);
      }
    } catch (err) {
      console.error("Failed to fetch check-ins:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSearchData = async () => {
    const token = localStorage.getItem("token");
    try {
      const resMem = await fetch("/api/manager/members", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const dataMem = await resMem.json();
      if (resMem.ok) {
        setMembers(dataMem.members || []);
      }

      const resTr = await fetch("/api/manager/trainers", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const dataTr = await resTr.json();
      if (resTr.ok) {
        setTrainers(dataTr.trainers || []);
      }
    } catch (err) {
      console.error("Failed to fetch search data:", err);
    }
  };

  useEffect(() => {
    if (isDrawerOpen) {
      fetchCheckIns();
      fetchSearchData();
    }
  }, [isDrawerOpen]);

  const handleNavigate = (link) => {
    if (link.label === "Check-ins") {
      setIsDrawerOpen(true);
    } else if (link.path !== "#") {
      router.push(link.path);
    }
  };

  const handleCheckIn = async (id, role) => {
    setCheckingInId(id);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("/api/manager/checkin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ id, role })
      });
      const data = await res.json();
      if (res.ok) {
        setCheckIns(prev => [data.checkIn, ...prev]);
        setSearchQuery("");
        // Dispatch event so that the main page Dashboard counts can refresh
        window.dispatchEvent(new Event("checkin-updated"));
      } else {
        alert(data.message || "Failed to check in");
      }
    } catch (err) {
      alert("An error occurred during check-in.");
    } finally {
      setCheckingInId(null);
    }
  };

  const handleDeleteCheckIn = async (checkInId) => {
    if (!confirm("Are you sure you want to cancel this check-in?")) return;
    setDeletingId(checkInId);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/manager/checkin?id=${checkInId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setCheckIns(prev => prev.filter(c => c._id !== checkInId));
        // Dispatch event to update the main page Dashboard counts
        window.dispatchEvent(new Event("checkin-updated"));
      } else {
        alert(data.message || "Failed to cancel check-in");
      }
    } catch (err) {
      alert("An error occurred while canceling check-in.");
    } finally {
      setDeletingId(null);
    }
  };

  // Filter out already checked-in IDs
  const checkedInIds = new Set(checkIns.map(c => c.user?._id || c.trainer?._id));

  const filteredMembersSearch = searchQuery
    ? members.filter(
        m =>
          m.name?.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !checkedInIds.has(m._id)
      )
    : [];

  const filteredTrainersSearch = searchQuery
    ? trainers.filter(
        t =>
          t.name?.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !checkedInIds.has(t._id)
      )
    : [];

  const filteredCheckIns = checkIns.filter(c => {
    if (activeTab === "all") return true;
    return c.role === activeTab;
  });

  const memberCheckInCount = checkIns.filter(c => c.role === "member").length;
  const trainerCheckInCount = checkIns.filter(c => c.role === "trainer").length;

  return (
    <>
      <aside className="hidden lg:flex flex-col w-60 min-h-screen bg-zinc-950 border-r border-zinc-800/60 px-4 py-6 fixed top-0 left-0 z-30">
        <div className="flex items-center gap-2 mb-10 px-2">
          <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18M5 6v12m14-12v12" />
          </svg>
          <span className="text-xl font-black uppercase cursor-pointer" onClick={() => router.push("/GymManagerDashboard")}>
            Fit<span className="text-red-600">core</span>
          </span>
        </div>
        <nav className="flex flex-col gap-1 flex-1">
          {links.map((l) => (
            <button key={l.label}
              onClick={() => handleNavigate(l)}
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

      {/* Slide-out Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity duration-300">
          {/* Backdrop Click */}
          <div className="absolute inset-0" onClick={() => setIsDrawerOpen(false)} />

          {/* Drawer Body */}
          <div className="relative w-full max-w-md h-full bg-zinc-900 border-l border-zinc-800 shadow-2xl p-6 flex flex-col justify-between transition-transform duration-300 text-white overflow-y-auto">
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex justify-between items-center pb-4 border-b border-zinc-800">
                <div>
                  <h3 className="text-lg font-black uppercase tracking-wider flex items-center gap-2">
                    <span>📅</span> Today's Check-ins
                  </h3>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {new Date().toLocaleDateString("en-PK", { weekday: "short", month: "short", day: "numeric" })}
                  </p>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Quick Check-in Search */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wide">
                  Check-in Member or Trainer
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">🔍</span>
                  <input
                    type="text"
                    placeholder="Search by name..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-950 text-white placeholder-zinc-500 border border-zinc-800 focus:outline-none focus:ring-2 focus:ring-red-500 transition-all text-sm"
                  />
                </div>

                {/* Search Results Dropdown */}
                {searchQuery && (
                  <div className="bg-zinc-950 border border-zinc-805 rounded-xl max-h-48 overflow-y-auto divide-y divide-zinc-850 shadow-2xl">
                    {filteredMembersSearch.length === 0 && filteredTrainersSearch.length === 0 ? (
                      <div className="p-3 text-center text-zinc-500 text-xs">
                        No matches found or already checked in
                      </div>
                    ) : (
                      <>
                        {filteredMembersSearch.map(m => (
                          <div key={m._id} className="p-3 flex justify-between items-center gap-3 hover:bg-zinc-900/60 transition-colors">
                            <div>
                              <p className="text-xs font-semibold text-white">{m.name}</p>
                              <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-full uppercase font-bold">
                                Member
                              </span>
                            </div>
                            <button
                              disabled={checkingInId === m._id}
                              onClick={() => handleCheckIn(m._id, "member")}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition disabled:opacity-50"
                            >
                              {checkingInId === m._id ? "..." : "+ Check In"}
                            </button>
                          </div>
                        ))}
                        {filteredTrainersSearch.map(t => (
                          <div key={t._id} className="p-3 flex justify-between items-center gap-3 hover:bg-zinc-900/60 transition-colors">
                            <div>
                              <p className="text-xs font-semibold text-white">{t.name}</p>
                              <span className="text-[10px] bg-violet-500/10 text-violet-400 border border-violet-500/20 px-1.5 py-0.5 rounded-full uppercase font-bold">
                                Trainer
                              </span>
                            </div>
                            <button
                              disabled={checkingInId === t._id}
                              onClick={() => handleCheckIn(t._id, "trainer")}
                              className="px-3 py-1 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-lg transition disabled:opacity-50"
                            >
                              {checkingInId === t._id ? "..." : "+ Check In"}
                            </button>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Tabs for filtering check-ins */}
              <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-800">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                    activeTab === "all" ? "bg-zinc-800 text-white" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  All ({checkIns.length})
                </button>
                <button
                  onClick={() => setActiveTab("member")}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                    activeTab === "member" ? "bg-emerald-500/25 text-emerald-400" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Members ({memberCheckInCount})
                </button>
                <button
                  onClick={() => setActiveTab("trainer")}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
                    activeTab === "trainer" ? "bg-violet-500/25 text-violet-400" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  Trainers ({trainerCheckInCount})
                </button>
              </div>

              {/* Check-in list */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wide">
                  Checked In List
                </h4>

                {loading ? (
                  <div className="flex justify-center items-center py-10">
                    <div className="w-6 h-6 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : filteredCheckIns.length === 0 ? (
                  <div className="text-center py-10 text-zinc-500 text-sm">
                    No check-ins today yet.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredCheckIns.map(c => {
                      const isMember = c.role === "member";
                      const initials = c.name ? c.name.split(" ").map(n => n[0]).join("").toUpperCase() : "?";
                      const timeStr = new Date(c.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      
                      return (
                        <div
                          key={c._id}
                          className="flex items-center justify-between p-3 rounded-xl bg-zinc-950 border border-zinc-850 hover:border-zinc-700 transition"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shadow-md border ${
                              isMember 
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                                : "bg-violet-500/10 text-violet-400 border-violet-500/20"
                            }`}>
                              {initials}
                            </div>
                            <div>
                              <p className="text-sm font-semibold">{c.name}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-full border ${
                                  isMember 
                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                                    : "bg-violet-500/10 text-violet-400 border-violet-500/20"
                                }`}>
                                  {c.role}
                                </span>
                                <span className="text-[10px] text-zinc-500 flex items-center gap-0.5">
                                  <span>🕒</span> {timeStr}
                                </span>
                              </div>
                            </div>
                          </div>

                          <button
                            disabled={deletingId === c._id}
                            onClick={() => handleDeleteCheckIn(c._id)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 hover:text-red-300 transition-colors"
                            title="Cancel Check-in"
                          >
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
              <button
                onClick={() => setIsDrawerOpen(false)}
                className="w-full py-3 bg-zinc-950 hover:bg-zinc-850 text-zinc-400 hover:text-white font-bold rounded-xl transition border border-zinc-800 text-sm"
              >
                Close Panel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
