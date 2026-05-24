"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../Sidebar";

export default function TrainersPage() {
  const router = useRouter();
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [formType, setFormType] = useState("add"); // "add" or "edit"
  
  // Form State
  const [formData, setFormData] = useState({
    _id: "",
    name: "",
    phone: "",
    specialty: "Strength",
    timings: "Morning (06:00 AM - 11:00 AM)"
  });

  const [saving, setSaving] = useState(false);

  const fetchTrainers = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/Login");
      return;
    }
    try {
      const res = await fetch("/api/manager/trainers", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setTrainers(data.trainers || []);
      } else {
        setError(data.message || "Failed to fetch trainers");
      }
    } catch (err) {
      setError("An error occurred while fetching trainers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainers();
  }, [router]);

  const handleOpenAddModal = () => {
    setFormType("add");
    setFormData({
      _id: "",
      name: "",
      phone: "",
      specialty: "Strength",
      timings: "Morning (06:00 AM - 11:00 AM)"
    });
    setError("");
    setModalOpen(true);
  };

  const handleOpenEditModal = (trainer) => {
    setFormType("edit");
    setFormData({
      _id: trainer._id,
      name: trainer.name || "",
      phone: trainer.phone || "",
      specialty: trainer.specialty || "Strength",
      timings: trainer.timings || "Morning (06:00 AM - 11:00 AM)"
    });
    setError("");
    setModalOpen(true);
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const token = localStorage.getItem("token");

    const endpoint = "/api/manager/trainers";
    const method = formType === "add" ? "POST" : "PUT";

    try {
      const res = await fetch(endpoint, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        setModalOpen(false);
        fetchTrainers();
      } else {
        setError(data.message || "Something went wrong saving the trainer");
      }
    } catch (err) {
      setError("Server error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Are you sure you want to delete Trainer "${name}"?`)) return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/manager/trainers?id=${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        fetchTrainers();
      } else {
        alert(data.message || "Failed to delete trainer");
      }
    } catch (err) {
      alert("An error occurred while deleting the trainer.");
    }
  };

  // Search filtering
  const filteredTrainers = trainers.filter(t =>
    t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.phone?.includes(searchQuery) ||
    t.specialty?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.timings?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalTrainers = trainers.length;

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-PK", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-red-500 selection:text-white">
      <Sidebar active="Trainers" />

      {/* Main Content */}
      <div className="lg:ml-60 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="sticky top-0 z-20 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/60 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Manage Trainers</h1>
            <p className="text-xs text-zinc-500">{dateStr}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 text-xs font-bold bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 rounded-xl transition shadow-lg shadow-red-500/20"
            >
              + Add Trainer
            </button>
          </div>
        </header>

        <main className="flex-1 px-6 py-6 space-y-6">
          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-2xl p-5 bg-zinc-900/80 border border-zinc-800 shadow-xl relative overflow-hidden group col-span-1">
              <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br from-red-500 to-orange-600 opacity-10 blur-2xl" />
              <p className="text-zinc-400 text-xs font-medium uppercase tracking-widest mb-1">Total Trainers</p>
              <h2 className="text-3xl font-black text-white">{loading ? "..." : totalTrainers}</h2>
            </div>
          </div>

          {/* Search bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-zinc-900/60 border border-zinc-850 p-4 rounded-2xl">
            <div>
              <h3 className="font-bold text-white">Registered Trainers</h3>
              <p className="text-xs text-zinc-500">Edit, remove or register team members</p>
            </div>
            <div className="relative w-full sm:w-72">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-505">🔍</span>
              <input
                type="text"
                placeholder="Search trainers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-800 text-white placeholder-zinc-500 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition text-sm"
              />
            </div>
          </div>

          {/* Error Message */}
          {error && !modalOpen && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              ⚠️ {error}
            </div>
          )}

          {/* Grid Layout of Trainers */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-zinc-400 text-sm font-semibold">Loading trainers list...</span>
            </div>
          ) : filteredTrainers.length === 0 ? (
            <div className="text-center py-20 text-zinc-500 text-sm">
              No trainers registered in the system.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredTrainers.map((t) => (
                <div key={t._id} className="bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 shadow-lg rounded-2xl p-5 flex flex-col justify-between transition-all group relative overflow-hidden animate-fade-in">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-sm font-black shadow-md flex-shrink-0">
                        {t.name ? t.name.split(" ").map(n => n[0]).join("").toUpperCase() : "T"}
                      </div>
                      <div>
                        <h4 className="font-bold text-white group-hover:text-red-500 transition-colors">{t.name}</h4>
                        <span className="inline-block px-2.5 py-0.5 mt-0.5 rounded-full text-[10px] font-bold border bg-red-500/10 text-red-400 border-red-500/20">
                          {t.specialty || "General"}
                        </span>
                      </div>
                    </div>

                    <div className="border-t border-zinc-800/80 pt-3 space-y-2.5 text-xs text-zinc-400">
                      <p className="flex items-center gap-2">📞 Phone: <span className="text-zinc-300">{t.phone || "—"}</span></p>
                      <p className="flex items-center gap-2">🕒 Timings: <span className="text-zinc-300 font-semibold">{t.timings || "—"}</span></p>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-5 border-t border-zinc-800/80 pt-3">
                    <button
                      onClick={() => handleOpenEditModal(t)}
                      className="flex-1 py-2 text-xs bg-zinc-800 hover:bg-zinc-700 font-bold rounded-lg border border-zinc-750 text-white transition-colors"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(t._id, t.name)}
                      className="py-2 px-3 text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 rounded-lg transition-colors font-bold"
                    >
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

      {/* Modal Add / Edit Form */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 space-y-6 text-white max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-center pb-3 border-b border-zinc-800">
              <h3 className="text-lg font-black uppercase tracking-wider">
                {formType === "add" ? "Add New Trainer" : "Edit Trainer Details"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition"
              >
                ✕
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleFormChange}
                  placeholder="e.g. Coach Raza"
                  className="w-full px-4 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleFormChange}
                  placeholder="03XXXXXXXXX"
                  className="w-full px-4 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Working Timings</label>
                <select
                  name="timings"
                  value={formData.timings}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                >
                  <option value="Morning (06:00 AM - 11:00 AM)">Morning (06:00 AM - 11:00 AM)</option>
                  <option value="Mid-Day (11:00 AM - 04:00 PM)">Mid-Day (11:00 AM - 04:00 PM)</option>
                  <option value="Evening (04:00 PM - 09:00 PM)">Evening (04:00 PM - 09:00 PM)</option>
                  <option value="Night (09:00 PM - 02:00 AM)">Night (09:00 PM - 02:00 AM)</option>
                  <option value="Full Day (09:00 AM - 05:00 PM)">Full Day (09:00 AM - 05:00 PM)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Specialty</label>
                <select
                  name="specialty"
                  value={formData.specialty}
                  onChange={handleFormChange}
                  className="w-full px-3 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                >
                  <option value="Strength">Strength</option>
                  <option value="Cardio">Cardio</option>
                  <option value="CrossFit">CrossFit</option>
                  <option value="Yoga">Yoga</option>
                  <option value="Pilates">Pilates</option>
                  <option value="Nutrition">Nutrition</option>
                </select>
              </div>

              <div className="pt-4 flex gap-2 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-750 font-bold rounded-xl transition text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 font-bold rounded-xl transition text-sm shadow-md disabled:opacity-50"
                >
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
