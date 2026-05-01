"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppContext } from "../../context/AppContext";

export default function DashboardPage() {
  const router = useRouter();
  const { user } = useAppContext();
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    }
  }, [router]);
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-red-500">
          Dashboard
        </h1>
        <p className="mt-4 text-zinc-300">
          Welcome to Fitcore Gym System
        </p>
        {user && (
          <div className="mt-4 text-green-400">Logged in as: {user.email}</div>
        )}
      </div>
    </div>
  );
}