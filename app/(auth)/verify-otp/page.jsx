"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "../../../context/AppContext";
import Input from "../../../components/Input";
import Button from "../../../components/Button";
import Card from "../../../components/Card";

export default function VerifyOtpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(30); // 30 seconds timer
  const { user } = useAppContext(); // Example usage of context
  // Timer effect — delete unverified record when time runs out
  useEffect(() => {
    if (timer === 0) {
      // Clean up the unverified user from DB
      if (email) {
        fetch("/api/auth/cleanup-unverified", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }).catch(() => {});
      }
      alert("OTP expired. Please sign up again.");
      router.push("/Login");
      return;
    }
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer, router, email]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Email verified successfully!");
        router.push("/Login"); // Redirect to login page after successful verification
      } else {
        alert(data.message || "Verification failed");
      }
    } catch (err) {
      alert("Error verifying OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950">
      <Card>
        <h2 className="text-3xl font-black text-white mb-8 text-center tracking-tight">
          Verify <span className="text-red-600">OTP</span>
        </h2>
        <div className="mb-4 text-center text-white">
          {timer > 0 ? `Time left: ${timer}s` : "Redirecting to login..."}
        </div>
        <form className="space-y-6" onSubmit={handleVerify}>
          <Input
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
          />
          <Input
            name="otp"
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="OTP"
            required
          />
          <Button type="submit" disabled={loading}>
            {loading ? "Verifying..." : "Verify"}
          </Button>
        </form>
      </Card>
    </div>
  );
}