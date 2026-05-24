"use client";

import { useRouter } from "next/navigation";

export default function Sidebar({ active }) {
  const router = useRouter();
  const links = [
    { icon: "⊞", label: "Dashboard", path: "/GymManagerDashboard" },
    { icon: "👥", label: "Members", path: "/GymManagerDashboard/members" },
    { icon: "🏋️", label: "Trainers", path: "/GymManagerDashboard/Trainers" },
    { icon: "📅", label: "Check-ins", path: "#" },
    { icon: "💳", label: "Memberships", path: "#" },
    { icon: "💰", label: "Revenue", path: "#" },
    { icon: "⚙️", label: "Settings", path: "#" },
  ];

  const handleNavigate = (path) => {
    if (path !== "#") {
      router.push(path);
    }
  };

  return (
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
            onClick={() => handleNavigate(l.path)}
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
