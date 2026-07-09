"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Input from "../../../components/Input";
import Button from "../../../components/Button";
import Card from "../../../components/Card";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          phone: form.phone || "0000000000",
        }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || "Signup successful!");
        router.push("/Login");
      } else {
        alert(data.message || "Signup failed");
      }
    } catch {
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false);
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
              Create your <span className="text-red-500">Fitcore</span> account
            </h2>
            <p className="text-sm text-zinc-500 mt-3 max-w-sm mx-auto">Join Fitcore and start your fitness journey today.</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <Input name="name" type="text" value={form.name} onChange={handleChange} placeholder="Full name" required />
            <Input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email" required />
            <Input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Password" required />
            <Input name="phone" type="text" value={form.phone} onChange={handleChange} placeholder="Phone" required />

            <Button type="submit" disabled={loading} className="mt-2">
              {loading ? "Signing Up..." : "Sign Up"}
            </Button>
          </form>

          <div className="mt-8 text-center">
            <span className="text-zinc-400">Already have an account?</span>{" "}
            <Link href="/Login" className="text-red-500 hover:underline font-semibold">Log in</Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
