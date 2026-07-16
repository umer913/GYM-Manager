"use client";

import Link from "next/link";
import { useState } from "react";
import { useAppContext } from "../../../context/AppContext";
import { useRouter } from "next/navigation";
import Input from "../../../components/Input";
import Button from "../../../components/Button";
import Card from "../../../components/Card";
import { useToast } from "../../../components/ui/UIProvider";

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAppContext();
  const toast = useToast();
  const [form, setForm] = useState({ email: "", password: "", });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Login failed");
        setLoading(false); // ✅ FIX
        return;
      }

      toast.success("Login successful!");
      localStorage.setItem("token", data.token);
      setUser(data.user); // Store full user object (name, email, role)

      // Role-based routing
      if (data.user.role === "Manager") {
        router.push("/GymManagerDashboard");
      } else if (data.user.role === "trainer") {
        router.push("/TrainerDashboard");
      } else {
        router.push("/MemberDashboard");
      }

    } catch (err) {
      toast.error("Something went wrong");
    } finally {
      setLoading(false); // ✅ always runs
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(239,68,68,0.12),_transparent_35%),linear-gradient(180deg,_#09090b_0%,_#111111_100%)] px-4 py-10">
      <Card className="relative overflow-hidden border-zinc-800/80 bg-zinc-950/95">
        <div className="absolute -top-24 -right-24 w-56 h-56 rounded-full bg-gradient-to-br from-red-600/20 to-orange-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="text-center mb-8">
            <p className="text-[11px] uppercase tracking-[0.3em] text-red-400/80 font-bold">Fitcore Access</p>
            <h2 className="text-3xl font-black text-white mt-3 tracking-tight">
              Sign in to <span className="text-red-500">Fitcore</span>
            </h2>
            <p className="text-sm text-zinc-500 mt-3 max-w-sm mx-auto">Welcome back. Log in to continue your fitness journey.</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <Input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Email"
              required
            />
            <Input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Password"
              required
            />

            <Button type="submit" disabled={loading} className="mt-2">
              {loading ? "Logging in..." : "Log In"}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <span className="text-zinc-400">Don't have an account?</span>{" "}
            <Link href="/Signup" className="text-red-500 hover:underline font-semibold">
              Sign up
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}