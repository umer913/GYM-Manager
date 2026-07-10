"use client";

import { useEffect, useState, useCallback } from "react";
import { apiCall } from "../../utils/api";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const EMPTY_WEEKLY = DAYS.map((day) => ({ day, focus: "", exercises: [], restDay: false }));
const EMPTY_DIET = { calories: "", protein: "", carbs: "", fats: "", meals: [], notes: "" };

// ─── tiny helpers ──────────────────────────────────────────────────────────────

function Badge({ children, color = "zinc" }) {
  const map = {
    violet: "bg-violet-500/10 text-violet-300 border-violet-500/20",
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    zinc: "bg-zinc-800 text-zinc-400 border-zinc-700",
  };
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${map[color]}`}>
      {children}
    </span>
  );
}

function TabBtn({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-black uppercase tracking-tight rounded-lg transition-all cursor-pointer ${
        active
          ? "bg-red-500/10 text-white border border-red-500/30"
          : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
      }`}
    >
      {label}
    </button>
  );
}

// ─── Weekly Plan Tab ───────────────────────────────────────────────────────────

function WeeklyPlanTab({ memberId, weeklyPlan, setWeeklyPlan, saving, onSave }) {
  const [activeDay, setActiveDay] = useState(0);

  const day = weeklyPlan[activeDay] || EMPTY_WEEKLY[activeDay];

  const updateDay = (field, value) => {
    setWeeklyPlan((prev) =>
      prev.map((d, i) => (i === activeDay ? { ...d, [field]: value } : d))
    );
  };

  const addExercise = () => {
    updateDay("exercises", [...(day.exercises || []), { name: "", sets: "", reps: "", notes: "" }]);
  };

  const updateExercise = (exIdx, field, value) => {
    const updated = day.exercises.map((ex, i) => (i === exIdx ? { ...ex, [field]: value } : ex));
    updateDay("exercises", updated);
  };

  const removeExercise = (exIdx) => {
    updateDay("exercises", day.exercises.filter((_, i) => i !== exIdx));
  };

  return (
    <div className="space-y-4">
      {/* Day selector */}
      <div className="flex flex-wrap gap-2">
        {DAYS.map((d, i) => (
          <button
            key={d}
            onClick={() => setActiveDay(i)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              i === activeDay
                ? "bg-violet-600 text-white border-violet-600"
                : weeklyPlan[i]?.restDay
                ? "bg-zinc-800/60 text-zinc-500 border-zinc-700"
                : weeklyPlan[i]?.exercises?.length > 0
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-600"
            }`}
          >
            {d.slice(0, 3)}
          </button>
        ))}
      </div>

      {/* Day config */}
      <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-white">{day.day}</h4>
          <label className="flex items-center gap-2 cursor-pointer">
            <span className="text-xs text-zinc-400">Rest day</span>
            <div
              onClick={() => updateDay("restDay", !day.restDay)}
              className={`w-9 h-5 rounded-full transition-colors relative ${day.restDay ? "bg-violet-600" : "bg-zinc-700"}`}
            >
              <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${day.restDay ? "translate-x-4" : ""}`} />
            </div>
          </label>
        </div>

        {day.restDay ? (
          <p className="text-sm text-zinc-500 italic">Rest day — no exercises scheduled.</p>
        ) : (
          <>
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Focus / Muscle Group</label>
              <input
                value={day.focus}
                onChange={(e) => updateDay("focus", e.target.value)}
                placeholder="e.g. Chest & Triceps"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Exercises</p>
                <button
                  onClick={addExercise}
                  className="text-xs px-3 py-1 rounded-lg bg-violet-600/20 text-violet-300 border border-violet-500/20 hover:bg-violet-600/30 transition cursor-pointer"
                >
                  + Add
                </button>
              </div>

              {(day.exercises || []).length === 0 && (
                <p className="text-xs text-zinc-600 italic">No exercises yet. Click + Add.</p>
              )}

              {(day.exercises || []).map((ex, exIdx) => (
                <div key={exIdx} className="grid grid-cols-[1fr_80px_80px_1fr_32px] gap-2 items-center">
                  <input
                    value={ex.name}
                    onChange={(e) => updateExercise(exIdx, "name", e.target.value)}
                    placeholder="Exercise name"
                    className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500"
                  />
                  <input
                    value={ex.sets}
                    onChange={(e) => updateExercise(exIdx, "sets", e.target.value)}
                    placeholder="Sets"
                    className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500"
                  />
                  <input
                    value={ex.reps}
                    onChange={(e) => updateExercise(exIdx, "reps", e.target.value)}
                    placeholder="Reps"
                    className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500"
                  />
                  <input
                    value={ex.notes}
                    onChange={(e) => updateExercise(exIdx, "notes", e.target.value)}
                    placeholder="Notes"
                    className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500"
                  />
                  <button
                    onClick={() => removeExercise(exIdx)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition cursor-pointer text-xs"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <button
        onClick={onSave}
        disabled={saving}
        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold text-sm shadow-lg shadow-red-500/20 transition disabled:opacity-50 cursor-pointer"
      >
        {saving ? "Saving…" : "Save Weekly Plan"}
      </button>
    </div>
  );
}

// ─── Diet Plan Tab ─────────────────────────────────────────────────────────────

function DietPlanTab({ dietPlan, setDietPlan, saving, onSave }) {
  const update = (field, value) => setDietPlan((prev) => ({ ...prev, [field]: value }));

  const addMeal = () =>
    setDietPlan((prev) => ({ ...prev, meals: [...(prev.meals || []), { time: "", description: "" }] }));

  const updateMeal = (idx, field, value) => {
    setDietPlan((prev) => ({
      ...prev,
      meals: prev.meals.map((m, i) => (i === idx ? { ...m, [field]: value } : m)),
    }));
  };

  const removeMeal = (idx) => {
    setDietPlan((prev) => ({ ...prev, meals: prev.meals.filter((_, i) => i !== idx) }));
  };

  return (
    <div className="space-y-4">
      {/* Macros */}
      <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4 space-y-4">
        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Daily Macro Targets</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { field: "calories", label: "Calories (kcal)" },
            { field: "protein", label: "Protein (g)" },
            { field: "carbs", label: "Carbs (g)" },
            { field: "fats", label: "Fats (g)" },
          ].map(({ field, label }) => (
            <div key={field}>
              <label className="block text-xs text-zinc-500 mb-1">{label}</label>
              <input
                value={dietPlan[field] || ""}
                onChange={(e) => update(field, e.target.value)}
                placeholder="0"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Meals */}
      <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Meal Schedule</p>
          <button
            onClick={addMeal}
            className="text-xs px-3 py-1 rounded-lg bg-violet-600/20 text-violet-300 border border-violet-500/20 hover:bg-violet-600/30 transition cursor-pointer"
          >
            + Add Meal
          </button>
        </div>

        {(dietPlan.meals || []).length === 0 && (
          <p className="text-xs text-zinc-600 italic">No meals added. Click + Add Meal.</p>
        )}

        {(dietPlan.meals || []).map((meal, idx) => (
          <div key={idx} className="grid grid-cols-[120px_1fr_32px] gap-2 items-center">
            <input
              value={meal.time}
              onChange={(e) => updateMeal(idx, "time", e.target.value)}
              placeholder="7:00 AM"
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500"
            />
            <input
              value={meal.description}
              onChange={(e) => updateMeal(idx, "description", e.target.value)}
              placeholder="e.g. Oats with banana, 2 boiled eggs"
              className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500"
            />
            <button
              onClick={() => removeMeal(idx)}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition cursor-pointer text-xs"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs text-zinc-500 mb-1">Additional Notes</label>
        <textarea
          value={dietPlan.notes || ""}
          onChange={(e) => update("notes", e.target.value)}
          placeholder="Hydration tips, supplements, food restrictions…"
          rows={3}
          className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 resize-none"
        />
      </div>

      <button
        onClick={onSave}
        disabled={saving}
        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold text-sm shadow-lg shadow-red-500/20 transition disabled:opacity-50 cursor-pointer"
      >
        {saving ? "Saving…" : "Save Diet Plan"}
      </button>
    </div>
  );
}

// ─── Attendance Tab ────────────────────────────────────────────────────────────

function AttendanceTab({ memberId }) {
  const [state, setState] = useState({ loading: true, checkIns: [], totalCheckIns: 0, last30Days: 0, error: "" });

  useEffect(() => {
    if (!memberId) return;
    (async () => {
      setState((s) => ({ ...s, loading: true, error: "" }));
      const { data, ok } = await apiCall(`/api/trainer/member-attendance?memberId=${memberId}`);
      if (ok && data.success) {
        setState({ loading: false, checkIns: data.checkIns, totalCheckIns: data.totalCheckIns, last30Days: data.last30Days, error: "" });
      } else {
        setState((s) => ({ ...s, loading: false, error: data.message || "Failed to load attendance" }));
      }
    })();
  }, [memberId]);

  if (state.loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (state.error) {
    return <p className="text-sm text-red-400 py-4">{state.error}</p>;
  }

  // Build a 30-day grid
  const today = new Date();
  const grid = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (29 - i));
    d.setHours(0, 0, 0, 0);
    const hasCheckIn = state.checkIns.some((c) => {
      const cd = new Date(c.checkInTime);
      cd.setHours(0, 0, 0, 0);
      return cd.getTime() === d.getTime();
    });
    return { date: d, hasCheckIn };
  });

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4 text-center">
          <p className="text-2xl font-black text-white">{state.last30Days}</p>
          <p className="text-xs text-zinc-500 mt-1">Last 30 days</p>
        </div>
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4 text-center">
          <p className="text-2xl font-black text-white">{state.totalCheckIns}</p>
          <p className="text-xs text-zinc-500 mt-1">Total check-ins</p>
        </div>
      </div>

      {/* 30-day grid */}
      <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
        <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Last 30 Days</p>
        <div className="grid grid-cols-10 gap-1.5">
          {grid.map(({ date, hasCheckIn }, i) => (
            <div
              key={i}
              title={date.toLocaleDateString("en-PK", { weekday: "short", month: "short", day: "numeric" })}
              className={`h-7 rounded-md transition-colors ${
                hasCheckIn ? "bg-violet-500" : "bg-zinc-800"
              }`}
            />
          ))}
        </div>
        <div className="flex items-center gap-3 mt-3 text-xs text-zinc-500">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-violet-500 inline-block" /> Checked in</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-zinc-800 inline-block" /> Absent</span>
        </div>
      </div>

      {/* Log */}
      <div className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-800">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Check-in Log</p>
        </div>
        {state.checkIns.length === 0 ? (
          <p className="text-sm text-zinc-500 text-center py-6">No check-ins in the last 30 days</p>
        ) : (
          <div className="divide-y divide-zinc-800">
            {state.checkIns.map((c) => (
              <div key={c._id} className="px-4 py-2.5 flex items-center justify-between">
                <p className="text-sm text-white">
                  {new Date(c.checkInTime).toLocaleDateString("en-PK", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
                </p>
                <p className="text-xs text-zinc-400">
                  {new Date(c.checkInTime).toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Modal ────────────────────────────────────────────────────────────────

export default function MemberDetailModal({ member, onClose }) {
  const [tab, setTab] = useState("weekly");
  const [weeklyPlan, setWeeklyPlan] = useState(EMPTY_WEEKLY);
  const [dietPlan, setDietPlan] = useState(EMPTY_DIET);
  const [planLoading, setPlanLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  // Load existing plan
  useEffect(() => {
    if (!member) return;
    setPlanLoading(true);
    (async () => {
      const { data, ok } = await apiCall(`/api/trainer/member-plan?memberId=${member._id}`);
      if (ok && data.success && data.plan) {
        const wp = data.plan.weeklyPlan?.length === 7 ? data.plan.weeklyPlan : EMPTY_WEEKLY;
        setWeeklyPlan(wp);
        setDietPlan(data.plan.dietPlan || EMPTY_DIET);
      }
      setPlanLoading(false);
    })();
  }, [member]);  const handleSave = useCallback(async () => {
    setSaving(true);
    const { data, ok } = await apiCall("/api/trainer/member-plan", {
      method: "POST",
      body: JSON.stringify({ memberId: member._id, weeklyPlan, dietPlan }),
    });
    setSaving(false);
    if (ok && data.success) {
      showToast("Plan saved successfully ✓");
    } else {
      showToast(data.message || "Failed to save plan");
    }
  }, [member, weeklyPlan, dietPlan]);

  if (!member) return null;

  const initials = member.name.split(" ").map((p) => p[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-2xl max-h-[90vh] bg-zinc-950 border border-zinc-800 rounded-2xl flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center font-black text-sm text-white shadow-md shadow-red-500/20">
              {initials}
            </div>
            <div>
              <p className="font-semibold text-white">{member.name}</p>
              <p className="text-xs text-zinc-500">{member.email}</p>
            </div>
            <Badge color={member.membershipStatus === "active" ? "emerald" : "zinc"}>
              {member.membershipStatus === "active" ? "Active" : "Inactive"}
            </Badge>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 px-5 py-3 border-b border-zinc-800 shrink-0">
          <TabBtn label="🏋️ Weekly Plan" active={tab === "weekly"} onClick={() => setTab("weekly")} />
          <TabBtn label="🥗 Diet Plan" active={tab === "diet"} onClick={() => setTab("diet")} />
          <TabBtn label="📅 Attendance" active={tab === "attendance"} onClick={() => setTab("attendance")} />
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-5 py-5">
          {planLoading && tab !== "attendance" ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <>
              {tab === "weekly" && (
                <WeeklyPlanTab
                  memberId={member._id}
                  weeklyPlan={weeklyPlan}
                  setWeeklyPlan={setWeeklyPlan}
                  saving={saving}
                  onSave={handleSave}
                />
              )}
              {tab === "diet" && (
                <DietPlanTab
                  dietPlan={dietPlan}
                  setDietPlan={setDietPlan}
                  saving={saving}
                  onSave={handleSave}
                />
              )}
              {tab === "attendance" && <AttendanceTab memberId={member._id} />}
            </>
          )}
        </div>

        {/* Toast */}
        {toast && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl shadow-lg">
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}
