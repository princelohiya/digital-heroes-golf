"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // Analytics State
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeSubscribers: 0,
    estimatedPrizePool: 0,
  });

  useEffect(() => {
    verifyAdminAndFetchData();
  }, []);

  const verifyAdminAndFetchData = async () => {
    try {
      // 1. Check Auth & Role
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/auth");
        return;
      }

      const { data: profile } = await supabase
        .from("users")
        .select("role")
        .eq("id", session.user.id)
        .single();

      // CRITICAL: Kick them out if they aren't an admin!
      if (profile?.role !== "admin") {
        router.push("/dashboard");
        return;
      }

      // 2. Fetch Analytics
      const { data: users, error } = await supabase
        .from("users")
        .select("subscription_status");
      if (error) throw error;

      const total = users.length;
      const active = users.filter(
        (u) => u.subscription_status === "active",
      ).length;

      // Assuming $5 of every $19 monthly sub goes to the prize pool for this calculation
      const prizePool = active * 5;

      setStats({
        totalUsers: total,
        activeSubscribers: active,
        estimatedPrizePool: prizePool,
      });
    } catch (error) {
      console.error("Admin Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex justify-center items-center">
        Verifying Admin Access...
      </div>
    );

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex justify-between items-center border-b border-neutral-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-purple-400">
              Admin Control Center
            </h1>
            <p className="text-neutral-400 mt-1">
              Manage users, run draw simulations, and verify winners.
            </p>
          </div>
          <button
            onClick={() => router.push("/dashboard")}
            className="text-sm text-neutral-400 hover:text-white"
          >
            Exit to User Dashboard
          </button>
        </header>

        {/* Analytics Overview  */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
            <h3 className="text-neutral-400 text-sm font-medium">
              Total Registered Users
            </h3>
            <p className="text-4xl font-bold mt-2">{stats.totalUsers}</p>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
            <h3 className="text-neutral-400 text-sm font-medium">
              Active Subscribers
            </h3>
            <p className="text-4xl font-bold text-green-400 mt-2">
              {stats.activeSubscribers}
            </p>
          </div>
          <div className="bg-neutral-900 border border-purple-500/30 p-6 rounded-2xl shadow-[0_0_15px_rgba(168,85,247,0.1)]">
            <h3 className="text-purple-400 text-sm font-medium">
              Estimated Prize Pool
            </h3>
            <p className="text-4xl font-bold mt-2">
              ${stats.estimatedPrizePool.toLocaleString()}
            </p>
          </div>
        </div>

        {/* Action Modules */}
        <div className="grid md:grid-cols-2 gap-8 mt-8">
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl flex flex-col items-start">
            <h2 className="text-xl font-bold mb-2">Draw Management</h2>
            <p className="text-neutral-400 text-sm mb-6">
              Run monthly simulations (Random or Algorithmic) before officially
              publishing the winning numbers.
            </p>
            <button
              onClick={() => router.push("/admin/draws")}
              className="mt-auto bg-purple-600 hover:bg-purple-700 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Open Draw Engine &rarr;
            </button>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl flex flex-col items-start">
            <h2 className="text-xl font-bold mb-2">Winner Verification</h2>
            <p className="text-neutral-400 text-sm mb-6">
              Review user-uploaded score screenshots and approve payouts.
            </p>
            <button
              onClick={() => router.push("/admin/verification")}
              className="mt-auto bg-neutral-800 hover:bg-neutral-700 px-6 py-3 border border-neutral-700 rounded-lg font-medium transition-colors"
            >
              Review Pending Winners
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
