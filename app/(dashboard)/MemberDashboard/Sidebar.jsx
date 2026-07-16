"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppContext } from "../../../context/AppContext";
import { useConfirm } from "../../../components/ui/UIProvider";

const NAV_LINKS = [
  {
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
    label: "Dashboard", path: "/MemberDashboard",
  },
  {
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    label: "My Workouts", path: "/MemberDashboard/Workouts",
  },
  {
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    label: "Attendance", path: "/MemberDashboard/Attendance",
  },
  {
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    label: "Trainers", path: "/MemberDashboard/Trainers",
  },
  {
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <rect x="1" y="4" width="22" height="16" rx="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
    label: "My Plan", path: "/MemberDashboard/Plans",
  },
  {
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    label: "Profile", path: "/MemberDashboard/Profile",
  },
];

// Same dumbbell SVG as the home page header
const LogoIcon = () => (
  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M6.5 6.5h1v11h-1zM16.5 6.5h1v11h-1z" fill="currentColor" stroke="none" />
    <rect x="4" y="8" width="3" height="8" rx="1" fill="currentColor" stroke="none" />
    <rect x="17" y="8" width="3" height="8" rx="1" fill="currentColor" stroke="none" />
    <line x1="7" y1="12" x2="17" y2="12" strokeWidth={2} />
  </svg>
);

export default function Sidebar({ active, member }) {
  const router   = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useAppContext();
  const confirm = useConfirm();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (link) => link.label === active || pathname === link.path;

  const handleNav = (path) => {
    router.push(path);
    setMobileOpen(false);
  };

  const handleLogout = async () => {
    const confirmed = await confirm({
      variant: "login",
      confirmText: "Log Out",
      title: "Log out?",
      message: "You will be returned to the login screen.",
    });
    if (confirmed) {
      localStorage.removeItem("token");
      localStorage.removeItem("appTheme");
      router.push("/Login");
    }
  };

  const initials = member?.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "ME";

  const SidebarContent = () => (
    <div className="flex flex-col h-full">

      {/* Logo — matches home page exactly */}
      <button
        onClick={() => handleNav("/MemberDashboard")}
        className="flex items-center gap-2.5 px-1 mb-8 cursor-pointer group"
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center shadow-lg shadow-red-500/20 group-hover:scale-110 transition-transform duration-300">
          <LogoIcon />
        </div>
        <span className="text-xl font-black uppercase tracking-tight text-white group-hover:text-red-500 transition-colors duration-200">
          Fit<span className="text-red-500">core</span>
        </span>
      </button>



      {/* Nav label */}
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 px-3 mb-2">
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
                  ? "bg-gradient-to-r from-red-500/15 to-orange-500/10 text-red-400 border-red-500/25 shadow-sm shadow-red-500/5"
                  : "text-zinc-400 border-transparent hover:text-white hover:bg-zinc-900/70"
                }`}
            >
              <span className={`transition-colors duration-150 ${active ? "text-red-400" : "text-zinc-600"}`}>
                {l.icon}
              </span>
              <span className="flex-1">{l.label}</span>
              {active && <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />}
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
        <button onClick={() => handleNav("/MemberDashboard")} className="flex items-center gap-2 cursor-pointer group">
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
    </>
  );
}
