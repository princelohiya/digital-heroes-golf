"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function DrawEnginePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Draw State
  const [activeDraftId, setActiveDraftId] = useState<string | null>(null);
  const [simulationResult, setSimulationResult] = useState<number[]>([]);

  // Secure the route: Only Admins allowed
  useEffect(() => {
    const checkAdmin = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return router.push("/auth");

      const { data } = await supabase
        .from("users")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (data?.role !== "admin") router.push("/dashboard");
    };
    checkAdmin();
  }, [router]);

  // --- STANDARD RANDOM LOGIC ---
  const runRandomSimulation = async () => {
    setLoading(true);
    try {
      // 1. Generate 5 unique numbers between 1 and 45 (Stableford range) [cite: 44-45, 53]
      const nums = new Set<number>();
      while (nums.size < 5) {
        nums.add(Math.floor(Math.random() * 45) + 1);
      }

      // Sort them numerically for a cleaner display
      const results = Array.from(nums).sort((a, b) => a - b);

      // 2. Save to database as a 'draft'
      await saveDraft(results);
    } catch (error: any) {
      alert(error.message);
      setLoading(false);
    }
  };

  // --- DATABASE SAVING ---
  const saveDraft = async (numbers: number[]) => {
    try {
      // Use the 1st of the current month as the draw identifier (e.g., "2026-03-01")
      const today = new Date();
      const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
        .toISOString()
        .split("T")[0];

      // If we already ran a simulation this session, delete the old draft so we don't clutter the database
      if (activeDraftId) {
        await supabase.from("draws").delete().eq("id", activeDraftId);
      }

      // Insert the new Draft [cite: 63]
      const { data, error } = await supabase
        .from("draws")
        .insert([
          {
            draw_month: firstDayOfMonth,
            status: "draft",
            winning_numbers: numbers,
            total_prize_pool: 5000, // Placeholder: In production, dynamically calculate this based on active subs
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setSimulationResult(numbers);
      setActiveDraftId(data.id);
    } catch (error: any) {
      alert("Error saving draft: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const publishDraw = async () => {
    if (!activeDraftId) return;
    setLoading(true);
    try {
      // Call our secure backend engine
      const res = await fetch("/api/draws/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ drawId: activeDraftId }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      alert(data.message);
      router.push("/admin");
    } catch (error: any) {
      alert("Failed to publish: " + error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex justify-between items-center border-b border-neutral-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-purple-400">
              Draw Engine
            </h1>
            <p className="text-neutral-400 mt-1">
              Run simulations and publish the monthly results.
            </p>
          </div>
          <button
            onClick={() => router.push("/admin")}
            className="text-sm text-neutral-400 hover:text-white cursor-pointer"
          >
            &larr; Back to Admin
          </button>
        </header>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Controls */}
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl flex flex-col justify-center space-y-6">
            <div>
              <h2 className="text-xl font-semibold">Simulation Mode</h2>
              <p className="text-sm text-neutral-400 mt-2">
                Generate 5 random winning numbers. This runs in draft mode—users
                will not see these numbers until you click Publish.
              </p>
            </div>

            <button
              onClick={runRandomSimulation}
              disabled={loading}
              className="cursor-pointer w-full bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 py-4 rounded-xl font-medium transition-colors text-lg"
            >
              {loading ? "Generating..." : "Run Random Draw"}
            </button>
          </div>

          {/* Results Display */}
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl flex flex-col">
            <h2 className="text-xl font-semibold mb-6">Draft Results</h2>

            {simulationResult.length > 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center space-y-8">
                {/* The Winning Numbers UI */}
                <div className="flex gap-3">
                  {simulationResult.map((num, i) => (
                    <div
                      key={i}
                      className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-neutral-800 border-2 border-purple-500 flex items-center justify-center text-xl font-bold shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                    >
                      {num}
                    </div>
                  ))}
                </div>

                <div className="w-full pt-6 mt-auto border-t border-neutral-800">
                  <button
                    onClick={publishDraw}
                    disabled={loading}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-xl shadow-lg transition-transform hover:scale-[1.02] cursor-pointer"
                  >
                    Publish Official Results
                  </button>
                  <p className="text-xs text-neutral-500 text-center mt-3">
                    Warning: Publishing is permanent and will trigger the winner
                    matching system.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-neutral-600">
                Run a simulation to view numbers.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
