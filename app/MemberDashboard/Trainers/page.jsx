"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../Sidebar";
import { apiCall } from "../../../utils/api";

const QUOTES = [
  "Choose the right coach, then stay consistent.",
  "Good guidance turns effort into progress.",
  "The right trainer makes the plan easier to follow.",
];

export default function MemberTrainersPage() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [assigningTrainerId, setAssigningTrainerId] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const quote = useMemo(() => QUOTES[Math.floor(Math.random() * QUOTES.length)], []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/Login");
      return;
    }

    (async () => {
      const { data: result, ok, status } = await apiCall("/api/member/dashboard");
      if (ok && result.success) {
        setData(result);
      } else {
        setError(result.message || "Failed to load trainers.");
        if (status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("memberTheme");
          router.push("/Login");
        }
      }
      setLoading(false);
    })();
  }, [router]);

  const handleAssignTrainer = async (trainerId) => {
    if (!data?.canChooseTrainer) {
      setActionMessage("Your current plan does not allow trainer selection.");
      return;
    }

    setAssigningTrainerId(trainerId);
    setActionMessage("");
    const { data: result, ok } = await apiCall("/api/member/assign-trainer", {
      method: "POST",
      body: JSON.stringify({ trainerId }),
    });

    if (ok && result.success) {
      setData((prev) => prev ? ({
        ...prev,
        member: result.member ? {
          ...prev.member,
          trainer: result.member.assignedTrainer ? {
            id: result.member.assignedTrainer._id,
            name: result.member.assignedTrainer.name,
            phone: result.member.assignedTrainer.phone,
            specialty: result.member.assignedTrainer.specialty,
            timings: result.member.assignedTrainer.timings,
          } : null,
        } : prev.member,
      }) : prev);
      setActionMessage("Trainer assigned successfully.");
    } else {
      setActionMessage(result.message || "Failed to assign trainer.");
    }

    setAssigningTrainerId("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-zinc-900 text-neutral-100 flex flex-col justify-center items-center">
        <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-zinc-400">Loading trainers...</p>
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

  const member = data.member;
  const trainers = data.availableTrainers || [];
  const canChooseTrainer = !!data.canChooseTrainer;
  const activeTrainerId = member.trainer?.id;
  const filteredTrainers = trainers.filter((trainer) =>
    [trainer.name, trainer.specialty, trainer.timings, trainer.phone]
      .some((value) => value?.toLowerCase().includes(search.toLowerCase()))
  );
  const dateStr = new Date().toLocaleDateString("en-PK", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  const initials = member.name.split(" ").map((part) => part[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-zinc-900 text-neutral-100 font-sans selection:bg-red-500 selection:text-white">
      <Sidebar active="Trainers" member={member} />

      <div className="lg:ml-60 flex flex-col min-h-screen">
        <header className="sticky top-0 z-20 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-900 px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-red-400 font-semibold">Member Portal</p>
            <h1 className="text-xl font-bold mt-1 text-white">Trainers</h1>
            <p className="text-xs text-zinc-500">{dateStr}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center font-bold text-sm text-white shadow-lg shadow-red-500/20">
            {initials}
          </div>
        </header>

        <main className="flex-1 px-6 py-6 space-y-6">
          <section className="rounded-3xl border border-zinc-800 bg-[radial-gradient(circle_at_top_right,_rgba(239,68,68,0.12),_transparent_40%),linear-gradient(135deg,_rgba(24,24,27,0.98),_rgba(9,9,11,0.98))] p-6 md:p-8">
            <div className="grid gap-6 md:grid-cols-[1.4fr_0.8fr] items-start">
              <div>
                <p className="text-sm text-zinc-400">{quote}</p>
                <h2 className="mt-2 text-3xl md:text-4xl font-black tracking-tight text-white">Pick a trainer that matches your goal.</h2>
                <p className="mt-3 text-zinc-400 max-w-2xl">
                  {canChooseTrainer
                    ? "Your active plan allows trainer selection. You can pick one trainer from the list below."
                    : "Trainer selection is locked until you subscribe to a plan created by the admin that includes trainer access."}
                </p>
              </div>
              <div className="rounded-2xl border border-zinc-850 bg-zinc-950/70 p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-bold">Current Plan</p>
                <p className="mt-3 text-lg font-bold text-white">{member.plan ? member.plan.name : "No active plan"}</p>
                <p className="mt-2 text-sm text-zinc-400">{member.plan ? `${member.plan.duration} · Rs ${member.plan.price?.toLocaleString?.() || member.plan.price}` : "Subscribe to unlock trainer selection."}</p>
                <div className={`mt-4 inline-flex text-xs px-3 py-1 rounded-full border font-semibold ${canChooseTrainer ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : "text-zinc-400 bg-zinc-800 border-zinc-700"}`}>
                  {canChooseTrainer ? "Trainer access enabled" : "Trainer access disabled"}
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl bg-zinc-900/60 border border-zinc-800/80 p-5 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h3 className="font-bold text-white">Available Trainers</h3>
                <p className="text-xs text-zinc-550">Search and choose from the trainers added by the admin.</p>
              </div>
              <div className="relative w-full md:w-80">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">🔍</span>
                <input
                  type="text"
                  placeholder="Search trainers..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-zinc-950/50 text-white placeholder-zinc-500 border border-zinc-800 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                />
              </div>
            </div>

            {member.trainer && (
              <div className="rounded-xl border border-orange-500/20 bg-orange-500/10 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-orange-400 font-bold mb-2">Current Trainer</p>
                <p className="font-semibold text-white">{member.trainer.name}</p>
                <p className="text-xs text-zinc-400 mt-1">{member.trainer.specialty} · {member.trainer.timings}</p>
              </div>
            )}

            {actionMessage && (
              <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-3 text-sm text-zinc-350">
                {actionMessage}
              </div>
            )}

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {filteredTrainers.length === 0 ? (
                <div className="col-span-full text-center py-10 text-zinc-500 text-sm">No trainers found.</div>
              ) : filteredTrainers.map((trainer) => {
                const trainerInitials = trainer.name.split(" ").map((part) => part[0]).join("").toUpperCase().slice(0, 2);
                const isCurrent = trainer.id === activeTrainerId;
                return (
                  <div key={trainer.id} className="rounded-2xl border border-zinc-800 bg-zinc-950/40 p-5 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center font-bold text-sm flex-shrink-0 text-white shadow-lg shadow-red-500/25">
                        {trainerInitials}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{trainer.name}</p>
                        <p className="text-xs text-zinc-400 mt-1">{trainer.specialty}</p>
                        <p className="text-xs text-zinc-500">{trainer.timings}</p>
                        <p className="text-xs text-zinc-500">{trainer.phone}</p>
                      </div>
                    </div>

                    <button
                      disabled={!canChooseTrainer || assigningTrainerId === trainer.id || isCurrent}
                      onClick={() => handleAssignTrainer(trainer.id)}
                      className={`px-3 py-2 rounded-lg text-xs font-bold border transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${
                        isCurrent
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : canChooseTrainer
                            ? "bg-gradient-to-r from-red-600/10 to-orange-600/10 text-orange-400 border border-orange-500/20 hover:from-red-600/20 hover:to-orange-600/20"
                            : "bg-zinc-800 text-zinc-500 border-zinc-700"
                      }`}
                    >
                      {isCurrent ? "Selected" : assigningTrainerId === trainer.id ? "..." : "Choose"}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}