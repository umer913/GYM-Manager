"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../Sidebar";
import { apiCall } from "../../../../utils/api";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const DAY_SHORT = { Monday: "Mon", Tuesday: "Tue", Wednesday: "Wed", Thursday: "Thu", Friday: "Fri", Saturday: "Sat", Sunday: "Sun" };

// ── Small helpers ──────────────────────────────────────────────────────────────

function SectionHeader({ icon, title, subtitle }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-xl">{icon}</div>
      <div>
        <h2 className="font-bold text-white">{title}</h2>
        {subtitle && <p className="text-xs text-zinc-500">{subtitle}</p>}
      </div>
    </div>
  );
}

function MacroBadge({ label, value, color }) {
  const colors = {
    red: "bg-red-500/10 text-red-400 border-red-500/20",
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  };
  return (
    <div className={`rounded-xl border px-4 py-3 text-center ${colors[color]}`}>
      <p className="text-xl font-black">{value || "—"}</p>
      <p className="text-xs mt-0.5 opacity-70">{label}</p>
    </div>
  );
}

// ── Trainer Plan Section ───────────────────────────────────────────────────────

function TrainerWorkoutPlan({ weeklyWorkoutPlan, trainer, planUpdatedAt }) {
  const [activeDay, setActiveDay] = useState(0);

  if (!weeklyWorkoutPlan || weeklyWorkoutPlan.length === 0) {
    return (
      <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800/80 p-8 text-center">
        <span className="text-4xl block mb-3"> </span>
        <p className="text-zinc-400 font-semibold">No workout plan yet</p>
        <p className="text-xs text-zinc-500 mt-2">Your trainer hasn&apos;t set a workout plan for you yet.</p>
      </div>
    );
  }

  const day = weeklyWorkoutPlan[activeDay];

  return (
    <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800/80 overflow-hidden">
      <div className="px-5 py-4  border-zinc-850 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-bold text-white">Weekly Workout Plan</h3>
          {trainer && (
            <p className="text-xs text-zinc-500 mt-0.5">
              Set by <span className="text-orange-400">{trainer.name}</span>
              {trainer.specialty ? ` · ${trainer.specialty}` : ""}
            </p>
          )}
        </div>
        {planUpdatedAt && (
          <span className="text-xs text-zinc-500 bg-zinc-950  border-zinc-850 px-3 py-1 rounded-full">
            Updated {new Date(planUpdatedAt).toLocaleDateString("en-PK", { day: "numeric", month: "short" })}
          </span>
        )}
      </div>

      {/* Day tabs */}
      <div className="flex overflow-x-auto gap-2 px-5 py-3  border-zinc-850 no-scrollbar">
        {weeklyWorkoutPlan.map((d, i) => (
          <button
            key={d.day}
            onClick={() => setActiveDay(i)}
            className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              i === activeDay
                ? "bg-red-600 text-white border-red-650 shadow-md shadow-red-650/10"
                : d.restDay
                ? "bg-zinc-950/40 text-zinc-650 border border-zinc-900"
                : d.exercises?.length > 0
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : "bg-zinc-950/20 text-zinc-500 border border-zinc-900"
            }`}
          >
            {DAY_SHORT[d.day] || d.day.slice(0, 3)}
          </button>
        ))}
      </div>

      {/* Day content */}
      <div className="px-5 py-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-bold text-white text-lg">{day.day}</h4>
            {day.focus && <p className="text-sm text-red-400">{day.focus}</p>}
          </div>
          {day.restDay && (
            <span className="text-xs px-3 py-1 rounded-full bg-zinc-950 text-zinc-400 border border-zinc-850">
              Rest Day 😴
            </span>
          )}
        </div>

        {day.restDay ? (
          <p className="text-sm text-zinc-500 italic">Take it easy today. Rest and recovery are part of the program.</p>
        ) : day.exercises?.length === 0 ? (
          <p className="text-sm text-zinc-600 italic">No exercises scheduled for this day.</p>
        ) : (
          <div className="space-y-3">
            {day.exercises.map((ex, i) => (
              <div key={i} className="flex items-start gap-4 p-3 rounded-xl ">
                <div className="w-7 h-7 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center text-xs font-bold shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white text-sm">{ex.name}</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {ex.sets && (
                      <span className="text-xs bg-zinc-900 text-zinc-400 px-2 py-0.5 rounded-full">{ex.sets} sets</span>
                    )}
                    {ex.reps && (
                      <span className="text-xs bg-zinc-900 text-zinc-400 px-2 py-0.5 rounded-full">{ex.reps} reps</span>
                    )}
                  </div>
                  {ex.notes && <p className="text-xs text-zinc-500 mt-1">{ex.notes}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Trainer Diet Plan Section ──────────────────────────────────────────────────

function TrainerDietPlan({ weeklyDietPlan, trainer }) {
  if (!weeklyDietPlan || (!weeklyDietPlan.calories && !weeklyDietPlan.meals?.length)) {
    return (
      <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800/80 p-8 text-center">
        <span className="text-4xl block mb-3">🥗</span>
        <p className="text-zinc-400 font-semibold">No diet plan yet</p>
        <p className="text-xs text-zinc-500 mt-2">Your trainer hasn&apos;t set a diet plan for you yet.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800/80 overflow-hidden">
      <div className="px-5 py-4 border-zinc-850">
        <h3 className="font-bold text-white">Weekly Diet Plan</h3>
        {trainer && <p className="text-xs text-zinc-500 mt-0.5">Set by <span className="text-orange-400">{trainer.name}</span></p>}
      </div>

      <div className="px-5 py-5 space-y-5">
        {/* Macros */}
        {(weeklyDietPlan.calories || weeklyDietPlan.protein) && (
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Daily Macro Targets</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <MacroBadge label="Calories" value={weeklyDietPlan.calories} color="red" />
              <MacroBadge label="Protein" value={weeklyDietPlan.protein} color="blue" />
              <MacroBadge label="Carbs" value={weeklyDietPlan.carbs} color="amber" />
              <MacroBadge label="Fats" value={weeklyDietPlan.fats} color="emerald" />
            </div>
          </div>
        )}

        {/* Meals */}
        {weeklyDietPlan.meals?.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">Meal Schedule</p>
            <div className="space-y-2">
              {weeklyDietPlan.meals.map((meal, i) => (
                <div key={i} className="flex items-start gap-4 p-3 rounded-xl ">
                  <div className="shrink-0 min-w-[72px]">
                    <span className="text-xs font-bold text-red-400">{meal.time || `Meal ${i + 1}`}</span>
                  </div>
                  <p className="text-sm text-zinc-300">{meal.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes */}
        {weeklyDietPlan.notes && (
          <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/20">
            <p className="text-xs font-semibold text-orange-400 uppercase tracking-wider mb-1">💡 Trainer Notes</p>
            <p className="text-sm text-zinc-300">{weeklyDietPlan.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── AI Recommendation Section ──────────────────────────────────────────────────

// SVG icons — no emojis
const IconBrain = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
  </svg>
);
const IconDumbbell = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.5 6.5h1v11h-1z" fill="currentColor" stroke="none"/>
    <rect x="4" y="8" width="3" height="8" rx="1" fill="currentColor" stroke="none"/>
    <rect x="17" y="8" width="3" height="8" rx="1" fill="currentColor" stroke="none"/>
    <line x1="7" y1="12" x2="17" y2="12" strokeWidth={2}/>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6.5h1v11h-1z" fill="currentColor" stroke="none"/>
  </svg>
);
const IconLeaf = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>
  </svg>
);
const IconRefresh = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
  </svg>
);
const IconTrend = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
  </svg>
);
const IconFire = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"/>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z"/>
  </svg>
);
const IconSnow = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M3 12h18M5.636 5.636l12.728 12.728M18.364 5.636L5.636 18.364"/>
  </svg>
);
const IconNote = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
  </svg>
);
const IconPill = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"/>
  </svg>
);
const IconClock = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
    <circle cx="12" cy="12" r="9"/><path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 3"/>
  </svg>
);
const IconSparkle = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"/>
  </svg>
);

function AIRecommendations({ member }) {
  const [activeTab, setActiveTab] = useState("workout");
  const [workoutRec, setWorkoutRec] = useState(null);
  const [dietRec, setDietRec] = useState(null);  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generate = async (type) => {
    setLoading(true);
    setError("");
    const { data, ok } = await apiCall("/api/member/ai-recommendations", {
      method: "POST",
      body: JSON.stringify({ type }),
    });
    setLoading(false);
    if (ok && data.success) {
      if (type === "workout") {
        setWorkoutRec({ plan: data.recommendation, basedOn: data.basedOn, meta: data.meta });
      } else {
        setDietRec({ plan: data.recommendation, basedOn: data.basedOn, meta: data.meta });
      }
    } else {
      setError(data.message || "Recommendation failed. Please try again.");
    }
  };

  const hasWorkout = !!workoutRec;
  const hasDiet = !!dietRec;
  const current = activeTab === "workout" ? workoutRec?.plan : dietRec?.plan;

  return (
    <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800/80 overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-zinc-800/80 bg-gradient-to-r from-red-500/5 to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
            <IconBrain />
          </div>
          <div>
            <h3 className="font-black text-white uppercase tracking-tight text-sm">AI Recommendations</h3>
            <p className="text-xs text-zinc-500">Personalised suggestions based on your profile</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 px-5 pt-4">
        <button
          onClick={() => setActiveTab("workout")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-tight transition cursor-pointer border ${
            activeTab === "workout"
              ? "bg-red-500/10 text-white border-red-500/30"
              : "text-zinc-400 hover:text-white border-transparent hover:bg-zinc-800/40"
          }`}
        >
          <span className={activeTab === "workout" ? "text-red-400" : "text-zinc-600"}><IconDumbbell /></span>
          Workout Plan
        </button>
        <button
          onClick={() => setActiveTab("diet")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-tight transition cursor-pointer border ${
            activeTab === "diet"
              ? "bg-red-500/10 text-white border-red-500/30"
              : "text-zinc-400 hover:text-white border-transparent hover:bg-zinc-800/40"
          }`}
        >
          <span className={activeTab === "diet" ? "text-red-400" : "text-zinc-600"}><IconLeaf /></span>
          Diet Plan
        </button>
      </div>

      <div className="px-5 py-5">
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
        )}

        {/* Empty state */}
        {!current && !loading && (
          <div className="text-center py-10">
            <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-zinc-800 mx-auto flex items-center justify-center text-zinc-500 mb-4">
              {activeTab === "workout" ? <IconDumbbell /> : <IconLeaf />}
            </div>
            <p className="text-zinc-300 font-bold text-sm">
              Generate your {activeTab === "workout" ? "Workout" : "Diet"} Plan
            </p>
            <p className="text-xs text-zinc-500 mt-1.5 max-w-xs mx-auto">
              Get a personalised {activeTab === "workout" ? "7-day workout schedule" : "full-day diet plan"} matched to your trainer and goals.
            </p>
            <button
              onClick={() => generate(activeTab)}
              className="mt-5 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold text-sm shadow-lg shadow-red-500/20 transition cursor-pointer mx-auto"
            >
              <IconSparkle />
              Generate Plan
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-12">
            <div className="w-10 h-10 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-zinc-400 font-semibold">Building your plan...</p>
            <p className="text-xs text-zinc-500 mt-1">Just a moment</p>
          </div>
        )}

        {/* Results */}
        {!loading && activeTab === "workout" && workoutRec && (
          <AIWorkoutResult rec={workoutRec.plan} meta={workoutRec.meta} onRegenerate={() => generate("workout")} />
        )}
        {!loading && activeTab === "diet" && dietRec && (
          <AIDietResult rec={dietRec.plan} meta={dietRec.meta} onRegenerate={() => generate("diet")} />
        )}
      </div>
    </div>
  );
}

function AIWorkoutResult({ rec, meta, onRegenerate }) {
  const [activeDay, setActiveDay] = useState(0);
  const day = rec[activeDay];

  return (
    <div className="space-y-4">
      {/* Meta cards */}
      {meta && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { label: "Program", value: meta.label },
            { label: "Level",   value: meta.level },
            { label: "Goal",    value: meta.goal },
            { label: "Days / Week", value: meta.daysPerWeek },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl bg-zinc-950/60 border border-zinc-800 px-3 py-2.5">
              <p className="text-[10px] font-black uppercase tracking-wider text-zinc-500">{label}</p>
              <p className="text-xs text-white font-semibold mt-0.5 leading-snug">{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Progression rule */}
      {meta?.progressionRule && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-zinc-950/40 border border-zinc-800">
          <span className="text-red-400 shrink-0 mt-0.5"><IconTrend /></span>
          <p className="text-xs text-zinc-300 leading-relaxed">
            <span className="font-bold text-white">Progression: </span>{meta.progressionRule}
          </p>
        </div>
      )}

      {/* Day selector */}
      <div className="flex flex-wrap gap-1.5">
        {rec.map((d, i) => (
          <button
            key={d.day}
            onClick={() => setActiveDay(i)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
              i === activeDay
                ? "bg-red-600 text-white border-red-600 shadow-md shadow-red-600/20"
                : d.restDay
                ? "bg-zinc-900 text-zinc-600 border-zinc-800"
                : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white hover:border-zinc-700"
            }`}
          >
            {d.day.slice(0, 3)}
          </button>
        ))}
      </div>

      {/* Day detail */}
      {day && (
        <div className="rounded-xl bg-zinc-950/40 border border-zinc-800 overflow-hidden">
          {/* Day header */}
          <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
            <div>
              <h4 className="font-black text-white text-sm">{day.day}</h4>
              {day.focus && <p className="text-xs text-red-400 mt-0.5">{day.focus}</p>}
            </div>
            {day.restDay && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-zinc-900 text-zinc-400 border border-zinc-800 font-semibold">Rest Day</span>
            )}
          </div>

          <div className="p-4 space-y-4">
            {day.restDay ? (
              <p className="text-sm text-zinc-500">Active recovery — light stretching, walk, or full rest. Sleep 8+ hours.</p>
            ) : (
              <>
                {/* Warm-up */}
                {day.warmUp?.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="text-amber-400"><IconFire /></span>
                      <p className="text-[10px] font-black uppercase tracking-wider text-amber-400">Warm-Up</p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {day.warmUp.map((w, i) => (
                        <span key={i} className="text-xs bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2.5 py-0.5 rounded-full">{w}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Exercises */}
                <div>
                  <p className="text-[10px] font-black uppercase tracking-wider text-zinc-500 mb-2">Exercises</p>
                  <div className="space-y-2">
                    {(day.exercises || []).map((ex, i) => (
                      <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/60">
                        <span className="w-6 h-6 rounded-md bg-red-500/10 text-red-400 flex items-center justify-center text-xs font-black shrink-0 mt-0.5 border border-red-500/20">{i + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white font-bold leading-snug">{ex.name}</p>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {ex.sets && <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-md border border-zinc-700">{ex.sets} sets</span>}
                            {ex.reps && <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-md border border-zinc-700">{ex.reps} reps</span>}
                          </div>
                          {ex.notes && <p className="text-xs text-zinc-500 mt-1.5 leading-relaxed">{ex.notes}</p>}
                          {ex.tip && <p className="text-xs text-emerald-400/80 mt-0.5 leading-relaxed">{ex.tip}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cool-down */}
                {day.coolDown?.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <span className="text-blue-400"><IconSnow /></span>
                      <p className="text-[10px] font-black uppercase tracking-wider text-blue-400">Cool-Down</p>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {day.coolDown.map((c, i) => (
                        <span key={i} className="text-xs bg-blue-500/10 text-blue-300 border border-blue-500/20 px-2.5 py-0.5 rounded-full">{c}</span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Regenerate */}
      <button onClick={onRegenerate} className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-red-400 transition cursor-pointer">
        <IconRefresh /> Regenerate
      </button>
    </div>
  );
}

function AIDietResult({ rec, meta, onRegenerate }) {
  return (
    <div className="space-y-4">
      {/* Meta */}
      {meta && (
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Plan",       value: meta.label },
            { label: "Goal",       value: meta.goal },
            { label: "Calories",   value: meta.calories },
            { label: "Water / Day", value: meta.waterIntake },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl bg-zinc-950/60 border border-zinc-800 px-3 py-2.5">
              <p className="text-[10px] font-black uppercase tracking-wider text-zinc-500">{label}</p>
              <p className="text-xs text-white font-semibold mt-0.5 leading-snug">{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Meal timing */}
      {meta?.mealTiming && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-zinc-950/40 border border-zinc-800">
          <span className="text-zinc-400 shrink-0 mt-0.5"><IconClock /></span>
          <p className="text-xs text-zinc-300 leading-relaxed">
            <span className="font-bold text-white">Timing: </span>{meta.mealTiming}
          </p>
        </div>
      )}

      {/* Macros */}
      {(rec.calories || rec.protein) && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <MacroBadge label="Calories" value={rec.calories} color="red" />
          <MacroBadge label="Protein"  value={rec.protein}  color="blue" />
          <MacroBadge label="Carbs"    value={rec.carbs}    color="amber" />
          <MacroBadge label="Fats"     value={rec.fats}     color="emerald" />
        </div>
      )}

      {/* Meals */}
      {rec.meals?.length > 0 && (
        <div className="rounded-xl bg-zinc-950/40 border border-zinc-800 overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800">
            <p className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Meal Schedule</p>
          </div>
          <div className="divide-y divide-zinc-800/60">
            {rec.meals.map((meal, i) => (
              <div key={i} className="flex items-start gap-3 px-4 py-3">
                <span className="text-xs font-bold text-red-400 shrink-0 w-16 pt-0.5">{meal.time}</span>
                <p className="text-sm text-zinc-300 leading-relaxed">{meal.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Supplements */}
      {rec.supplements?.length > 0 && (
        <div>
          <div className="flex items-center gap-1.5 mb-2">
            <span className="text-emerald-400"><IconPill /></span>
            <p className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Supplements</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {rec.supplements.map((sup, i) => (
              <span key={i} className="text-xs bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2.5 py-1 rounded-full">{sup}</span>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {rec.notes && (
        <div className="flex items-start gap-2 p-3.5 rounded-xl bg-zinc-950/40 border border-zinc-800">
          <span className="text-zinc-400 shrink-0 mt-0.5"><IconNote /></span>
          <p className="text-sm text-zinc-300 leading-relaxed">{rec.notes}</p>
        </div>
      )}

      {/* Regenerate */}
      <button onClick={onRegenerate} className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-red-400 transition cursor-pointer">
        <IconRefresh /> Regenerate
      </button>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function MyWorkoutsPage() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeSection, setActiveSection] = useState("trainer"); // 'trainer' | 'ai'

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/Login"); return; }

    (async () => {
      const { data: result, ok, status } = await apiCall("/api/member/my-workouts");
      if (ok && result.success) {
        setData(result);
      } else {
        setError(result.message || "Failed to load workout data.");
        if (status === 401) {
          localStorage.removeItem("token");
          router.push("/Login");
        }
      }
      setLoading(false);
    })();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-zinc-900 flex flex-col justify-center items-center gap-4">
        <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-zinc-500 tracking-widest uppercase">Loading workouts…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-zinc-900 text-neutral-100 flex flex-col justify-center items-center p-6 text-center">
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm max-w-md mb-4">⚠️ {error}</div>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-white rounded-xl text-sm transition cursor-pointer">
          Try Again
        </button>
      </div>
    );
  }

  const { member, trainer, weeklyWorkoutPlan, weeklyDietPlan, planUpdatedAt } = data;
  const initials = member.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-zinc-900 text-neutral-100 font-sans selection:bg-red-500 selection:text-white">
      <Sidebar active="My Workouts" member={member} />

      <div className="lg:ml-60 flex flex-col min-h-screen pt-14 lg:pt-0">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-md border-b border-zinc-900/60 px-5 sm:px-8 py-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-red-500">Member Portal</p>
            <h1 className="text-lg sm:text-xl font-black uppercase tracking-tight text-white mt-0.5 leading-none">My Workouts</h1>
          </div>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center font-black text-sm text-white shadow-lg shadow-red-500/20">
            {initials}
          </div>
        </header>

        <main className="flex-1 px-5 sm:px-8 py-6 space-y-6 max-w-6xl mx-auto w-full">
          {/* Trainer info banner */}
          {trainer ? (
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-red-500/5 border border-red-500/20 shadow-sm">
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center font-bold text-sm text-white shrink-0 shadow-md shadow-red-500/10">
                {trainer.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">{trainer.name}</p>
                <p className="text-xs text-zinc-400">{trainer.specialty} · {trainer.timings}</p>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 shrink-0 font-semibold">Your Trainer</span>
            </div>
          ) : (
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/85">
              <div className="w-11 h-11 rounded-xl bg-zinc-800 flex items-center justify-center text-xl shrink-0">👤</div>
              <div>
                <p className="text-sm font-semibold text-zinc-400">No trainer assigned</p>
                <p className="text-xs text-zinc-650">Subscribe to a trainer-enabled plan and select a trainer to receive personalised plans.</p>
              </div>
            </div>
          )}

          {/* Section Toggle */}
          <div className="flex items-center gap-1 p-1 bg-zinc-900 border border-zinc-800/80 rounded-xl w-fit">
            <button
              onClick={() => setActiveSection("trainer")}
              className={`px-4 py-2 rounded-lg text-sm font-black uppercase tracking-tight transition cursor-pointer ${
                activeSection === "trainer"
                  ? "bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-md shadow-red-500/20"
                  : "text-zinc-500 hover:text-white"
              }`}
            >
              Trainer Plan
            </button>
            <button
              onClick={() => setActiveSection("ai")}
              className={`px-4 py-2 rounded-lg text-sm font-black uppercase tracking-tight transition cursor-pointer ${
                activeSection === "ai"
                  ? "bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-md shadow-red-500/20"
                  : "text-zinc-500 hover:text-white"
              }`}
            >
              AI Recommendations
            </button>
          </div>

          {/* Trainer Plan Section */}
          {activeSection === "trainer" && (
            <div className="space-y-6">
              <TrainerWorkoutPlan weeklyWorkoutPlan={weeklyWorkoutPlan} trainer={trainer} planUpdatedAt={planUpdatedAt} />
              <TrainerDietPlan weeklyDietPlan={weeklyDietPlan} trainer={trainer} />
            </div>
          )}

          {/* AI Section */}
          {activeSection === "ai" && (
            <AIRecommendations member={member} />
          )}
        </main>

        <footer className="border-t border-zinc-900 px-6 py-5 text-center text-xs text-zinc-600 mt-auto">
          © {new Date().getFullYear()} Fitcore — Member Portal
        </footer>
      </div>
    </div>
  );
}
