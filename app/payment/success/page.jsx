"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiCall } from "../../../utils/api";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const params = useSearchParams();
  const sessionId = params.get("session_id");
  const type = params.get("type");

  const [state, setState] = useState("verifying"); // verifying | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!sessionId) { setState("error"); setMessage("Invalid session."); return; }

    (async () => {
      const { data, ok } = await apiCall("/api/payment/verify", {
        method: "POST",
        body: JSON.stringify({ sessionId }),
      });

      if (ok && data.success) {
        setState("success");
        setMessage(data.message || "Payment successful!");
      } else {
        setState("error");
        setMessage(data.message || "Verification failed.");
      }
    })();
  }, [sessionId]);

  const redirect = () => {
    if (type === "plan") router.push("/MemberDashboard/Plans");
    else router.push("/MemberDashboard/store");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-zinc-900 flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center space-y-5 shadow-2xl">

        {state === "verifying" && (
          <>
            <div className="w-14 h-14 border-4 border-red-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-white font-bold">Verifying payment...</p>
            <p className="text-xs text-zinc-500">Please wait, do not close this page.</p>
          </>
        )}

        {state === "success" && (
          <>
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-tight">Payment Successful</h2>
              <p className="text-sm text-zinc-400 mt-2">{message}</p>
            </div>
            <button onClick={redirect}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold text-sm shadow-lg shadow-red-500/20 transition cursor-pointer">
              {type === "plan" ? "View My Plans" : "View My Orders"}
            </button>
          </>
        )}

        {state === "error" && (
          <>
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div>
              <h2 className="text-xl font-black text-white uppercase tracking-tight">Something went wrong</h2>
              <p className="text-sm text-zinc-400 mt-2">{message}</p>
            </div>
            <button onClick={redirect}
              className="w-full py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-sm transition cursor-pointer border border-zinc-700">
              Go Back
            </button>
          </>
        )}

      </div>
    </div>
  );
}
