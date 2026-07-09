"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../Sidebar";
import { apiCall } from "../../../utils/api";

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
        <span className="text-4xl block mb-3">🏋️</span>
        <p className="text-zinc-400 font-semibold">No workout plan yet</p>
        <p className="text-xs text-zinc-500 mt-2">Your trainer hasn&apos;t set a workout plan for you yet.</p>
      </div>
    );
  }

  const day = weeklyWorkoutPlan[activeDay];

  return (
    <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800/80 overflow-hidden">
      <div className="px-5 py-4 border-b border-zinc-850 flex flex-wrap items-center justify-between gap-2">
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
          <span className="text-xs text-zinc-500 bg-zinc-950 border border-zinc-850 px-3 py-1 rounded-full">
            Updated {new Date(planUpdatedAt).toLocaleDateString("en-PK", { day: "numeric", month: "short" })}
          </span>
        )}
      </div>

      {/* Day tabs */}
      <div className="flex overflow-x-auto gap-2 px-5 py-3 border-b border-zinc-850 no-scrollbar">
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
              <div key={i} className="flex items-start gap-4 p-3 rounded-xl bg-zinc-950/40 border border-zinc-850">
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
      <div className="px-5 py-4 border-b border-zinc-850">
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
                <div key={i} className="flex items-start gap-4 p-3 rounded-xl bg-zinc-950/40 border border-zinc-850">
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
      <div className="px-5 py-4 border-b border-zinc-850 bg-gradient-to-r from-red-500/5 to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-xl text-red-400">🤖</div>
          <div>
            <h3 className="font-bold text-white">AI-Powered Recommendations</h3>
            <p className="text-xs text-zinc-500">Personalised suggestions based on your profile</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 px-5 pt-4">
        <button
          onClick={() => setActiveTab("workout")}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition cursor-pointer border ${
            activeTab === "workout"
              ? "bg-red-500/10 text-white border-red-500/30"
              : "text-zinc-400 hover:text-white border-transparent hover:bg-zinc-800/40"
          }`}
        >
          🏋️ Workout Plan
        </button>
        <button
          onClick={() => setActiveTab("diet")}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition cursor-pointer border ${
            activeTab === "diet"
              ? "bg-red-500/10 text-white border-red-500/30"
              : "text-zinc-400 hover:text-white border-transparent hover:bg-zinc-800/40"
          }`}
        >
          🥗 Diet Plan
        </button>
      </div>

      <div className="px-5 py-5">
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
        )}

        {/* Empty state — generate button */}
        {!current && !loading && (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 mx-auto flex items-center justify-center text-3xl mb-4 text-red-400">
              {activeTab === "workout" ? "🏋️" : "🥗"}
            </div>
            <p className="text-zinc-400 font-semibold">
              Generate your AI {activeTab === "workout" ? "Workout" : "Diet"} Plan
            </p>
            <p className="text-xs text-zinc-500 mt-2 max-w-sm mx-auto">
              Get a personalised {activeTab === "workout" ? "7-day workout schedule" : "full day diet plan"} matched to your trainer's specialty and plan.
            </p>
            <button
              onClick={() => generate(activeTab)}
              className="mt-5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold text-sm shadow-lg shadow-red-500/25 transition cursor-pointer"
            >
              ✨ Get Recommendation
            </button>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="text-center py-10">
            <div className="w-10 h-10 border-3 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderWidth: "3px" }} />
            <p className="text-sm text-zinc-400">Building your personalised plan...</p>
            <p className="text-xs text-zinc-500 mt-1">Just a moment</p>
          </div>
        )}

        {/* AI Workout Result */}
        {!loading && activeTab === "workout" && workoutRec && (
          <AIWorkoutResult rec={workoutRec.plan} basedOn={workoutRec.basedOn} meta={workoutRec.meta} onRegenerate={() => generate("workout")} />
        )}

        {/* AI Diet Result */}
        {!loading && activeTab === "diet" && dietRec && (
          <AIDietResult rec={dietRec.plan} basedOn={dietRec.basedOn} meta={dietRec.meta} onRegenerate={() => generate("diet")} />
        )}
      </div>
    </div>
  );
}

function AIWorkoutResult({ rec, basedOn, meta, onRegenerate }) {
  const [activeDay, setActiveDay] = useState(0);
  const day = rec[activeDay];

  return (
    <div className="space-y-4">
      {/* Program meta */}
      {meta && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {[
            { label: "Program", value: meta.label },
            { label: "Level", value: meta.level },
            { label: "Goal", value: meta.goal },
            { label: "Days/Week", value: meta.daysPerWeek },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl bg-zinc-950/40 border border-zinc-850 px-3 py-2">
              <p className="text-[10px] text-zinc-550 uppercase tracking-wider">{label}</p>
              <p className="text-xs text-white font-semibold mt-0.5">{value}</p>
            </div>
          ))}
        </div>
      )}

      {meta?.progressionRule && (
        <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/20 text-xs text-red-300">
          <span className="font-semibold">📈 Progression: </span>{meta.progressionRule}
        </div>
      )}

      {/* Day selector */}
      <div className="flex flex-wrap gap-2">
        {rec.map((d, i) => (
          <button
            key={d.day}
            onClick={() => setActiveDay(i)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
              i === activeDay
                ? "bg-red-600 text-white border-red-650 shadow-md shadow-red-650/10"
                : d.restDay
                ? "bg-zinc-950/40 text-zinc-650 border border-zinc-900"
                : "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
            }`}
          >
            {d.day.slice(0, 3)}
          </button>
        ))}
      </div>

      {/* Day detail */}
      {day && (
        <div className="rounded-xl bg-zinc-950/40 border border-zinc-850 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-white">{day.day}</h4>
              {day.focus && <p className="text-sm text-red-400">{day.focus}</p>}
            </div>
            {day.restDay && (
              <span className="text-xs px-3 py-1 rounded-full bg-zinc-950 text-zinc-400 border border-zinc-850">Rest 😴</span>
            )}
          </div>

          {day.restDay ? (
            <p className="text-sm text-zinc-500 italic">Active recovery day — light stretching, walk, or full rest. Sleep 8+ hours.</p>
          ) : (
            <>
              {/* Warm-up */}
              {day.warmUp?.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-amber-405 uppercase tracking-wider mb-1.5">🔥 Warm-Up</p>
                  <div className="flex flex-wrap gap-1.5">
                    {day.warmUp.map((w, i) => (
                      <span key={i} className="text-xs bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2 py-0.5 rounded-full">{w}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Exercises */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">🏋️ Exercises</p>
                {(day.exercises || []).map((ex, i) => (
                  <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg bg-zinc-900/40 border border-zinc-850">
                    <span className="w-6 h-6 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-semibold">{ex.name}</p>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {ex.sets && <span className="text-xs bg-zinc-950 text-zinc-450 px-2 py-0.5 rounded-full">{ex.sets} sets</span>}
                        {ex.reps && <span className="text-xs bg-zinc-950 text-zinc-450 px-2 py-0.5 rounded-full">{ex.reps} reps</span>}
                      </div>
                      {ex.notes && <p className="text-xs text-zinc-500 mt-1">📌 {ex.notes}</p>}
                      {ex.tip && <p className="text-xs text-emerald-400/80 mt-0.5">💡 {ex.tip}</p>}
                    </div>
                  </div>
                ))}
              </div>

              {/* Cool-down */}
              {day.coolDown?.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1.5">❄️ Cool-Down</p>
                  <div className="flex flex-wrap gap-1.5">
                    {day.coolDown.map((c, i) => (
                      <span key={i} className="text-xs bg-blue-500/10 text-blue-300 border border-blue-500/20 px-2 py-0.5 rounded-full">{c}</span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      <button onClick={onRegenerate} className="text-xs text-zinc-550 hover:text-red-400 transition cursor-pointer">🔄 Refresh</button>
    </div>
  );
}
function AIDietResult({ rec, basedOn, meta, onRegenerate }) {
  return (
    <div className="space-y-5">
      {/* Program meta */}
      {meta && (
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Plan", value: meta.label },
            { label: "Goal", value: meta.goal },
            { label: "Calories", value: meta.calories },
            { label: "Water/Day", value: meta.waterIntake },
          ].map(({ label, value }) => (
            <div key={label} className="rounded-xl bg-zinc-950/40 border border-zinc-850 px-3 py-2">
              <p className="text-[10px] text-zinc-550 uppercase tracking-wider">{label}</p>
              <p className="text-xs text-white font-semibold mt-0.5">{value}</p>
            </div>
          ))}
        </div>
      )}

      {meta?.mealTiming && (
        <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/20 text-xs text-red-350">
          <span className="font-semibold">⏱️ Timing: </span>{meta.mealTiming}
        </div>
      )}

      {/* Macros */}
      {(rec.calories || rec.protein) && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <MacroBadge label="Calories" value={rec.calories} color="red" />
          <MacroBadge label="Protein" value={rec.protein} color="blue" />
          <MacroBadge label="Carbs" value={rec.carbs} color="amber" />
          <MacroBadge label="Fats" value={rec.fats} color="emerald" />
        </div>
      )}

      {/* Meals */}
      {rec.meals?.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">🍽️ Meal Schedule</p>
          {rec.meals.map((meal, i) => (
            <div key={i} className="flex items-start gap-4 p-3 rounded-xl bg-zinc-950/40 border border-zinc-850">
              <span className="shrink-0 min-w-[68px] text-xs font-bold text-red-400">{meal.time}</span>
              <p className="text-sm text-zinc-305">{meal.description}</p>
            </div>
          ))}
        </div>
      )}

      {/* Supplements */}
      {rec.supplements?.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">💊 Supplements</p>
          <div className="flex flex-wrap gap-1.5">
            {rec.supplements.map((sup, i) => (
              <span key={i} className="text-xs bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2.5 py-1 rounded-full">{sup}</span>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {rec.notes && (
        <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20">
          <p className="text-xs font-semibold text-red-400 mb-1">💡 Tips</p>
          <p className="text-sm text-zinc-300">{rec.notes}</p>
        </div>
      )}

      <button onClick={onRegenerate} className="text-xs text-zinc-550 hover:text-red-400 transition cursor-pointer">🔄 Refresh</button>
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
      <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-zinc-900 text-neutral-100 flex flex-col justify-center items-center">
        <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-zinc-400">Loading your workouts...</p>
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

      <div className="lg:ml-60 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-900 px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-red-450 font-semibold">Member Portal</p>
            <h1 className="text-xl font-bold mt-1 text-white">My Workouts</h1>
            <p className="text-xs text-zinc-500">Your trainer plan & AI recommendations</p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center font-bold text-sm text-white shadow-lg shadow-red-500/20">
            {initials}
          </div>
        </header>

        <main className="flex-1 px-6 py-6 space-y-6">
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
          <div className="flex items-center gap-2 p-1 bg-zinc-950 border border-zinc-850 rounded-xl w-fit">
            <button
              onClick={() => setActiveSection("trainer")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition cursor-pointer ${
                activeSection === "trainer" ? "bg-red-600 text-white shadow-md shadow-red-655/15" : "text-zinc-400 hover:text-white"
              }`}
            >
              🏋️ Trainer Plan
            </button>
            <button
              onClick={() => setActiveSection("ai")}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition cursor-pointer ${
                activeSection === "ai" ? "bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white shadow-lg shadow-red-500/20" : "text-zinc-400 hover:text-white"
              }`}
            >
              🤖 AI Recommendations
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

        <footer className="border-t border-zinc-900 px-6 py-4 text-center text-xs text-zinc-650 mt-auto">
          © {new Date().getFullYear()} Fitcore — Member Portal
        </footer>
      </div>
    </div>
  );
}
