"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../Sidebar";
import { apiCall } from "../../../utils/api";

// ── Helpers ───────────────────────────────────────────────────────────────────

function Field({ label, value }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">{label}</p>
      <p className="text-sm text-white font-medium">{value || "—"}</p>
    </div>
  );
}

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
        className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition"
      />
      {hint && <p className="text-xs text-zinc-600 mt-1">{hint}</p>}
    </div>
  );
}

function FormSelect({ label, name, value, onChange, options }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-500 transition cursor-pointer"
      >
        {options.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}

function Toast({ message, type }) {
  if (!message) return null;
  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl text-sm font-medium shadow-xl border
      ${type === "success"
        ? "bg-emerald-900/90 border-emerald-500/30 text-emerald-300"
        : "bg-red-900/90 border-red-500/30 text-red-300"}`}>
      {message}
    </div>
  );
}

function PasswordStrength({ password }) {
  const checks = [
    { label: "6+ characters",    pass: password.length >= 6 },
    { label: "Uppercase letter", pass: /[A-Z]/.test(password) },
    { label: "Number",           pass: /\d/.test(password) },
    { label: "Special character",pass: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.pass).length;
  const colors = ["bg-red-500", "bg-orange-500", "bg-amber-400", "bg-emerald-500"];
  const labels = ["Weak", "Fair", "Good", "Strong"];

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex gap-1 flex-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={`h-1.5 flex-1 rounded-full transition-all ${i < score ? colors[score - 1] : "bg-zinc-700"}`} />
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

// ── Constants ─────────────────────────────────────────────────────────────────

const SPECIALTIES = [
  "General", "Strength & Powerlifting", "Bodybuilding & Hypertrophy",
  "Cardio & Endurance", "CrossFit & Functional Fitness",
  "Yoga & Flexibility", "Weight Loss & Fat Burn",
  "Nutrition & Diet", "Sports Performance", "Rehabilitation",
];

const TIMINGS = [
  "Morning (06:00 AM – 11:00 AM)",
  "Afternoon (11:00 AM – 03:00 PM)",
  "Evening (03:00 PM – 07:00 PM)",
  "Night (07:00 PM – 10:00 PM)",
  "Full Day (06:00 AM – 08:00 PM)",
];

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function TrainerProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editSection, setEditSection] = useState(null); // 'info' | 'trainer' | 'password'
  const [toast, setToast] = useState({ message: "", type: "" });

  const [infoForm, setInfoForm]     = useState({ name: "", email: "", phone: "" });
  const [trainerForm, setTrainerForm] = useState({ specialty: "", timings: "" });
  const [passForm, setPassForm]     = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
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
        const u = data.user;
        setProfile(u);
        setInfoForm({ name: u.name, email: u.email, phone: u.phone || "" });
        setTrainerForm({ specialty: u.specialty || "General", timings: u.timings || TIMINGS[0] });
      } else {
        if (status === 401) { localStorage.removeItem("token"); router.push("/Login"); }
      }
      setLoading(false);
    })();
  }, [router]);

  const handleInfoChange    = (e) => setInfoForm({ ...infoForm, [e.target.name]: e.target.value });
  const handleTrainerChange = (e) => setTrainerForm({ ...trainerForm, [e.target.name]: e.target.value });
  const handlePassChange    = (e) => setPassForm({ ...passForm, [e.target.name]: e.target.value });

  const cancelEdit = () => {
    setEditSection(null);
    setPassErrors({});
    if (profile) {
      setInfoForm({ name: profile.name, email: profile.email, phone: profile.phone || "" });
      setTrainerForm({ specialty: profile.specialty || "General", timings: profile.timings || TIMINGS[0] });
    }
    setPassForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
  };

  // ── Save personal info ────────────────────────────────────────────────────
  const saveInfo = async () => {
    if (!infoForm.name.trim())  return showToast("Name cannot be empty.", "error");
    if (!infoForm.email.trim()) return showToast("Email cannot be empty.", "error");

    setSaving(true);
    const { data, ok } = await apiCall("/api/auth/profile", {
      method: "PUT",
      body: JSON.stringify({ name: infoForm.name, email: infoForm.email, phone: infoForm.phone }),
    });
    setSaving(false);

    if (ok && data.success) {
      setProfile((p) => ({ ...p, ...data.user }));
      setEditSection(null);
      showToast("Personal info updated.");
    } else {
      showToast(data.message || "Failed to update.", "error");
    }
  };

  // ── Save trainer settings ─────────────────────────────────────────────────
  const saveTrainerSettings = async () => {
    setSaving(true);
    const { data, ok } = await apiCall("/api/auth/profile", {
      method: "PUT",
      body: JSON.stringify({ specialty: trainerForm.specialty, timings: trainerForm.timings }),
    });
    setSaving(false);

    if (ok && data.success) {
      setProfile((p) => ({ ...p, specialty: trainerForm.specialty, timings: trainerForm.timings }));
      setEditSection(null);
      showToast("Trainer settings updated.");
    } else {
      showToast(data.message || "Failed to update.", "error");
    }
  };

  // ── Save password ─────────────────────────────────────────────────────────
  const savePassword = async () => {
    const errors = {};
    if (!passForm.currentPassword)                    errors.currentPassword  = "Required";
    if (!passForm.newPassword || passForm.newPassword.length < 6) errors.newPassword = "Min 6 characters";
    if (passForm.newPassword !== passForm.confirmPassword)  errors.confirmPassword = "Passwords do not match";

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
      showToast(data.message || "Incorrect current password.", "error");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col justify-center items-center">
        <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-zinc-400">Loading profile...</p>
      </div>
    );
  }

  const initials  = profile?.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?";
  const joinedDate = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-PK", { day: "numeric", month: "long", year: "numeric" })
    : "—";

  // Shared action buttons
  const ActionButtons = ({ onSave, saveLabel = "Save Changes", saveColor = "from-violet-600 to-indigo-600" }) => (
    <div className="flex gap-3 pt-1">
      <button
        onClick={onSave}
        disabled={saving}
        className={`px-5 py-2 rounded-xl bg-gradient-to-r ${saveColor} text-white text-sm font-semibold hover:opacity-90 transition disabled:opacity-50 cursor-pointer`}
      >
        {saving ? "Saving…" : saveLabel}
      </button>
      <button
        onClick={cancelEdit}
        className="px-5 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300 text-sm font-medium hover:text-white hover:border-zinc-600 transition cursor-pointer"
      >
        Cancel
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans">
      <Sidebar active="Profile" trainer={profile} />

      <div className="lg:ml-64 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/60 px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-violet-400 font-semibold">Trainer Portal</p>
            <h1 className="text-xl font-bold mt-1">My Profile</h1>
            <p className="text-xs text-zinc-500">Manage your account details</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center font-bold text-sm">
            {initials}
          </div>
        </header>

        <main className="flex-1 px-6 py-6 max-w-2xl w-full mx-auto space-y-5">

          {/* ── Avatar Summary ──────────────────────────────────────────── */}
          <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-6 flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center font-black text-2xl shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-black text-white">{profile?.name}</h2>
              <p className="text-sm text-zinc-400 mt-0.5">{profile?.email}</p>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="text-xs bg-violet-500/10 text-violet-300 border border-violet-500/20 px-2.5 py-0.5 rounded-full font-semibold">
                  Trainer
                </span>
                {profile?.specialty && (
                  <span className="text-xs text-zinc-400 bg-zinc-800 px-2.5 py-0.5 rounded-full border border-zinc-700">
                    {profile.specialty}
                  </span>
                )}
                <span className="text-xs text-zinc-500">Joined {joinedDate}</span>
              </div>
            </div>
          </div>

          {/* ── Personal Information ────────────────────────────────────── */}
          <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center text-base">👤</div>
                <div>
                  <h3 className="font-bold text-white text-sm">Personal Information</h3>
                  <p className="text-xs text-zinc-500">Name, email address and phone number</p>
                </div>
              </div>
              {editSection !== "info" && (
                <button
                  onClick={() => setEditSection("info")}
                  className="text-xs px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 hover:border-zinc-600 text-zinc-300 hover:text-white transition cursor-pointer font-medium"
                >
                  Edit
                </button>
              )}
            </div>

            <div className="px-5 py-5">
              {editSection !== "info" ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <Field label="Full Name"     value={profile?.name} />
                  <Field label="Email Address" value={profile?.email} />
                  <Field label="Phone Number"  value={profile?.phone} />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormInput label="Full Name" name="name" value={infoForm.name} onChange={handleInfoChange} placeholder="Your full name" />
                    <FormInput label="Phone Number" name="phone" type="tel" value={infoForm.phone} onChange={handleInfoChange} placeholder="+92 300 0000000" />
                  </div>
                  <FormInput
                    label="Email Address" name="email" type="email"
                    value={infoForm.email} onChange={handleInfoChange} placeholder="you@email.com"
                    hint="Changing your email will require you to log in again with the new address."
                  />
                  <ActionButtons onSave={saveInfo} />
                </div>
              )}
            </div>
          </div>

          {/* ── Trainer Settings ────────────────────────────────────────── */}
          <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-base">🏋️</div>
                <div>
                  <h3 className="font-bold text-white text-sm">Trainer Settings</h3>
                  <p className="text-xs text-zinc-500">Specialty and available timings</p>
                </div>
              </div>
              {editSection !== "trainer" && (
                <button
                  onClick={() => setEditSection("trainer")}
                  className="text-xs px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 hover:border-zinc-600 text-zinc-300 hover:text-white transition cursor-pointer font-medium"
                >
                  Edit
                </button>
              )}
            </div>

            <div className="px-5 py-5">
              {editSection !== "trainer" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <Field label="Specialty" value={profile?.specialty} />
                  <Field label="Timings"   value={profile?.timings} />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormSelect
                      label="Specialty" name="specialty"
                      value={trainerForm.specialty} onChange={handleTrainerChange}
                      options={SPECIALTIES}
                    />
                    <FormSelect
                      label="Available Timings" name="timings"
                      value={trainerForm.timings} onChange={handleTrainerChange}
                      options={TIMINGS}
                    />
                  </div>
                  <ActionButtons onSave={saveTrainerSettings} saveLabel="Save Settings" />
                </div>
              )}
            </div>
          </div>

          {/* ── Password ────────────────────────────────────────────────── */}
          <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between">
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
                  className="text-xs px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 hover:border-zinc-600 text-zinc-300 hover:text-white transition cursor-pointer font-medium"
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
                      <div key={i} className="w-2 h-2 rounded-full bg-zinc-600" />
                    ))}
                  </div>
                  <p className="text-xs text-zinc-500">Click Change to update your password</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <FormInput label="Current Password" name="currentPassword" type="password" value={passForm.currentPassword} onChange={handlePassChange} placeholder="Enter current password" />
                    {passErrors.currentPassword && <p className="text-xs text-red-400 mt-1">{passErrors.currentPassword}</p>}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <FormInput label="New Password" name="newPassword" type="password" value={passForm.newPassword} onChange={handlePassChange} placeholder="Min 6 characters" />
                      {passErrors.newPassword && <p className="text-xs text-red-400 mt-1">{passErrors.newPassword}</p>}
                    </div>
                    <div>
                      <FormInput label="Confirm New Password" name="confirmPassword" type="password" value={passForm.confirmPassword} onChange={handlePassChange} placeholder="Repeat new password" />
                      {passErrors.confirmPassword && <p className="text-xs text-red-400 mt-1">{passErrors.confirmPassword}</p>}
                    </div>
                  </div>
                  {passForm.newPassword && <PasswordStrength password={passForm.newPassword} />}
                  <ActionButtons onSave={savePassword} saveLabel="Update Password" saveColor="from-amber-500 to-orange-500" />
                </div>
              )}
            </div>
          </div>

          {/* ── Account Details ──────────────────────────────────────────── */}
          <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 overflow-hidden">
            <div className="px-5 py-4 border-b border-zinc-800 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-700/50 flex items-center justify-center text-base">🛡️</div>
              <div>
                <h3 className="font-bold text-white text-sm">Account Details</h3>
                <p className="text-xs text-zinc-500">Read-only account metadata</p>
              </div>
            </div>
            <div className="px-5 py-5 grid grid-cols-2 sm:grid-cols-3 gap-5">
              <Field label="Account Type" value="Trainer" />
              <Field label="Member Since"  value={joinedDate} />
              <Field label="Specialty"     value={profile?.specialty} />
            </div>
          </div>

        </main>

        <footer className="border-t border-zinc-800/60 px-6 py-4 text-center text-xs text-zinc-600 mt-auto">
          © {new Date().getFullYear()} Fitcore — Trainer Portal
        </footer>
      </div>

      <Toast message={toast.message} type={toast.type} />
    </div>
  );
}
