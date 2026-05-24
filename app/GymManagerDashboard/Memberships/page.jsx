"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../Sidebar";

export default function MembershipsPage() {
  const router = useRouter();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [formType, setFormType] = useState("add"); // "add" or "edit"

  // Form State
  const [formData, setFormData] = useState({
    _id: "",
    name: "",
    price: "",
    duration: "1 Month",
    allowsTrainer: false,
    features: ""
  });

  const [saving, setSaving] = useState(false);

  const fetchPlans = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/Login");
      return;
    }
    try {
      const res = await fetch("/api/manager/plans", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setPlans(data.plans || []);
      } else {
        setError(data.message || "Failed to fetch plans");
      }
    } catch (err) {
      setError("An error occurred while fetching membership plans.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, [router]);

  const handleOpenAddModal = () => {
    setFormType("add");
    setFormData({
      _id: "",
      name: "",
      price: "",
      duration: "1 Month",
      allowsTrainer: false,
      features: ""
    });
    setError("");
    setModalOpen(true);
  };

  const handleOpenEditModal = (plan) => {
    setFormType("edit");
    setFormData({
      _id: plan._id,
      name: plan.name || "",
      price: plan.price || "",
      duration: plan.duration || "1 Month",
      allowsTrainer: !!plan.allowsTrainer,
      features: plan.features ? plan.features.join(", ") : ""
    });
    setError("");
    setModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const token = localStorage.getItem("token");

    const endpoint = "/api/manager/plans";
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
        fetchPlans();
      } else {
        setError(data.message || "Something went wrong saving the plan");
      }
    } catch (err) {
      setError("Server error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Are you sure you want to delete Subscription Plan "${name}"?`)) return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/manager/plans?id=${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        fetchPlans();
      } else {
        alert(data.message || "Failed to delete plan");
      }
    } catch (err) {
      alert("An error occurred while deleting the plan.");
    }
  };

  const dateStr = new Date().toLocaleDateString("en-PK", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-red-500 selection:text-white">
      <Sidebar active="Memberships" />

      {/* Main Content */}
      <div className="lg:ml-60 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="sticky top-0 z-20 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/60 px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Membership Subscriptions</h1>
            <p className="text-xs text-zinc-500">{dateStr}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 text-xs font-bold bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 rounded-xl transition shadow-lg shadow-red-500/20"
            >
              + Create Plan
            </button>
          </div>
        </header>

        <main className="flex-1 px-6 py-6 space-y-6">
          {/* Header Info */}
          <div className="bg-zinc-900/60 border border-zinc-850 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="font-bold text-white text-lg">Subscription Plans</h3>
              <p className="text-xs text-zinc-500">Configure member plans, durations, pricing and features</p>
            </div>
            <div className="text-xs px-3 py-1 bg-red-600/20 border border-red-500/30 text-red-400 font-semibold rounded-full">
              {plans.length} Active Plans
            </div>
          </div>

          {/* Error alert */}
          {error && !modalOpen && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
              ⚠️ {error}
            </div>
          )}

          {/* Grid Layout of Plans */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-10 h-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-zinc-400 text-sm font-semibold">Loading membership plans...</span>
            </div>
          ) : plans.length === 0 ? (
            <div className="text-center py-20 text-zinc-500 text-sm">
              No subscription plans configured. Click "+ Create Plan" to add one.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {plans.map((p) => (
                <div
                  key={p._id}
                  className={`bg-zinc-900/80 border ${
                    p.allowsTrainer ? "border-red-900/50 hover:border-red-700/60" : "border-zinc-800 hover:border-zinc-700"
                  } shadow-xl rounded-2xl p-6 flex flex-col justify-between transition-all group relative overflow-hidden`}
                >
                  {/* Decorative glow for premium plans */}
                  {p.allowsTrainer && (
                    <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-gradient-to-br from-red-600 to-orange-500 opacity-10 blur-2xl group-hover:opacity-20 transition-opacity" />
                  )}

                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-extrabold text-lg text-white group-hover:text-red-500 transition-colors">
                          {p.name}
                        </h4>
                        <span className="inline-block px-2.5 py-0.5 mt-1 rounded-full text-[10px] font-bold bg-zinc-800 border border-zinc-700 text-zinc-400">
                          ⏱ {p.duration}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">
                          Rs {p.price.toLocaleString()}
                        </span>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Single Payment</p>
                      </div>
                    </div>

                    <div className="border-t border-zinc-800/80 pt-4 space-y-3">
                      {/* Trainer option badge */}
                      {p.allowsTrainer ? (
                        <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                          <span>✓ Personal Trainer Selection Included</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 bg-zinc-950/40 border border-zinc-800/60 px-2.5 py-1 rounded-lg">
                          <span>✗ No Personal Trainer choice</span>
                        </div>
                      )}

                      {/* Features list */}
                      <div className="space-y-2 mt-2">
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Features included:</p>
                        {p.features && p.features.length > 0 ? (
                          <ul className="space-y-1.5 text-xs text-zinc-400">
                            {p.features.map((feat, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-red-500 mt-0.5">✔</span>
                                <span>{feat}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-xs text-zinc-600 italic">No features specified</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-6 border-t border-zinc-800/80 pt-4">
                    <button
                      onClick={() => handleOpenEditModal(p)}
                      className="flex-1 py-2 text-xs bg-zinc-800 hover:bg-zinc-750 font-bold rounded-lg border border-zinc-750 text-white transition-colors"
                    >
                      ✏ Edit Plan
                    </button>
                    <button
                      onClick={() => handleDelete(p._id, p.name)}
                      className="py-2 px-3 text-xs bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 rounded-lg transition-colors font-bold"
                    >
                      🗑 Delete
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-6 space-y-5 text-white max-h-[90vh] overflow-y-auto animate-fade-in">
            <div className="flex justify-between items-center pb-3 border-b border-zinc-800">
              <h3 className="text-lg font-black uppercase tracking-wider">
                {formType === "add" ? "Create Subscription Plan" : "Edit Plan Details"}
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
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Plan Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleFormChange}
                  placeholder="e.g. Premium Plan"
                  className="w-full px-4 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Price (Rs)</label>
                  <input
                    type="number"
                    name="price"
                    required
                    value={formData.price}
                    onChange={handleFormChange}
                    placeholder="e.g. 5000"
                    className="w-full px-4 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">Duration</label>
                  <select
                    name="duration"
                    value={formData.duration}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  >
                    <option value="1 Month">1 Month</option>
                    <option value="3 Months">3 Months</option>
                    <option value="Yearly">Yearly</option>
                  </select>
                </div>
              </div>

              {/* Checkbox for trainer choice */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-zinc-950 border border-zinc-800">
                <input
                  type="checkbox"
                  id="allowsTrainer"
                  name="allowsTrainer"
                  checked={formData.allowsTrainer}
                  onChange={handleFormChange}
                  className="w-4 h-4 rounded text-red-600 bg-zinc-800 border-zinc-700 focus:ring-red-500 focus:ring-2 accent-red-600"
                />
                <div>
                  <label htmlFor="allowsTrainer" className="block text-xs font-bold text-white uppercase cursor-pointer">
                    Allows Trainer Selection
                  </label>
                  <p className="text-[10px] text-zinc-500">Allows premium member to select a trainer of choice</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-400 uppercase mb-1">
                  Features (comma separated)
                </label>
                <textarea
                  name="features"
                  value={formData.features}
                  onChange={handleFormChange}
                  placeholder="e.g. Access to Gym, Free Locker, Personal Trainer"
                  rows="3"
                  className="w-full px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm resize-none"
                />
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
                  {saving ? "Saving..." : "Save Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
