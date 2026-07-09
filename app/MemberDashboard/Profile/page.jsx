"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../Sidebar";
import { apiCall } from "../../../utils/api";

// ── Reusable field row ────────────────────────────────────────────────────────
function Field({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">{label}</p>
      <p className="text-sm text-white font-medium">{value || "—"}</p>
    </div>
  );
}

// ── Inline input ──────────────────────────────────────────────────────────────
function FormInput({ label, name, type = "text", value, onChange, placeholder, hint }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-zinc-950/50 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-red-500 transition"
      />
      {hint && <p className="text-xs text-zinc-600 mt-1">{hint}</p>}
    </div>
  );
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ message, type }) {
  if (!message) return null;
  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl text-sm font-medium shadow-xl border transition-all
      ${type === "success"
        ? "bg-emerald-900/90 border-emerald-500/30 text-emerald-300"
        : "bg-red-900/90 border-red-500/30 text-red-300"}`}>
      {message}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "" });

  // Section edit states
  const [editSection, setEditSection] = useState(null); // 'info' | 'password'

  // Forms
  const [infoForm, setInfoForm] = useState({ name: "", email: "", phone: "" });
  const [passForm, setPassForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [passErrors, setPassErrors] = useState({});

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "" }), 3500);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/Login"); return; }

    (async () => {
      const { data, ok, status } = await apiCall("/api/auth/profile");
      if (ok && data.success) {
        setProfile(data.user);
        setInfoForm({ name: data.user.name, email: data.user.email, phone: data.user.phone || "" });
      } else {
        if (status === 401) { localStorage.removeItem("token"); router.push("/Login"); }
      }
      setLoading(false);
    })();
  }, [router]);

  const handleInfoChange = (e) => setInfoForm({ ...infoForm, [e.target.name]: e.target.value });
  const handlePassChange = (e) => setPassForm({ ...passForm, [e.target.name]: e.target.value });

  // Save personal info
  const saveInfo = async () => {
    if (!infoForm.name.trim()) return showToast("Name cannot be empty.", "error");
    if (!infoForm.email.trim()) return showToast("Email cannot be empty.", "error");

    setSaving(true);
    const { data, ok } = await apiCall("/api/auth/profile", {
      method: "PUT",
      body: JSON.stringify({ name: infoForm.name, email: infoForm.email, phone: infoForm.phone }),
    });
    setSaving(false);

    if (ok && data.success) {
      setProfile((prev) => ({ ...prev, ...data.user }));
      setEditSection(null);
      showToast("Profile updated successfully.");
    } else {
      showToast(data.message || "Failed to update profile.", "error");
    }
  };

  // Save password
  const savePassword = async () => {
    const errors = {};
    if (!passForm.currentPassword) errors.currentPassword = "Required";
    if (!passForm.newPassword || passForm.newPassword.length < 6) errors.newPassword = "Min 6 characters";
    if (passForm.newPassword !== passForm.confirmPassword) errors.confirmPassword = "Passwords do not match";

    if (Object.keys(errors).length) { setPassErrors(errors); return; }
    setPassErrors({});

    setSaving(true);
    const { data, ok } = await apiCall("/api/auth/profile", {
      method: "PUT",
      body: JSON.stringify({ currentPassword: passForm.currentPassword, newPassword: passForm.newPassword }),
    });
    setSaving(false);

    if (ok && data.success) {
      setPassForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setEditSection(null);
      showToast("Password changed successfully.");
    } else {
      showToast(data.message || "Failed to change password.", "error");
    }
  };

  const cancelEdit = () => {
    setEditSection(null);
    setPassErrors({});
    if (profile) setInfoForm({ name: profile.name, email: profile.email, phone: profile.phone || "" });
    setPassForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col justify-center items-center">
        <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-zinc-400">Loading profile...</p>
      </div>
    );
  }

  const initials = profile?.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?";
  const joinedDate = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "long", year: "numeric" })
    : "—";

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-zinc-900 text-neutral-100 font-sans selection:bg-red-500 selection:text-white">
      <Sidebar active="Profile" member={profile} />

      <div className="lg:ml-60 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-900 px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-red-400/80 font-semibold">Member Portal</p>
            <h1 className="text-xl font-bold mt-1 text-white">My Profile</h1>
            <p className="text-xs text-zinc-500">Manage your account details</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center font-bold text-sm text-white shadow-lg shadow-red-500/20">
            {initials}
          </div>
        </header>

        <main className="flex-1 px-6 py-6 max-w-2xl w-full mx-auto space-y-5">

          {/* Avatar + Summary Card */}
          <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800/80 p-6 flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center font-black text-2xl shrink-0 shadow-lg shadow-red-500/10">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-black text-white">{profile?.name}</h2>
              <p className="text-sm text-zinc-400 mt-0.5">{profile?.email}</p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-full font-semibold">
                  Member
                </span>
                <span className="text-xs text-zinc-500">Joined {joinedDate}</span>
              </div>
            </div>
          </div>

          {/* ── Personal Information Card ─────────────────────────────── */}
          <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800/80 overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-850 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center text-base">👤</div>
                <div>
                  <h3 className="font-bold text-white text-sm">Personal Information</h3>
                  <p className="text-xs text-zinc-500">Name, email address and phone number</p>
                </div>
              </div>
              {editSection !== "info" && (
                <button
                  onClick={() => setEditSection("info")}
                  className="text-xs px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-850 hover:border-zinc-700 text-zinc-300 hover:text-white transition cursor-pointer font-semibold"
                >
                  Edit
                </button>
              )}
            </div>

            <div className="px-5 py-5">
              {editSection !== "info" ? (
                // Read-only view
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <Field label="Full Name" value={profile?.name} />
                  <Field label="Email Address" value={profile?.email} />
                  <Field label="Phone Number" value={profile?.phone} />
                </div>
              ) : (
                // Edit form
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormInput
                      label="Full Name"
                      name="name"
                      value={infoForm.name}
                      onChange={handleInfoChange}
                      placeholder="Your full name"
                    />
                    <FormInput
                      label="Phone Number"
                      name="phone"
                      type="tel"
                      value={infoForm.phone}
                      onChange={handleInfoChange}
                      placeholder="+92 300 0000000"
                    />
                  </div>
                  <FormInput
                    label="Email Address"
                    name="email"
                    type="email"
                    value={infoForm.email}
                    onChange={handleInfoChange}
                    placeholder="you@email.com"
                    hint="Changing your email will require you to log in again with the new address."
                  />
                  <div className="flex gap-3 pt-1">
                    <button
                      onClick={saveInfo}
                      disabled={saving}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-orange-500 text-white text-sm font-bold hover:opacity-90 shadow-lg shadow-red-500/20 transition disabled:opacity-50 cursor-pointer"
                    >
                      {saving ? "Saving…" : "Save Changes"}
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="px-5 py-2 rounded-xl bg-zinc-950 border border-zinc-850 text-zinc-400 text-sm font-semibold hover:text-white hover:border-zinc-700 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Password Card ─────────────────────────────────────────── */}
          <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800/80 overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-850 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-base">🔐</div>
                <div>
                  <h3 className="font-bold text-white text-sm">Password</h3>
                  <p className="text-xs text-zinc-500">Change your account password</p>
                </div>
              </div>
              {editSection !== "password" && (
                <button
                  onClick={() => setEditSection("password")}
                  className="text-xs px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-850 hover:border-zinc-700 text-zinc-300 hover:text-white transition cursor-pointer font-semibold"
                >
                  Change
                </button>
              )}
            </div>

            <div className="px-5 py-5">
              {editSection !== "password" ? (
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="w-2 h-2 rounded-full bg-zinc-650" />
                    ))}
                  </div>
                  <p className="text-xs text-zinc-500">Last updated — click Change to update</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <FormInput
                      label="Current Password"
                      name="currentPassword"
                      type="password"
                      value={passForm.currentPassword}
                      onChange={handlePassChange}
                      placeholder="Enter current password"
                    />
                    {passErrors.currentPassword && (
                      <p className="text-xs text-red-400 mt-1">{passErrors.currentPassword}</p>
                    )}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <FormInput
                        label="New Password"
                        name="newPassword"
                        type="password"
                        value={passForm.newPassword}
                        onChange={handlePassChange}
                        placeholder="Min 6 characters"
                      />
                      {passErrors.newPassword && (
                        <p className="text-xs text-red-400 mt-1">{passErrors.newPassword}</p>
                      )}
                    </div>
                    <div>
                      <FormInput
                        label="Confirm New Password"
                        name="confirmPassword"
                        type="password"
                        value={passForm.confirmPassword}
                        onChange={handlePassChange}
                        placeholder="Repeat new password"
                      />
                      {passErrors.confirmPassword && (
                        <p className="text-xs text-red-400 mt-1">{passErrors.confirmPassword}</p>
                      )}
                    </div>
                  </div>

                  {/* Password strength indicator */}
                  {passForm.newPassword && (
                    <PasswordStrength password={passForm.newPassword} />
                  )}

                  <div className="flex gap-3 pt-1">
                    <button
                      onClick={savePassword}
                      disabled={saving}
                      className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-orange-500 text-white text-sm font-bold hover:opacity-90 shadow-lg shadow-red-500/20 transition disabled:opacity-50 cursor-pointer"
                    >
                      {saving ? "Saving…" : "Update Password"}
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="px-5 py-2 rounded-xl bg-zinc-950 border border-zinc-850 text-zinc-400 text-sm font-semibold hover:text-white hover:border-zinc-700 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Account Info Card ──────────────────────────────────────── */}
          <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800/80 overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-850 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center text-base">🛡️</div>
              <div>
                <h3 className="font-bold text-white text-sm">Account Details</h3>
                <p className="text-xs text-zinc-500">Read-only account metadata</p>
              </div>
            </div>
            <div className="px-5 py-5 grid grid-cols-2 sm:grid-cols-3 gap-5">
              <Field label="Account Type" value="Member" />
              <Field label="Member Since" value={joinedDate} />
              <Field
                label="Membership"
                value={profile?.membershipStatus
                  ? profile.membershipStatus.charAt(0).toUpperCase() + profile.membershipStatus.slice(1)
                  : "—"}
              />
            </div>
          </div>

        </main>

        <footer className="border-t border-zinc-900 px-6 py-4 text-center text-xs text-zinc-600 mt-auto">
          © {new Date().getFullYear()} Fitcore — Member Portal
        </footer>
      </div>

      <Toast message={toast.message} type={toast.type} />
    </div>
  );
}

// ── Password strength meter ───────────────────────────────────────────────────
function PasswordStrength({ password }) {
  const checks = [
    { label: "6+ characters", pass: password.length >= 6 },
    { label: "Uppercase letter", pass: /[A-Z]/.test(password) },
    { label: "Number", pass: /\d/.test(password) },
    { label: "Special character", pass: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.pass).length;
  const colors = ["bg-red-500", "bg-orange-500", "bg-amber-400", "bg-emerald-500"];
  const labels = ["Weak", "Fair", "Good", "Strong"];

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex gap-1 flex-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all ${i < score ? colors[score - 1] : "bg-zinc-700"}`}
            />
          ))}
        </div>
        <span className={`text-xs font-semibold ${score >= 3 ? "text-emerald-400" : score === 2 ? "text-amber-400" : "text-red-400"}`}>
          {labels[score - 1] || "Too short"}
        </span>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {checks.map((c) => (
          <span key={c.label} className={`text-xs flex items-center gap-1 ${c.pass ? "text-emerald-400" : "text-zinc-600"}`}>
            {c.pass ? "✓" : "○"} {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}
