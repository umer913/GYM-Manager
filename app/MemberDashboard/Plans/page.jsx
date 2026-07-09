"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../Sidebar";
import { apiCall } from "../../../utils/api";

const FILTERS = ["All", "Trainer Enabled", "Trainer Locked"];

export default function MemberPlansPage() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

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
        setError(result.message || "Failed to load plans.");
        if (status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("memberTheme");
          router.push("/Login");
        }
      }
      setLoading(false);
    })();
  }, [router]);

  const member = data?.member;
  const allPlans = data?.allPlans || [];
  const activePlanId = member?.plan?.id;
  const isSubscribed = !!member?.plan && member?.membershipStatus === 'active' && (!member?.membershipExpiresAt || new Date(member.membershipExpiresAt) >= new Date());
  const dateStr = new Date().toLocaleDateString("en-PK", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
  const [subscribingPlanId, setSubscribingPlanId] = useState("");
  const [toast, setToast] = useState("");

  const filteredPlans = useMemo(() => {
    return allPlans.filter((plan) => {
      const matchesSearch = [plan.name, plan.duration, ...(plan.features || [])]
        .some((value) => value?.toLowerCase().includes(search.toLowerCase()));

      const matchesFilter =
        filter === "All" ||
        (filter === "Trainer Enabled" && plan.allowsTrainer) ||
        (filter === "Trainer Locked" && !plan.allowsTrainer);

      return matchesSearch && matchesFilter;
    });
  }, [allPlans, search, filter]);

  const handleSubscribe = async (planId) => {
    setSubscribingPlanId(planId);
    setToast("");

    const { data: result, ok } = await apiCall("/api/member/subscribe-plan", {
      method: "POST",
      body: JSON.stringify({ planId }),
    });

    if (ok && result.success) {
      setData((prev) => ({
        ...prev,
        member: {
          ...prev.member,
          plan: result.member.plan,
          trainer: result.member.trainer,
          membershipStatus: result.member.membershipStatus,
          membershipExpiresAt: result.member.membershipExpiresAt,
          daysRemaining: 30,
        },
      }));
      setToast(result.message || 'Subscription updated.');
    } else {
      setToast(result.message || 'Failed to subscribe.');
    }

    setSubscribingPlanId("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col justify-center items-center">
        <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-zinc-400">Loading plans...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col justify-center items-center p-6 text-center">
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm max-w-md mb-4">⚠️ {error}</div>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-white rounded-xl text-sm transition cursor-pointer">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-zinc-900 text-neutral-100 font-sans selection:bg-red-500 selection:text-white">
      <Sidebar active="My Plan" member={member} />

      <div className="lg:ml-60 flex flex-col min-h-screen">
        <header className="sticky top-0 z-20 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-900 px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-red-400 font-semibold">Member Portal</p>
            <h1 className="text-xl font-bold mt-1 text-white">My Plans</h1>
            <p className="text-xs text-zinc-500">{dateStr}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center font-bold text-sm text-white shadow-lg shadow-red-500/20">
            {member?.name?.split(" ").map((part) => part[0]).join("").toUpperCase().slice(0, 2)}
          </div>
        </header>

        <main className="flex-1 px-6 py-6 space-y-6">
          <section className="rounded-3xl border border-zinc-800 bg-[radial-gradient(circle_at_top_right,_rgba(239,68,68,0.14),_transparent_35%),linear-gradient(135deg,_rgba(24,24,27,0.98),_rgba(9,9,11,0.98))] p-6 md:p-8">
            <div className="grid gap-6 md:grid-cols-[1.4fr_0.8fr] items-start">
              <div>
                <p className="text-sm text-zinc-400">Compare every plan created by the admin.</p>
                <h2 className="mt-2 text-3xl md:text-4xl font-black tracking-tight text-white">Your subscription options live here.</h2>
                <p className="mt-3 text-zinc-400 max-w-2xl">Browse all available plans, see which one is active, and check whether trainer access is included.</p>
              </div>
              <div className="rounded-2xl border border-zinc-850 bg-zinc-950/70 p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-zinc-500 font-bold">Current Plan</p>
                <p className="mt-3 text-lg font-bold text-white">{member?.plan ? member.plan.name : "No active plan"}</p>
                <p className="mt-2 text-sm text-zinc-400">{member?.plan ? `${member.plan.duration} · Rs ${member.plan.price?.toLocaleString?.() || member.plan.price}` : "Choose a plan to begin."}</p>
                <div className={`mt-4 inline-flex text-xs px-3 py-1 rounded-full border font-semibold ${isSubscribed ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : member?.plan ? "text-red-400 bg-red-500/10 border-red-500/20" : "text-zinc-400 bg-zinc-800 border-zinc-700"}`}>
                  {member?.plan ? `${member.plan.allowsTrainer ? "👑 Premium" : "💳 Subscribed"} · ${isSubscribed ? "Active" : "Expired"}` : "No active plan"}
                </div>
                {member?.membershipExpiresAt && (
                  <p className="mt-2 text-xs text-zinc-550">Expires on {new Date(member.membershipExpiresAt).toLocaleDateString("en-PK", { month: "long", day: "numeric", year: "numeric" })}</p>
                )}
              </div>
            </div>
          </section>

          <section className="rounded-2xl bg-zinc-900/60 border border-zinc-800/80 p-5 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <h3 className="font-bold text-white">All Admin Plans</h3>
                <p className="text-xs text-zinc-500">Search and filter the full list of plans created by your gym admin.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <input
                  type="text"
                  placeholder="Search plans..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full md:w-72 px-4 py-2 rounded-xl bg-zinc-950/50 text-white placeholder-zinc-500 border border-zinc-800 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                />
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="w-full md:w-48 px-4 py-2 rounded-xl bg-zinc-950/50 text-white border border-zinc-800 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                >
                  {FILTERS.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredPlans.length === 0 ? (
                <div className="col-span-full text-center py-10 text-zinc-500 text-sm">No plans found.</div>
              ) : filteredPlans.map((plan) => {
                const isActive = activePlanId === plan.id;
                return (
                  <div key={plan.id} className={`rounded-2xl border p-5 ${isActive ? "border-red-500/30 bg-red-500/10" : "border-zinc-800 bg-zinc-950/40"}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="text-lg font-bold text-white">{plan.name}</h4>
                        <p className="text-sm text-zinc-400 mt-1">{plan.duration}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500">Rs {plan.price.toLocaleString()}</p>
                        <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border font-bold ${plan.allowsTrainer ? "bg-orange-500/10 text-orange-400 border-orange-500/20" : "bg-zinc-800 text-zinc-400 border-zinc-700"}`}>
                          {plan.allowsTrainer ? "Trainer Included" : "Trainer Locked"}
                        </span>
                      </div>
                    </div>
                    {plan.features?.length > 0 && (
                      <p className="text-sm text-zinc-400 mt-3">{plan.features.join(" • ")}</p>
                    )}
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${isActive ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-zinc-800 text-zinc-400 border-zinc-700"}`}>
                        {isActive ? "Current Plan" : "Available"}
                      </span>
                      {plan.allowsTrainer && (
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full border bg-gradient-to-r from-red-500/10 to-orange-500/10 text-orange-400 border-orange-500/20">
                          👑 Unlocks Trainers
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleSubscribe(plan.id)}
                      disabled={subscribingPlanId === plan.id || (isActive && isSubscribed)}
                      className={`mt-4 w-full py-3 rounded-xl text-sm font-bold border transition cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 ${
                        isActive && isSubscribed
                          ? "bg-zinc-800 text-zinc-500 border-zinc-700"
                          : plan.allowsTrainer
                            ? "bg-gradient-to-r from-red-600/10 to-orange-600/10 text-orange-400 border border-orange-500/25 hover:from-red-600/20 hover:to-orange-600/20"
                            : "bg-red-500/10 text-red-300 border-red-500/20 hover:bg-red-500/20"
                      }`}
                    >
                      {subscribingPlanId === plan.id
                        ? "Subscribing..."
                        : isActive && isSubscribed
                          ? "Already Subscribed"
                          : plan.allowsTrainer
                            ? "Subscribe Premium"
                            : "Subscribe Plan"}
                    </button>
                  </div>
                );
              })}
            </div>

            {toast && (
              <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-3 text-sm text-zinc-300">
                {toast}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}