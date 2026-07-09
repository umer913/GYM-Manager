"use client";

import Link from "next/link";
import { useState } from "react";
import { useAppContext } from "../../../context/AppContext";
import { useRouter } from "next/navigation";
import Input from "../../../components/Input";
import Button from "../../../components/Button";
import Card from "../../../components/Card";

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAppContext();
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
        alert(data.message || "Login failed");
        setLoading(false); // ✅ FIX
        return;
      }

      alert("Login successful");
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
      alert("Something went wrong");
    } finally {
      setLoading(false); // ✅ always runs
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950">
      <Card>
        <h2 className="text-3xl font-black text-white mb-8 text-center">
          Sign In to <span className="text-red-600">Fitcore</span>
        </h2>
        <form className="space-y-6" onSubmit={handleSubmit}>
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
          <Button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>
        <div className="mt-8 text-center">
          <span className="text-zinc-400">Don't have an account?</span>{" "}
          <Link href="/Signup" className="text-red-500">
            Sign up
          </Link>
        </div>
      </Card>
    </div>
  );
}