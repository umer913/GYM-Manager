"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../Sidebar";
import { apiCall } from "../../../utils/api";

const SPECIALTIES = ["Bodybuilding", "Cardio", "CrossFit", "Yoga", "Powerlifting", "Weight Loss"];
const TIMINGS = [
  "Morning (06:00 AM - 11:00 AM)",
  "Mid-Day (11:00 AM - 04:00 PM)",
  "Evening (04:00 PM - 09:00 PM)",
  "Night (09:00 PM - 02:00 AM)",
  "Full Day (09:00 AM - 05:00 PM)",
];

const EMPTY_FORM = { _id: "", name: "", email: "", password: "", phone: "", specialty: "Strength", timings: TIMINGS[0] };

export default function TrainersPage() {
  const router = useRouter();
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [formType, setFormType] = useState("add");
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const fetchTrainers = async () => {
    const { data, ok } = await apiCall("/api/manager/trainers");
    if (ok) setTrainers(data.trainers || []);
    else setError(data.message || "Failed to fetch trainers");
    setLoading(false);
  };

  useEffect(() => {
    if (!localStorage.getItem("token")) { router.push("/Login"); return; }
    fetchTrainers();
  }, [router]);

  const openModal = (trainer = null) => {
    setFormType(trainer ? "edit" : "add");
    setFormData(trainer
      ? { _id: trainer._id, name: trainer.name || "", email: trainer.email || "", password: "", phone: trainer.phone || "", specialty: trainer.specialty || "Strength", timings: trainer.timings || TIMINGS[0] }
      : EMPTY_FORM
    );
    setError("");
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true); setError("");
    const { data, ok } = await apiCall("/api/manager/trainers", {
      method: formType === "add" ? "POST" : "PUT",
      body: JSON.stringify(formData),
    });
    if (ok) { setModalOpen(false); fetchTrainers(); }
    else setError(data.message || "Failed to save trainer");
    setSaving(false);
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete trainer "${name}"?`)) return;
    const { data, ok } = await apiCall(`/api/manager/trainers?id=${id}`, { method: "DELETE" });
    if (ok) fetchTrainers();
    else alert(data.message || "Failed to delete trainer");
  };

  const filtered = trainers.filter(t =>
    [t.name, t.phone, t.specialty, t.timings].some(v => v?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const dateStr = new Date().toLocaleDateString("en-PK", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const inputClass = "w-full px-4 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm";

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans">
      <Sidebar active="Trainers" />

      <div className="lg:ml-60 flex flex-col min-h-screen">
        <header className="sticky top-0 z-20 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/60 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Manage Trainers</h1>
            <p className="text-xs text-zinc-500">{dateStr}</p>
          </div>
          <button onClick={() => openModal()}
            className="px-4 py-2 text-xs font-bold bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 rounded-xl transition shadow-lg cursor-pointer">
            + Add Trainer
          </button>
        </header>

        <main className="flex-1 px-6 py-6 space-y-6">
          {/* Stats */}
          <div className="rounded-2xl p-5 bg-zinc-900/80 border border-zinc-800 shadow-xl relative overflow-hidden w-fit min-w-[160px]">
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br from-red-500 to-orange-600 opacity-10 blur-2xl" />
            <p className="text-zinc-400 text-xs font-medium uppercase tracking-widest mb-1">Total Trainers</p>
            <h2 className="text-3xl font-black">{loading ? "..." : trainers.length}</h2>
          </div>

          {/* Search */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-zinc-900/60 border border-zinc-800 p-4 rounded-2xl">
            <div>
              <h3 className="font-bold">Registered Trainers</h3>
              <p className="text-xs text-zinc-500">Edit, remove or register team members</p>
            </div>
            <div className="relative w-full sm:w-72">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">🔍</span>
              <input type="text" placeholder="Search trainers..." value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-800 text-white placeholder-zinc-500 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm" />
            </div>
          </div>

          {error && !modalOpen && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">⚠️ {error}</div>
          )}

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-zinc-400 text-sm">Loading trainers...</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-zinc-500 text-sm">No trainers found.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filtered.map(t => (
                <div key={t._id} className="bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-5 flex flex-col justify-between transition group">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-sm font-black shadow-md flex-shrink-0">
                        {t.name?.split(" ").map(n => n[0]).join("").toUpperCase() || "T"}
                      </div>
                      <div>
                        <h4 className="font-bold group-hover:text-red-500 transition">{t.name}</h4>
                        <span className="inline-block px-2.5 py-0.5 mt-0.5 rounded-full text-[10px] font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                          {t.specialty || "General"}
                        </span>
                      </div>
                    </div>
                    <div className="border-t border-zinc-800/80 pt-3 space-y-2 text-xs text-zinc-400">
                      <p>📞 Phone: <span className="text-zinc-300">{t.phone || "—"}</span></p>
                      <p>🕒 Timings: <span className="text-zinc-300 font-semibold">{t.timings || "—"}</span></p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-5 border-t border-zinc-800/80 pt-3">
                    <button onClick={() => openModal(t)}
                      className="flex-1 py-2 text-xs bg-zinc-800 hover:bg-zinc-700 font-bold rounded-lg border border-zinc-700 text-white transition">
                      ✏️ Edit
                    </button>
                    <button onClick={() => handleDelete(t._id, t.name)}
                      className="py-2 px-3 text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg transition font-bold">
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        <footer className="border-t border-zinc-800/60 px-6 py-4 text-center text-xs text-zinc-600">
          © {new Date().getFullYear()} Fitcore — Gym Manager Portal
        </footer>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 space-y-6 text-white max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-zinc-800">
              <h3 className="text-lg font-black uppercase tracking-wider">
                {formType === "add" ? "Add New Trainer" : "Edit Trainer"}
              </h3>
              <button onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition">
                ✕
              </button>
            </div>

            {error && <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">⚠️ {error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Full Name</label>
                <input type="text" name="name" required value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Coach Raza" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Email Address</label>
                <input type="email" name="email" required value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="coach@example.com" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Password</label>
                <input type="password" name="password" required={formType === "add"} value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  placeholder={formType === "add" ? "Set account password" : "Leave blank to keep current password"} className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Phone Number</label>
                <input type="text" name="phone" required value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="03XXXXXXXXX" className={inputClass} />
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Working Timings</label>
                <select name="timings" value={formData.timings}
                  onChange={e => setFormData({ ...formData, timings: e.target.value })} className={inputClass}>
                  {TIMINGS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Specialty</label>
                <select name="specialty" value={formData.specialty}
                  onChange={e => setFormData({ ...formData, specialty: e.target.value })} className={inputClass}>
                  {SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="pt-4 flex gap-2 border-t border-zinc-800">
                <button type="button" onClick={() => setModalOpen(false)}
                  className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 font-bold rounded-xl transition text-sm">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 font-bold rounded-xl transition text-sm disabled:opacity-50">
                  {saving ? "Saving..." : "Save Trainer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
