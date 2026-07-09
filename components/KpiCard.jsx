"use client";
import { useState, useEffect } from "react";
import AnimatedNum from "./AnimatedNum";

// Stat card with animated number, optional sparkline, and trend badge
export default function KpiCard({
  icon, label, value, prefix = "", suffix = "",
  trend, sparkData, sub,
  accent = "from-red-500 to-orange-500",
  delay = 0,
}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  const up = trend >= 0;

  return (
    <div
      className={`relative rounded-2xl p-5 bg-zinc-900/80 border border-zinc-800 hover:border-zinc-600 shadow-xl overflow-hidden group transition-all duration-700
        ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
      style={{ transition: `opacity 0.6s ease ${delay}ms, transform 0.6s ease ${delay}ms, border-color 0.3s` }}
    >
      {/* background glow */}
      <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br ${accent} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity duration-500`} />

      <div className="flex justify-between items-start">
        <div>
          <p className="text-zinc-400 text-xs font-medium uppercase tracking-widest mb-1">{label}</p>
          <h2 className="text-3xl font-black text-white">
            {visible ? <AnimatedNum target={value} prefix={prefix} suffix={suffix} /> : "0"}
          </h2>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 mt-1 text-xs font-semibold ${up ? "text-emerald-400" : "text-red-400"}`}>
              <span>{up ? "▲" : "▼"}</span>
              <span>{Math.abs(trend)}% vs last month</span>
            </div>
          )}
          {sub && <p className="text-xs text-zinc-500 mt-1">{sub}</p>}
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center bg-gradient-to-br ${accent} text-white text-lg shadow-lg`}>
          {icon}
        </div>
      </div>

      {sparkData && sparkData.length > 0 && (
        <div className="mt-3">
          <Sparkline data={sparkData} />
        </div>
      )}
    </div>
  );
}

// Inline sparkline SVG — only used inside KpiCard
function Sparkline({ data, color = "#ef4444" }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const w = 80, h = 32;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1 || 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * h;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      <polyline points={pts} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points={`0,${h} ${pts} ${w},${h}`} fill={color} fillOpacity="0.12" stroke="none" />
    </svg>
  );
}
