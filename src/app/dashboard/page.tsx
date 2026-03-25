"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

// Define our TypeScript interfaces for the database rows
interface Profile {
  subscription_status: string;
  role: string;
}

interface Score {
  id: string;
  score_value: number;
  played_date: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [scores, setScores] = useState<Score[]>([]);

  // Form states
  const [newScore, setNewScore] = useState("");
  const [playedDate, setPlayedDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    checkUserAndFetchData();
  }, []);

  const checkUserAndFetchData = async () => {
    try {
      // 1. Check if user is logged in
      const {
        data: { session },
      } = await supabase.auth.getSession();

      // if user is not logged in, redirect to auth page
      if (!session) {
        router.push("/auth");
        return;
      }

      const userId = session.user.id;

      // 2. Fetch User Profile
      const { data: profileData } = await supabase
        .from("users")
        .select("subscription_status, role")
        .eq("id", userId)
        .single();

      if (profileData) setProfile(profileData);

      // 3. Fetch Scores (Reverse Chronological Order)
      const { data: scoreData } = await supabase
        .from("scores")
        .select("*")
        .eq("user_id", userId)
        .order("played_date", { ascending: false });

      if (scoreData) setScores(scoreData);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleScoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const scoreVal = parseInt(newScore);

      // PRD Logic: Enforce 5-score limit
      // If the user already has 5 (or more) scores, delete the oldest one before inserting the new one.
      if (scores.length >= 5) {
        // Since 'scores' is sorted newest-first, the oldest is at the end of the array
        const oldestScore = scores[scores.length - 1];
        await supabase.from("scores").delete().eq("id", oldestScore.id);
      }

      // Insert the new score
      const { error: insertError } = await supabase.from("scores").insert([
        {
          user_id: session.user.id,
          score_value: scoreVal,
          played_date: playedDate,
        },
      ]);

      if (insertError) throw insertError;

      // Reset form and refresh data
      setNewScore("");
      setPlayedDate("");
      await checkUserAndFetchData();
    } catch (error: any) {
      alert(error.message || "Failed to submit score");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Section */}
        <header className="flex justify-between items-center border-b border-neutral-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Your Dashboard
            </h1>
            <p className="text-neutral-400 mt-1">
              Status:{" "}
              <span
                className={`font-semibold ${profile?.subscription_status === "active" ? "text-green-400" : "text-yellow-400"}`}
              >
                {profile?.subscription_status.toUpperCase()}
              </span>
            </p>
          </div>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.push("/auth");
            }}
            className="text-sm text-neutral-400 hover:text-white transition-colors"
          >
            Sign Out
          </button>
        </header>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Score Entry Form */}
          <section className="bg-neutral-900 p-6 rounded-2xl border border-neutral-800">
            <h2 className="text-xl font-semibold mb-4">Log a Score</h2>
            <form onSubmit={handleScoreSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-neutral-400 mb-1">
                  Score (Stableford)
                </label>
                <input
                  type="number"
                  min="1"
                  max="45"
                  required
                  value={newScore}
                  onChange={(e) => setNewScore(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="e.g. 36"
                />
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-1">
                  Date Played
                </label>
                <input
                  type="date"
                  required
                  value={playedDate}
                  onChange={(e) => setPlayedDate(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none [color-scheme:dark]"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {submitting ? "Saving..." : "Submit Score"}
              </button>
            </form>
          </section>

          {/* Performance History (Latest 5) */}
          <section className="bg-neutral-900 p-6 rounded-2xl border border-neutral-800">
            <h2 className="text-xl font-semibold mb-4">Recent Performance</h2>
            <div className="space-y-3">
              {scores.length === 0 ? (
                <p className="text-neutral-500 text-sm">
                  No scores logged yet. Your last 5 scores will appear here.
                </p>
              ) : (
                scores.map((score, index) => (
                  <div
                    key={score.id}
                    className="flex justify-between items-center bg-neutral-950 p-4 rounded-lg border border-neutral-800"
                  >
                    <span className="text-neutral-400 text-sm">
                      {new Date(score.played_date).toLocaleDateString()}
                    </span>
                    <span className="text-lg font-bold text-blue-400">
                      {score.score_value}{" "}
                      <span className="text-xs text-neutral-500 font-normal">
                        pts
                      </span>
                    </span>
                  </div>
                ))
              )}
            </div>
            <p className="text-xs text-neutral-500 mt-4 text-center">
              Only your 5 most recent scores are retained for the monthly draw.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
