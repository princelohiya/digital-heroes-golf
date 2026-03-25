"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import UserBadge from "@/components/UserBadge";

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // Analytics State
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPrizePool, setTotalPrizePool] = useState(0);
  const [publishedDraws, setPublishedDraws] = useState(0);

  useEffect(() => {
    verifyAdminAndFetchStats();
  }, []);

  const verifyAdminAndFetchStats = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return router.push("/auth");

    const { data: profile } = await supabase
      .from("users")
      .select("role")
      .eq("id", session.user.id)
      .single();
    if (profile?.role !== "admin") return router.push("/dashboard");

    // Fetch Analytics Data in parallel
    const [usersRes, drawsRes] = await Promise.all([
      supabase.from("users").select("id", { count: "exact" }),
      supabase.from("draws").select("total_prize_pool, status"),
    ]);

    if (usersRes.count) setTotalUsers(usersRes.count);

    if (drawsRes.data) {
      const published = drawsRes.data.filter((d) => d.status === "published");
      setPublishedDraws(published.length);

      const totalPool = published.reduce(
        (sum, draw) => sum + Number(draw.total_prize_pool),
        0,
      );
      setTotalPrizePool(totalPool);
    }

    setLoading(false);
  };

  if (loading)
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex justify-center items-center">
        Loading Admin Environment...
      </div>
    );

  // PRD Requirement: Charity Contribution is exactly 10% of the total prize pool generated
  const charityTotal = totalPrizePool * 0.1;

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-neutral-800 pb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Admin Control Center
            </h1>
            <p className="text-neutral-400 mt-1">
              Platform analytics, draw engine, and user management.
            </p>
          </div>
          <UserBadge />
        </header>

        {/* LIVE ANALYTICS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
            <h3 className="text-neutral-400 text-sm font-medium mb-2">
              Total Users
            </h3>
            <p className="text-3xl font-bold text-white">{totalUsers}</p>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
            <h3 className="text-neutral-400 text-sm font-medium mb-2">
              Historical Prize Pool
            </h3>
            <p className="text-3xl font-bold text-green-400">
              ${totalPrizePool.toLocaleString()}
            </p>
          </div>
          <div className="bg-purple-900/10 border border-purple-900/30 p-6 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl"></div>
            <h3 className="text-purple-300 text-sm font-medium mb-2 relative z-10">
              Total Charity Impact (10%)
            </h3>
            <p className="text-3xl font-bold text-purple-400 relative z-10">
              ${charityTotal.toLocaleString()}
            </p>
          </div>
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
            <h3 className="text-neutral-400 text-sm font-medium mb-2">
              Published Draws
            </h3>
            <p className="text-3xl font-bold text-white">{publishedDraws}</p>
          </div>
        </div>

        {/* ACTION MODULES */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          {/* Draw Engine */}
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl flex flex-col items-start">
            <h2 className="text-xl font-bold mb-2 text-white">Draw Engine</h2>
            <p className="text-neutral-400 text-sm mb-6">
              Run draft simulations, configure algorithmic logic, and publish
              official monthly winning numbers.
            </p>
            <button
              onClick={() => router.push("/admin/draw-engine")}
              className="mt-auto bg-white text-black hover:bg-neutral-200 px-6 py-3 rounded-lg font-bold transition-colors w-full sm:w-auto"
            >
              Launch Draw Engine
            </button>
          </div>

          {/* Winners & Verification */}
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl flex flex-col items-start">
            <h2 className="text-xl font-bold mb-2">Winners & Verification</h2>
            <p className="text-neutral-400 text-sm mb-6">
              Review pending score uploads in the queue, or view the master
              ledger of all historical payouts.
            </p>
            <div className="mt-auto flex flex-col sm:flex-row gap-3 w-full">
              <button
                onClick={() => router.push("/admin/verification")}
                className="flex-1 bg-purple-600 hover:bg-purple-700 px-4 py-3 rounded-lg font-bold transition-colors text-sm text-center"
              >
                Pending Queue
              </button>
              <button
                onClick={() => router.push("/admin/winners")}
                className="flex-1 bg-neutral-800 hover:bg-neutral-700 px-4 py-3 border border-neutral-700 rounded-lg font-medium transition-colors text-sm text-center"
              >
                Master Ledger
              </button>
            </div>
          </div>

          {/* User & Score Management */}
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl flex flex-col items-start">
            <h2 className="text-xl font-bold mb-2">User & Score Management</h2>
            <p className="text-neutral-400 text-sm mb-6">
              Manage administrative roles, override subscription statuses, and
              audit or edit logged golf scores.
            </p>
            <div className="mt-auto flex flex-col sm:flex-row gap-3 w-full">
              <button
                onClick={() => router.push("/admin/users")}
                className="flex-1 bg-neutral-800 hover:bg-neutral-700 px-4 py-3 border border-neutral-700 rounded-lg font-medium transition-colors text-sm text-center"
              >
                Manage Users
              </button>
              <button
                onClick={() => router.push("/admin/scores")}
                className="flex-1 bg-blue-900/30 text-blue-400 hover:bg-blue-900/50 px-4 py-3 border border-blue-800 rounded-lg font-medium transition-colors text-sm text-center"
              >
                Score Editor
              </button>
            </div>
          </div>

          {/* Charity Directory */}
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl flex flex-col items-start">
            <h2 className="text-xl font-bold mb-2">Charity Directory</h2>
            <p className="text-neutral-400 text-sm mb-6">
              Add, edit, and delete charitable organizations from the platform,
              and manage their featured status.
            </p>
            <button
              onClick={() => router.push("/admin/charities")}
              className="mt-auto bg-neutral-800 hover:bg-neutral-700 px-6 py-3 border border-neutral-700 rounded-lg font-medium transition-colors w-full sm:w-auto text-center"
            >
              Manage Charities
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
