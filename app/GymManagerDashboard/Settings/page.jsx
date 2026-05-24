"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../Sidebar";
import { useAppContext } from "../../../context/AppContext";

export default function SettingsPage() {
  const router = useRouter();
  const { theme, toggleTheme } = useAppContext();
  const [activeTab, setActiveTab] = useState("profile"); // "profile", "security"
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const fetchProfile = async () => {
    setLoading(true);
    setError("");
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("/api/auth/profile", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setProfile(data.user);
        setProfileForm({
          name: data.user.name || "",
          email: data.user.email || "",
          phone: data.user.phone || "",
        });
      } else {
        setError(data.message || "Failed to load profile settings.");
      }
    } catch (err) {
      setError("An error occurred while loading profile settings.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/Login");
      return;
    }
    fetchProfile();
  }, [router]);

  const handleProfileChange = (e) => {
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(profileForm)
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(data.message || "Profile details updated successfully.");
        setProfile(data.user);
      } else {
        setError(data.message || "Failed to update profile.");
      }
    } catch (err) {
      setError("An error occurred during update.");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setSaving(true);
    const token = localStorage.getItem("token");
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(data.message || "Password changed successfully.");
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        setError(data.message || "Failed to change password.");
      }
    } catch (err) {
      setError("An error occurred while changing password.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    if (confirm("Are you sure you want to log out?")) {
      localStorage.removeItem("token");
      router.push("/Login");
    }
  };

  const dateStr = new Date().toLocaleDateString("en-PK", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans">
      <Sidebar active="Settings" />

      {/* Main content */}
      <div className="lg:ml-60 flex flex-col min-h-screen">
        
        {/* Topbar */}
        <header className="sticky top-0 z-20 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/60 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Settings</h1>
            <p className="text-xs text-zinc-500">{dateStr}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center font-bold text-sm">GM</div>
          </div>
        </header>

        <main className="flex-1 px-6 py-8 max-w-5xl w-full mx-auto space-y-6">
          
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm flex items-center gap-2 animate-fadeIn">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-sm flex items-center gap-2 animate-fadeIn">
              <span>✅</span>
              <span>{success}</span>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col justify-center items-center py-24 space-y-4">
              <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-zinc-400">Loading settings...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              
              {/* Settings Sub-Sidebar Navigation */}
              <div className="md:col-span-1 flex flex-col gap-1.5">
                <button
                  onClick={() => { setActiveTab("profile"); setError(""); setSuccess(""); }}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2.5
                    ${activeTab === "profile"
                      ? "bg-zinc-900 text-white border border-zinc-800"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900/50"}`}
                >
                  <span>👤</span> Profile Details
                </button>
                <button
                  onClick={() => { setActiveTab("security"); setError(""); setSuccess(""); }}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2.5
                    ${activeTab === "security"
                      ? "bg-zinc-900 text-white border border-zinc-800"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900/50"}`}
                >
                  <span>🔒</span> Login & Security
                </button>
                
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 mt-4 cursor-pointer"
                >
                  <span>🚪</span> Log Out
                </button>
              </div>

              {/* Main settings form area */}
              <div className="md:col-span-3">
                
                {activeTab === "profile" && (
                  <div className="space-y-6">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6">
                      <div>
                        <h2 className="text-lg font-bold text-white">Profile Details</h2>
                        <p className="text-xs text-zinc-500 mt-1">Manage your manager account name and email address.</p>
                      </div>

                      <form onSubmit={handleProfileSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-zinc-400">Full Name</label>
                          <input
                            type="text"
                            name="name"
                            required
                            value={profileForm.name}
                            onChange={handleProfileChange}
                            placeholder="e.g. John Doe"
                            className="w-full bg-zinc-950 border border-zinc-800 hover:border-zinc-700 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 px-4 py-2.5 rounded-xl text-sm transition-all text-white placeholder-zinc-600"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-zinc-400">Email Address</label>
                          <input
                            type="email"
                            name="email"
                            required
                            value={profileForm.email}
                            onChange={handleProfileChange}
                            placeholder="e.g. manager@fitcore.com"
                            className="w-full bg-zinc-950 border border-zinc-800 hover:border-zinc-700 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 px-4 py-2.5 rounded-xl text-sm transition-all text-white placeholder-zinc-600"
                          />
                        </div>

                        <div className="pt-3 flex justify-end">
                          <button
                            type="submit"
                            disabled={saving}
                            className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold rounded-xl text-sm shadow-md hover:shadow-lg disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer"
                          >
                            {saving ? (
                              <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Saving...
                              </>
                            ) : (
                              "Save Changes"
                            )}
                          </button>
                        </div>
                      </form>
                    </div>

                    {/* Theme Preference Selection */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
                      <div>
                        <h2 className="text-lg font-bold text-white">Theme Preference</h2>
                        <p className="text-xs text-zinc-500 mt-1">Customize your display appearance. Choose between Light and Dark mode.</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => { if (theme !== "dark") toggleTheme(); }}
                          className={`p-4 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer
                            ${theme === "dark"
                              ? "bg-zinc-950 border-red-500/50 text-white shadow-lg font-bold"
                              : "bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:text-white"}`}
                        >
                          <span className="text-2xl">🌙</span>
                          <span className="text-sm">Dark Mode</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => { if (theme !== "light") toggleTheme(); }}
                          className={`p-4 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer
                            ${theme === "light"
                              ? "bg-white border-red-500/50 text-zinc-900 shadow-md font-bold"
                              : "bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:text-white"}`}
                        >
                          <span className="text-2xl">☀️</span>
                          <span className="text-sm">Light Mode</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "security" && (
                  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6">
                    <div>
                      <h2 className="text-lg font-bold text-white">Login & Security</h2>
                      <p className="text-xs text-zinc-500 mt-1">Update your login credentials below. We recommend using a strong password.</p>
                    </div>

                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-400">Current Password</label>
                        <input
                          type="password"
                          name="currentPassword"
                          required
                          value={passwordForm.currentPassword}
                          onChange={handlePasswordChange}
                          placeholder="••••••••"
                          className="w-full bg-zinc-950 border border-zinc-800 hover:border-zinc-700 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 px-4 py-2.5 rounded-xl text-sm transition-all text-white placeholder-zinc-750"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-zinc-400">New Password</label>
                          <input
                            type="password"
                            name="newPassword"
                            required
                            value={passwordForm.newPassword}
                            onChange={handlePasswordChange}
                            placeholder="••••••••"
                            className="w-full bg-zinc-950 border border-zinc-800 hover:border-zinc-700 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 px-4 py-2.5 rounded-xl text-sm transition-all text-white placeholder-zinc-750"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-zinc-400">Confirm New Password</label>
                          <input
                            type="password"
                            name="confirmPassword"
                            required
                            value={passwordForm.confirmPassword}
                            onChange={handlePasswordChange}
                            placeholder="••••••••"
                            className="w-full bg-zinc-950 border border-zinc-800 hover:border-zinc-700 focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 px-4 py-2.5 rounded-xl text-sm transition-all text-white placeholder-zinc-750"
                          />
                        </div>
                      </div>

                      <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 text-xs text-zinc-400 space-y-1">
                        <p className="font-bold text-zinc-300">💡 Password security tips:</p>
                        <ul className="list-disc pl-4 space-y-0.5">
                          <li>Use at least 8 characters.</li>
                          <li>Include both uppercase and lowercase letters.</li>
                          <li>Add numbers and special characters.</li>
                        </ul>
                      </div>

                      <div className="pt-3 flex justify-end">
                        <button
                          type="submit"
                          disabled={saving}
                          className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold rounded-xl text-sm shadow-md hover:shadow-lg disabled:opacity-50 transition-all flex items-center gap-2 cursor-pointer"
                        >
                          {saving ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              Updating Password...
                            </>
                          ) : (
                            "Change Password"
                          )}
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
