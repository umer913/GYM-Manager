"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const [form, setForm] = useState({ email: "", Name: "", password: "", phone: "", role: "member" });
  const [loading, setLoading] = useState(false);
const router = useRouter();
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.Name,
          email: form.email,
          password: form.password,
          phone: form.phone || "0000000000",
          role: form.role || "member"
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || "Signup successful! Please check your email for OTP.");
        setForm({ email: "", Name: "", password: "", phone: "", role: "member" });
         router.push("/verify-otp");
      } else {
        alert(data.message || "Signup failed");
      }
    } catch (err) {
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950">
      <div className="w-full max-w-md bg-zinc-900 rounded-2xl shadow-2xl p-10 border border-zinc-800">
        <h2 className="text-3xl font-black text-white mb-8 text-center tracking-tight">
          Create your <span className="text-red-600">Fitcore</span> account
        </h2>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-zinc-300 font-semibold mb-2">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-zinc-800 text-white border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-red-600 transition"
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label htmlFor="Name" className="block text-zinc-300 font-semibold mb-2">
              Name
            </label>
            <input
              id="Name"
              name="Name"
              type="text"
              autoComplete="name"
              required
              value={form.Name}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-zinc-800 text-white border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-red-600 transition"
              placeholder="Enter your name"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-zinc-300 font-semibold mb-2">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={form.password}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg bg-zinc-800 text-white border border-zinc-700 focus:outline-none focus:ring-2 focus:ring-red-600 transition"
              placeholder="Create a password"
            />
          </div>
          {/* Optionally add phone and role fields here */}
          <button
            type="submit"
            className="w-full py-3 mt-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition text-lg shadow-md"
            disabled={loading}
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </button>
        </form>
        <div className="mt-8 text-center">
          <span className="text-zinc-400">Already have an account?</span>{' '}
          <Link href="/Login" className="text-red-500 hover:underline font-semibold">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
}
