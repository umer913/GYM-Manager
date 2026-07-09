"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppContext } from "../../context/AppContext";

const NAV_LINKS = [
  { icon: "⊞", label: "Dashboard",        path: "/TrainerDashboard" },
  { icon: "👥", label: "Assigned Members", path: "/TrainerDashboard/AssignedMembers" },
  { icon: "📊", label: "Attendance",       path: "/TrainerDashboard/Attendance" },
  { icon: "👤", label: "Profile",          path: "/TrainerDashboard/Profile" },
];

export default function Sidebar({ active, trainer }) {
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

  const initials = trainer?.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "TR";

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <button
        onClick={() => handleNav("/TrainerDashboard")}
        className="flex items-center gap-2.5 px-2 mb-8 cursor-pointer group"
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M6.5 6.5h1v11h-1zM16.5 6.5h1v11h-1z" fill="currentColor" stroke="none"/>
            <rect x="4" y="8" width="3" height="8" rx="1" fill="currentColor" stroke="none"/>
            <rect x="17" y="8" width="3" height="8" rx="1" fill="currentColor" stroke="none"/>
            <line x1="7" y1="12" x2="17" y2="12" strokeWidth={2}/>
          </svg>
        </div>
        <span className="text-lg font-black uppercase tracking-tight text-gray-900 dark:text-white group-hover:text-violet-500 transition">
          Fit<span className="text-violet-500">core</span>
        </span>
      </button>

      {/* Trainer chip */}
      {trainer && (
        <div className="flex items-center gap-3 px-3 py-2.5 mb-6 rounded-xl bg-gray-100 dark:bg-zinc-800/80 border border-gray-200 dark:border-zinc-700">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{trainer.name}</p>
            <p className="text-[10px] text-gray-500 dark:text-zinc-500 truncate">{trainer.specialty}</p>
          </div>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20 shrink-0">
            Trainer
          </span>
        </div>
      )}

      {/* Nav section label */}
      <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-zinc-600 px-3 mb-2">
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
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 cursor-pointer w-full text-left
                ${active
                  ? "bg-gradient-to-r from-violet-500/15 to-indigo-500/10 text-violet-700 dark:text-violet-300 border border-violet-500/25 shadow-sm"
                  : "text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800/70"
                }`}
            >
              <span className="text-base leading-none">{l.icon}</span>
              <span>{l.label}</span>
              {active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-500" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom actions */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-zinc-800 space-y-1">
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800/70 transition cursor-pointer"
        >
          <span className="text-base leading-none">{theme === "dark" ? "☀️" : "🌙"}</span>
          <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-xl text-sm font-medium text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition cursor-pointer"
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
      <aside className="hidden lg:flex flex-col w-64 min-h-screen bg-white dark:bg-zinc-950 border-r border-gray-200 dark:border-zinc-800/70 px-4 py-6 fixed top-0 left-0 z-30 shadow-sm">
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white dark:bg-zinc-950 border-b border-gray-200 dark:border-zinc-800 px-4 h-14 flex items-center justify-between shadow-sm">
        <button onClick={() => handleNav("/TrainerDashboard")} className="flex items-center gap-2 cursor-pointer">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M6.5 6.5h1v11h-1zM16.5 6.5h1v11h-1z" fill="currentColor" stroke="none"/>
              <rect x="4" y="8" width="3" height="8" rx="1" fill="currentColor" stroke="none"/>
              <rect x="17" y="8" width="3" height="8" rx="1" fill="currentColor" stroke="none"/>
              <line x1="7" y1="12" x2="17" y2="12" strokeWidth={2}/>
            </svg>
          </div>
          <span className="text-base font-black uppercase text-gray-900 dark:text-white">Fit<span className="text-violet-500">core</span></span>
        </button>
        <div className="flex items-center gap-2">
          <button onClick={toggleTheme} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 transition cursor-pointer text-base">
            {theme === "dark" ? "☀️" : "🌙"}
          </button>
          <button onClick={() => setMobileOpen(true)} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition cursor-pointer">
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
          <div className="relative w-72 max-w-[85vw] h-full bg-white dark:bg-zinc-950 border-r border-gray-200 dark:border-zinc-800 px-4 py-6 shadow-2xl overflow-y-auto">
            <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-800 transition cursor-pointer">
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
