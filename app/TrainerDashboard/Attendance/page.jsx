"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import Sidebar from "../Sidebar";
import { apiCall } from "../../../utils/api";

export default function TrainerAttendancePage() {
  const router = useRouter();

  const [trainer, setTrainer]           = useState(null);
  const [checkInDates, setCheckInDates] = useState([]);
  const [totalCheckIns, setTotal]       = useState(0);
  const [monthlyCount, setMonthlyCount] = useState(0);
  const [weekAttendance, setWeek]       = useState(Array(7).fill(false));

  const [loading, setLoading]         = useState(true);
  const [coords, setCoords]           = useState(null);
  const [readableAddr, setReadableAddr] = useState("");
  const [locError, setLocError]       = useState("");
  const [scanning, setScanning]       = useState(false);
  const [checkingIn, setCheckingIn]   = useState(false);
  const [checkInSuccess, setSuccess]  = useState("");
  const [scanError, setScanError]     = useState("");

  const scannerRef = useRef(null);

  const fetchAttendance = async () => {
    const { data, ok, status } = await apiCall("/api/trainer/attendance");
    if (ok && data.success) {
      setCheckInDates(data.checkInDates || []);
      setTotal(data.totalCheckIns || 0);
      setMonthlyCount(data.monthlyCount || 0);
      setWeek(data.weekAttendance || Array(7).fill(false));
    } else if (status === 401 || status === 403) {
      localStorage.removeItem("token");
      router.push("/Login");
    }
    setLoading(false);
  };

  const fetchTrainer = async () => {
    const { data, ok } = await apiCall("/api/trainer/dashboard");
    if (ok && data.success) setTrainer(data.trainer);
  };

  useEffect(() => {
    if (!localStorage.getItem("token")) { router.push("/Login"); return; }
    fetchTrainer();
    fetchAttendance();

    if (!navigator.geolocation) {
      setLocError("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setCoords({ latitude: lat, longitude: lng });
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
            { headers: { "User-Agent": "FitcoreGymManagementSystem/1.0" } }
          );
          const geo = await res.json();
          if (geo?.display_name) setReadableAddr(geo.display_name);
        } catch { /* silent */ }
      },
      () => setLocError("Location permission denied. GPS is required to check in.")
    );
  }, [router]);

  const startScanner = () => {
    setScanning(true); setScanError(""); setSuccess("");
    setTimeout(() => {
      if (typeof window !== "undefined" && window.Html5QrcodeScanner) {
        const scanner = new window.Html5QrcodeScanner(
          "trainer-reader",
          { fps: 10, qrbox: { width: 250, height: 250 }, supportedScanTypes: [0] },
          false
        );
        scanner.render(
          async (decoded) => { scanner.clear(); setScanning(false); await submitCheckIn(decoded); },
          () => {}
        );
        scannerRef.current = scanner;
      } else {
        setScanError("QR Scanner not ready. Please try again.");
        setScanning(false);
      }
    }, 300);
  };

  const stopScanner = () => {
    try { scannerRef.current?.clear(); } catch { /* silent */ }
    scannerRef.current = null;
    setScanning(false);
  };

  const submitCheckIn = async (scanToken) => {
    if (!coords) { setScanError("GPS coordinates not available."); return; }
    setCheckingIn(true); setScanError(""); setSuccess("");
    const { data, ok } = await apiCall("/api/trainer/checkin", {
      method: "POST",
      body: JSON.stringify({ token: scanToken, latitude: coords.latitude, longitude: coords.longitude }),
    });
    if (ok && data.success) {
      setSuccess(data.message || "Attendance marked successfully!");
      fetchAttendance();
    } else {
      setScanError(data.errorDetails || data.message || "Check-in failed.");
    }
    setCheckingIn(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex flex-col justify-center items-center">
        <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-zinc-400">Loading attendance...</p>
      </div>
    );
  }

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const monthName = now.toLocaleDateString("en-PK", { month: "long", year: "numeric" });
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const offset = firstDay === 0 ? 6 : firstDay - 1;
  const calDays = [...Array(offset).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const isCheckedInToday = checkInDates.some(
    (d) => new Date(d).toDateString() === now.toDateString()
  );

  const initials = trainer?.name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "TR";
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans">
      <Script src="https://unpkg.com/html5-qrcode" strategy="lazyOnload" />
      <Sidebar active="Attendance" trainer={trainer} />

      <div className="lg:ml-64 flex flex-col min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800/60 px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.28em] text-violet-400 font-semibold">Trainer Portal</p>
            <h1 className="text-xl font-bold mt-1">My Attendance</h1>
            <p className="text-xs text-zinc-500">Scan the gym QR code to mark your attendance</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center font-bold text-sm">
            {initials}
          </div>
        </header>

        <main className="flex-1 px-6 py-6 space-y-6 max-w-5xl">

          {/* Alerts */}
          {locError && (
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 rounded-xl text-sm">📍 {locError}</div>
          )}

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: "This Month", value: monthlyCount, icon: "📅", color: "from-violet-500 to-indigo-600" },
              { label: "This Week",  value: weekAttendance.filter(Boolean).length, icon: "📊", color: "from-emerald-500 to-teal-600" },
              { label: "All Time",   value: totalCheckIns, icon: "🏆", color: "from-amber-500 to-orange-500" },
            ].map(({ label, value, icon, color }) => (
              <div key={label} className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-lg shrink-0`}>{icon}</div>
                <div>
                  <p className="text-2xl font-black">{value}</p>
                  <p className="text-xs text-zinc-500">{label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Week grid */}
          <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold">This Week</h3>
              <span className="text-xs text-violet-300 bg-violet-500/10 px-3 py-1 rounded-full border border-violet-500/20">
                {weekAttendance.filter(Boolean).length} / 7 days
              </span>
            </div>
            <div className="grid grid-cols-7 gap-2 text-center">
              {weekDays.map((d, i) => (
                <div key={d} className="flex flex-col items-center gap-1.5">
                  <p className="text-xs text-zinc-500 font-semibold">{d}</p>
                  <div className={`w-full aspect-square rounded-xl flex items-center justify-center text-sm border transition-all
                    ${weekAttendance[i]
                      ? "bg-gradient-to-br from-violet-500/30 to-indigo-500/20 border-violet-500/30 text-violet-300"
                      : "bg-zinc-800/40 border-zinc-800 text-zinc-600"}`}>
                    {weekAttendance[i] ? "✓" : "–"}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Calendar + Check-in panel */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Calendar */}
            <div className="md:col-span-2 rounded-2xl bg-zinc-900/80 border border-zinc-800 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-lg">Attendance Log</h3>
                <span className="text-xs text-violet-300 bg-violet-500/10 border border-violet-500/20 px-3 py-1 rounded-full font-semibold">
                  {monthName}
                </span>
              </div>
              <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-zinc-500 pb-2 border-b border-zinc-800/60 mb-3">
                {WEEKDAYS.map((d) => <div key={d}>{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-2 text-center">
                {calDays.map((dayNum, idx) => {
                  if (!dayNum) return <div key={`e-${idx}`} className="aspect-square" />;
                  const checked = checkInDates.some((d) => {
                    const dt = new Date(d);
                    return dt.getDate() === dayNum && dt.getMonth() === month && dt.getFullYear() === year;
                  });
                  const isToday = dayNum === now.getDate() && month === now.getMonth() && year === now.getFullYear();
                  return (
                    <div key={dayNum}
                      className={`aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-semibold relative transition-all
                        ${checked
                          ? "bg-gradient-to-br from-violet-500/35 to-indigo-500/20 text-violet-300 border border-violet-500/30 shadow-lg"
                          : isToday
                          ? "bg-zinc-800 text-white border border-violet-500/50"
                          : "bg-zinc-800/40 text-zinc-400 border border-zinc-800 hover:border-zinc-700"}`}>
                      {dayNum}
                      {checked && <span className="w-1.5 h-1.5 rounded-full bg-violet-400 absolute bottom-1" />}
                    </div>
                  );
                })}
              </div>
              <div className="mt-6 pt-4 border-t border-zinc-800/60 flex items-center justify-between text-xs text-zinc-400">
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-violet-500/30 border border-violet-500/30" />Checked In</div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-zinc-800/40 border border-zinc-800" />Absent</div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-zinc-800 border border-violet-500/50" />Today</div>
              </div>
            </div>

            {/* Check-in panel */}
            <div className="rounded-2xl bg-zinc-900/80 border border-zinc-800 p-5 flex flex-col min-h-[350px]">
              <h3 className="font-bold text-lg mb-1">Today's Session</h3>
              <p className="text-xs text-zinc-500 mb-5">Scan the gym QR code to mark your attendance</p>

              {isCheckedInToday ? (
                <div className="text-center py-10 bg-violet-500/5 border border-violet-500/20 rounded-2xl p-4">
                  <span className="text-4xl block mb-2">✅</span>
                  <h4 className="font-bold text-sm">Attendance Confirmed</h4>
                  <p className="text-xs text-zinc-400 mt-1">Already checked in for today. Have a great session! 💪</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {scanning && (
                    <div className="space-y-2">
                      <div id="trainer-reader" className="w-full overflow-hidden rounded-xl border border-zinc-800 bg-black" style={{ minHeight: "200px" }} />
                      <button onClick={stopScanner}
                        className="w-full py-2 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl text-xs transition cursor-pointer">
                        Cancel Scanning
                      </button>
                    </div>
                  )}

                  {!scanning && (
                    <div className="text-center py-6 bg-zinc-950 rounded-2xl border border-zinc-800 p-4 space-y-4">
                      <span className="text-4xl block">📅</span>
                      <div>
                        <p className="text-sm font-semibold">Scan Session QR Code</p>
                        <p className="text-xs text-zinc-500 mt-1">Open camera to scan the check-in QR code displayed in the gym.</p>
                        {coords && (
                          <div className="text-[10px] text-zinc-500 bg-zinc-900 border border-zinc-800 p-2 rounded leading-relaxed mt-2.5 max-w-xs mx-auto">
                            📍 <b>My Location:</b><br />
                            <span className="text-zinc-400">{readableAddr || "Resolving address..."}</span>
                          </div>
                        )}
                      </div>
                      <button
                        disabled={!coords}
                        onClick={startScanner}
                        className="w-full py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl text-sm shadow transition cursor-pointer"
                      >
                        {!coords ? "Waiting for GPS..." : "📷 Start Camera Scan"}
                      </button>
                    </div>
                  )}

                  {checkingIn && (
                    <div className="flex items-center justify-center gap-2 py-2 text-xs text-zinc-400">
                      <div className="w-4 h-4 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                      Verifying QR and GPS location...
                    </div>
                  )}

                  {checkInSuccess && (
                    <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs rounded-xl flex items-center gap-1.5">
                      ✅ {checkInSuccess}
                    </div>
                  )}

                  {scanError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl space-y-1">
                      <p className="font-semibold">⚠️ Verification Failed</p>
                      <p className="leading-relaxed">{scanError}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

        </main>

        <footer className="border-t border-zinc-800/60 px-6 py-4 text-center text-xs text-zinc-600 mt-auto">
          © {new Date().getFullYear()} Fitcore — Trainer Portal
        </footer>
      </div>
    </div>
  );
}
