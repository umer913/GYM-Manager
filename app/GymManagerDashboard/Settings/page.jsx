"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../Sidebar";
import { useAppContext } from "../../../context/AppContext";
import { apiCall } from "../../../utils/api";

export default function SettingsPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useAppContext();
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [profileForm, setProfileForm] = useState({ name: "", email: "", phone: "" });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/Login"); return; }

    (async () => {
      const { data, ok } = await apiCall("/api/auth/profile");
      if (ok) {
        setProfileForm({ name: data.user.name || "", email: data.user.email || "", phone: data.user.phone || "" });
      } else {
        setError(data.message || "Failed to load profile.");
      }
      setLoading(false);
    })();
  }, [router]);

  const clearMessages = () => { setError(""); setSuccess(""); };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); clearMessages();
    const { data, ok } = await apiCall("/api/auth/profile", { method: "PUT", body: JSON.stringify(profileForm) });
    if (ok) setSuccess(data.message || "Profile updated.");
    else setError(data.message || "Failed to update profile.");
    setSaving(false);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    clearMessages();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("New passwords do not match.");
      return;
    }
    setSaving(true);
    const { data, ok } = await apiCall("/api/auth/profile", {
      method: "PUT",
      body: JSON.stringify({ currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword }),
    });
    if (ok) {
      setSuccess(data.message || "Password changed.");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } else {
      setError(data.message || "Failed to change password.");
    }
    setSaving(false);
  };

  const handleLogout = () => {
    if (confirm("Are you sure you want to log out?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("managerTheme");
      router.push("/Login");
    }
  };

  const dateStr = new Date().toLocaleDateString("en-PK", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const tabBtn = (id, label, icon) => (
    <button
      onClick={() => { setActiveTab(id); clearMessages(); }}
      className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition flex items-center gap-2.5
        ${activeTab === id ? "bg-zinc-900 text-white border border-zinc-800" : "text-zinc-400 hover:text-white hover:bg-zinc-900/50"}`}
    >
      <span>{icon}</span> {label}
    </button>
  );

  const inputClass = "w-full bg-zinc-950 border border-zinc-800 hover:border-zinc-700 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 px-4 py-2.5 rounded-xl text-sm transition text-white placeholder-zinc-600";

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans">
      <Sidebar active="Settings" />

      <div className="lg:ml-60 flex flex-col min-h-screen">
        <header className="sticky top-0 z-20 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/60 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Settings</h1>
            <p className="text-xs text-zinc-500">{dateStr}</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center font-bold text-sm">GM</div>
        </header>

        <main className="flex-1 px-6 py-8 max-w-5xl w-full mx-auto space-y-6">
          {error && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">⚠️ {error}</div>}
          {success && <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-sm">✅ {success}</div>}

          {loading ? (
            <div className="flex flex-col justify-center items-center py-24 gap-4">
              <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-zinc-400">Loading settings...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Sub-nav */}
              <div className="md:col-span-1 flex flex-col gap-1.5">
                {tabBtn("profile",  "Profile Details",  "👤")}
                {tabBtn("security", "Login & Security", "🔒")}
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition flex items-center gap-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 mt-4 cursor-pointer"
                >
                  <span>🚪</span> Log Out
                </button>
              </div>

              {/* Content */}
              <div className="md:col-span-3">
                {activeTab === "profile" && (
                  <div className="space-y-6">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
                      <div>
                        <h2 className="text-lg font-bold">Profile Details</h2>
                        <p className="text-xs text-zinc-500 mt-1">Manage your account name and email.</p>
                      </div>
                      <form onSubmit={handleProfileSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-zinc-400">Full Name</label>
                          <input type="text" name="name" required value={profileForm.name}
                            onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                            placeholder="e.g. John Doe" className={inputClass} />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-zinc-400">Email Address</label>
                          <input type="email" name="email" required value={profileForm.email}
                            onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                            placeholder="manager@fitcore.com" className={inputClass} />
                        </div>
                        <div className="pt-3 flex justify-end">
                          <button type="submit" disabled={saving}
                            className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold rounded-xl text-sm shadow disabled:opacity-50 transition flex items-center gap-2 cursor-pointer">
                            {saving ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Saving...</> : "Save Changes"}
                          </button>
                        </div>
                      </form>
                    </div>

                    {/* Theme */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
                      <div>
                        <h2 className="text-lg font-bold">Theme Preference</h2>
                        <p className="text-xs text-zinc-500 mt-1">Choose between Light and Dark mode.</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        {[
                          { id: "dark", icon: "🌙", label: "Dark Mode" },
                          { id: "light", icon: "☀️", label: "Light Mode" },
                        ].map(t => (
                          <button key={t.id} type="button" onClick={() => theme !== t.id && toggleTheme()}
                            className={`p-4 rounded-xl border text-center transition flex flex-col items-center gap-1.5 cursor-pointer
                              ${theme === t.id ? "bg-zinc-950 border-red-500/50 text-white font-bold shadow-lg" : "bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:text-white"}`}>
                            <span className="text-2xl">{t.icon}</span>
                            <span className="text-sm">{t.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "security" && (
                  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
                    <div>
                      <h2 className="text-lg font-bold">Login & Security</h2>
                      <p className="text-xs text-zinc-500 mt-1">Update your login credentials.</p>
                    </div>
                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-400">Current Password</label>
                        <input type="password" name="currentPassword" required value={passwordForm.currentPassword}
                          onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                          placeholder="••••••••" className={inputClass} />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-zinc-400">New Password</label>
                          <input type="password" name="newPassword" required value={passwordForm.newPassword}
                            onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                            placeholder="••••••••" className={inputClass} />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-zinc-400">Confirm New Password</label>
                          <input type="password" name="confirmPassword" required value={passwordForm.confirmPassword}
                            onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                            placeholder="••••••••" className={inputClass} />
                        </div>
                      </div>
                      <div className="pt-3 flex justify-end">
                        <button type="submit" disabled={saving}
                          className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold rounded-xl text-sm shadow disabled:opacity-50 transition flex items-center gap-2 cursor-pointer">
                          {saving ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Updating...</> : "Change Password"}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>

        <footer className="border-t border-zinc-800/60 px-6 py-4 text-center text-xs text-zinc-600 mt-auto">
          © {new Date().getFullYear()} Fitcore — Gym Manager Portal
        </footer>
      </div>
    </div>
  );
}
