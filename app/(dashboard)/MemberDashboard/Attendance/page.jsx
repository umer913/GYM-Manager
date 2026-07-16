"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import Sidebar from "../Sidebar";
import { apiCall } from "../../../../utils/api";

export default function AttendancePage() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [coords, setCoords] = useState(null);
  const [readableAddr, setReadableAddr] = useState("");
  const [locError, setLocError] = useState("");

  const [scanning, setScanning] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkInSuccess, setCheckInSuccess] = useState("");
  const [scanError, setScanError] = useState("");

  const scannerRef = useRef(null);

  const fetchData = async () => {
    const { data: result, ok, status } = await apiCall("/api/member/dashboard");
    if (ok && result.success) {
      setData(result);
    } else {
      setError(result.message || "Failed to load attendance.");
      if (status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("memberTheme");
        router.push("/Login");
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!localStorage.getItem("token")) { router.push("/Login"); return; }
    fetchData();

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
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`, {
            headers: { "User-Agent": "FitcoreGymManagementSystem/1.0" },
          });
          const geo = await res.json();
          if (geo?.display_name) setReadableAddr(geo.display_name);
        } catch { /* silent */ }
      },
      () => setLocError("Location permission denied. GPS verification is required for checking in.")
    );
  }, [router]);

  const startScanner = () => {
    setScanning(true); setScanError(""); setCheckInSuccess("");
    setTimeout(() => {
      if (typeof window !== "undefined" && window.Html5QrcodeScanner) {
        const scanner = new window.Html5QrcodeScanner("reader", { fps: 10, qrbox: { width: 250, height: 250 }, supportedScanTypes: [0] }, false);
        scanner.render(
          async (decoded) => { scanner.clear(); setScanning(false); await submitCheckIn(decoded); },
          () => {} // silent scan loop errors
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
    setCheckingIn(true); setScanError(""); setCheckInSuccess("");
    const { data: result, ok } = await apiCall("/api/member/checkin", {
      method: "POST",
      body: JSON.stringify({ token: scanToken, latitude: coords.latitude, longitude: coords.longitude }),
    });
    if (ok && result.success) {
      setCheckInSuccess(result.message || "Attendance checked-in successfully!");
      fetchData();
    } else {
      setScanError(result.errorDetails || result.message || "Check-in failed.");
    }
    setCheckingIn(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-zinc-900 text-neutral-100 flex flex-col justify-center items-center">
        <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-xs text-zinc-500 tracking-widest uppercase">Loading attendance...</p>
      </div>
    );
  }

  const { member, checkInDates = [] } = data || {};
  const isCheckedInToday = checkInDates.some(d => new Date(d).toDateString() === new Date().toDateString());

  // Calendar
  const now = new Date();
  const year = now.getFullYear(), month = now.getMonth();
  const monthName = now.toLocaleDateString("en-PK", { month: "long", year: "numeric" });
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const offset = firstDay === 0 ? 6 : firstDay - 1;
  const calDays = [...Array(offset).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const initials = member?.name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "ME";

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-zinc-900 text-neutral-100 font-sans selection:bg-red-500 selection:text-white">
      <Script src="https://unpkg.com/html5-qrcode" strategy="lazyOnload" />
      <Sidebar active="Attendance" member={member} />

      <div className="lg:ml-60 flex flex-col min-h-screen pt-14 lg:pt-0">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-gradient-to-b from-black/80 to-transparent backdrop-blur-md border-b border-zinc-900/60 px-5 sm:px-8 py-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-red-500">Member Portal</p>
            <h1 className="text-lg sm:text-xl font-black uppercase tracking-tight text-white mt-0.5 leading-none">Attendance</h1>
          </div>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center font-black text-sm text-white shadow-lg shadow-red-500/20">
            {initials}
          </div>
        </header>

        <main className="flex-1 px-5 sm:px-8 py-6 space-y-6 max-w-5xl mx-auto w-full">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">⚠️ {error}</div>
          )}
          {locError && (
            <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 rounded-xl text-sm">📍 {locError}</div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            {/* Calendar */}
            <div className="md:col-span-2 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 p-5 transition">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-black text-white uppercase tracking-tight text-sm">Attendance Log</h3>
                  <div className="flex items-center gap-2 mt-1.5">
                    <div className="h-0.5 w-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-full" />
                    <div className="h-0.5 w-6 bg-zinc-700/60 rounded-full" />
                  </div>
                </div>
                <span className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full font-semibold">{monthName}</span>
              </div>
              {/* Weekday headers */}
              <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-zinc-500 pb-2 border-b border-zinc-800/60 mb-3">
                {WEEKDAYS.map(d => <div key={d}>{d}</div>)}
              </div>
              {/* Days */}
              <div className="grid grid-cols-7 gap-2 text-center">
                {calDays.map((day, idx) => {
                  if (!day) return <div key={`e-${idx}`} className="aspect-square" />;
                  const checked = checkInDates.some(d => { const dt = new Date(d); return dt.getDate() === day && dt.getMonth() === month && dt.getFullYear() === year; });
                  const isToday = day === now.getDate() && month === now.getMonth() && year === now.getFullYear();
                  return (
                    <div key={day} className={`aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-semibold relative transition-all
                      ${checked ? "bg-gradient-to-br from-emerald-500/20 to-teal-650/10 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/5"
                      : isToday ? "bg-zinc-800 text-white border border-red-500/50 shadow-md shadow-red-500/5"
                      : "bg-zinc-950/40 text-zinc-400 border border-zinc-900 hover:border-zinc-800"}`}>
                      {day}
                      {checked && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 absolute bottom-1" />}
                    </div>
                  );
                })}
              </div>
              {/* Legend */}
              <div className="mt-6 pt-4 border-t border-zinc-800/60 flex items-center justify-between text-xs text-zinc-500">
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500/30" />Checked In</div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-zinc-950/40 border border-zinc-900" />Absent</div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded bg-zinc-800 border border-red-500/50" />Today</div>
              </div>
            </div>

            {/* Check-in Panel */}
            <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 p-5 flex flex-col min-h-[350px] transition">
              <h3 className="font-black text-white uppercase tracking-tight text-sm mb-1">Today's Session</h3>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-0.5 w-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-full" />
                <div className="h-0.5 w-6 bg-zinc-700/60 rounded-full" />
              </div>
              <p className="text-xs text-zinc-500 mb-5">Mark your attendance in the gym</p>

              {isCheckedInToday ? (
                <div className="text-center py-10 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4">
                  <span className="text-4xl block mb-2">✅</span>
                  <h4 className="font-bold text-sm text-white">Attendance Confirmed</h4>
                  <p className="text-xs text-zinc-500 mt-1">Already checked in for today. Keep pushing!  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {scanning && (
                    <div className="space-y-2">
                      <div id="reader" className="w-full overflow-hidden rounded-xl border border-zinc-800 bg-black" style={{ minHeight: "200px" }} />
                      <button onClick={stopScanner}
                        className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-xl text-xs transition cursor-pointer">
                        Cancel Scanning
                      </button>
                    </div>
                  )}

                  {!scanning && (
                    <div className="text-center py-6 bg-zinc-950/50 rounded-2xl border border-zinc-800/60 p-4 space-y-4">
                      <span className="text-4xl block">📅</span>
                      <div>
                        <p className="text-sm font-semibold text-white">Scan Session QR Code</p>
                        <p className="text-xs text-zinc-500 mt-1">Open camera to scan the check-in QR code inside the gym.</p>
                        {coords && (
                          <div className="text-[10px] text-zinc-500 bg-zinc-950 border border-zinc-800/60 p-2 rounded leading-relaxed mt-2.5 max-w-xs mx-auto">
                            📍 <b>My Location:</b><br />
                            <span className="text-zinc-400">{readableAddr || "Resolving address..."}</span>
                          </div>
                        )}
                      </div>
                      <button disabled={!coords} onClick={startScanner}
                        className="w-full py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 disabled:opacity-50 text-white font-bold rounded-xl text-sm shadow-lg shadow-red-500/20 transition cursor-pointer">
                        {!coords ? "Waiting for GPS..." : "📷 Start Camera Scan"}
                      </button>
                    </div>
                  )}

                  {checkingIn && (
                    <div className="flex items-center justify-center gap-2 py-2 text-xs text-zinc-400">
                      <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
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

        <footer className="border-t border-zinc-900 px-6 py-5 text-center text-xs text-zinc-600 mt-auto">
          © {new Date().getFullYear()} Fitcore — Member Portal
        </footer>
      </div>
    </div>
  );
}
