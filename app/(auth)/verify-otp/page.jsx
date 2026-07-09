"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "../../../components/Input";
import Button from "../../../components/Button";
import Card from "../../../components/Card";

export default function VerifyOtpPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  // OTP verification flow disabled. Keep the old timer logic commented out.
  // const [timer, setTimer] = useState(30);
  // useEffect(() => {
  //   if (timer === 0) {
  //     if (email) {
  //       fetch("/api/auth/cleanup-unverified", {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify({ email }),
  //       }).catch(() => {});
  //     }
  //     alert("OTP expired. Please sign up again.");
  //     router.push("/Login");
  //     return;
  //   }
  //   const interval = setInterval(() => {
  //     setTimer((prev) => prev - 1);
  //   }, 1000);
  //   return () => clearInterval(interval);
  // }, [timer, router, email]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // OTP API call disabled. Keep the old request commented out.
      // const res = await fetch("/api/auth/verify-otp", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ email, otp }),
      // });
      // const data = await res.json();

      if (otp !== "0000") {
        alert("Enter 0000 to continue without OTP verification.");
        return;
      }

      alert("OTP bypass accepted. You can log in now.");
      router.push("/Login");
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
          Verify <span className="text-red-600">Access</span>
        </h2>
        <p className="mb-4 text-center text-zinc-400 text-sm">OTP is disabled here. Enter 0000 to continue.</p>
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
            placeholder="0000"
            required
          />
          <Button type="submit" disabled={loading}>
            {loading ? "Continuing..." : "Continue"}
          </Button>
        </form>
      </Card>
    </div>
  );
}