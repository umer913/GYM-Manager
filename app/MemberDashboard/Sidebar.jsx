"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppContext } from "../../context/AppContext";

const NAV_LINKS = [
  { icon: "⊞", label: "Dashboard",   path: "/MemberDashboard" },
  { icon: "🏋️", label: "My Workouts", path: "/MemberDashboard/Workouts" },
  { icon: "📅", label: "Attendance",  path: "/MemberDashboard/Attendance" },
  { icon: "👥", label: "Trainers",    path: "/MemberDashboard/Trainers" },
  { icon: "💳", label: "My Plan",     path: "/MemberDashboard/Plans" },
  { icon: "👤", label: "Profile",     path: "/MemberDashboard/Profile" },
];

export default function Sidebar({ active, member }) {
  const router   = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useAppContext();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (link) => link.label === active || pathname === link.path;

  const handleNav = (path) => {
    router.push(path);
    setMobileOpen(false);
  };

  const handleLogout = () => {
    if (confirm("Are you sure you want to log out?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("appTheme");
      router.push("/Login");
    }
  };

  const initials = member?.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "ME";

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <button
        onClick={() => handleNav("/MemberDashboard")}
        className="flex items-center gap-2.5 px-2 mb-8 cursor-pointer group"
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M6.5 6.5h1v11h-1zM16.5 6.5h1v11h-1z" fill="currentColor" stroke="none"/>
            <rect x="4" y="8" width="3" height="8" rx="1" fill="currentColor" stroke="none"/>
            <rect x="17" y="8" width="3" height="8" rx="1" fill="currentColor" stroke="none"/>
            <line x1="7" y1="12" x2="17" y2="12" strokeWidth={2}/>
          </svg>
        </div>
        <span className="text-lg font-black uppercase tracking-tight text-white group-hover:text-red-500 transition">
          Fit<span className="text-red-500">core</span>
        </span>
      </button>

      {/* Member chip */}
      {member && (
        <div className="flex items-center gap-3 px-3 py-2.5 mb-6 rounded-xl bg-zinc-900 border border-zinc-800">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{member.name}</p>
            <p className="text-[10px] text-zinc-500 truncate">{member.email}</p>
          </div>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
            Member
          </span>
        </div>
      )}

      {/* Nav section label */}
      <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 px-3 mb-2">
        Navigation
      </p>

      {/* Nav links */}
      <nav className="flex flex-col gap-0.5 flex-1">
        {NAV_LINKS.map((l) => {
          const active = isActive(l);
          return (
            <button
              key={l.label}
              onClick={() => handleNav(l.path)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 cursor-pointer w-full text-left border
                ${active
                  ? "bg-gradient-to-r from-red-500/15 to-orange-500/10 text-red-500 border-red-500/30 shadow-md shadow-red-500/5"
                  : "text-zinc-400 border-transparent hover:text-white hover:bg-zinc-900/60"
                }`}
            >
              <span className="text-base leading-none">{l.icon}</span>
              <span>{l.label}</span>
              {active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-red-500" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="mt-4 pt-4 border-t border-zinc-800 space-y-1">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-semibold text-red-500 hover:bg-red-500/10 transition cursor-pointer"
        >
          <span className="text-base leading-none">🚪</span>
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
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-zinc-950 border-b border-zinc-800 px-4 h-14 flex items-center justify-between">
        <button onClick={() => handleNav("/MemberDashboard")} className="flex items-center gap-2 cursor-pointer">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M6.5 6.5h1v11h-1zM16.5 6.5h1v11h-1z" fill="currentColor" stroke="none"/>
              <rect x="4" y="8" width="3" height="8" rx="1" fill="currentColor" stroke="none"/>
              <rect x="17" y="8" width="3" height="8" rx="1" fill="currentColor" stroke="none"/>
              <line x1="7" y1="12" x2="17" y2="12" strokeWidth={2}/>
            </svg>
          </div>
          <span className="text-base font-black uppercase text-white">Fit<span className="text-red-500">core</span></span>
        </button>
        <div className="flex items-center gap-2">
          <button onClick={() => setMobileOpen(true)} className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-300 hover:bg-zinc-900 transition cursor-pointer">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative w-72 max-w-[85vw] h-full bg-zinc-950 border-r border-zinc-800 px-4 py-6 shadow-2xl overflow-y-auto">
            <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:bg-zinc-900 transition cursor-pointer">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
}
