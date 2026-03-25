"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import UserBadge from "@/components/UserBadge";
import Link from "next/link";

export default function UserDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // Data States
  const [profile, setProfile] = useState<any>(null);
  const [scores, setScores] = useState<any[]>([]);
  const [winnings, setWinnings] = useState<any[]>([]);
  const [charities, setCharities] = useState<any[]>([]);

  // Interaction States
  const [newScore, setNewScore] = useState("");
  const [editingScoreId, setEditingScoreId] = useState<string | null>(null);
  const [editScoreValue, setEditScoreValue] = useState<string>("");
  const [isSavingCharity, setIsSavingCharity] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return router.push("/auth");

    // Fetch User Profile
    const { data: userData } = await supabase
      .from("users")
      .select("*")
      .eq("id", session.user.id)
      .single();
    setProfile(userData);

    // Fetch Scores
    const { data: scoreData } = await supabase
      .from("scores")
      .select("*")
      .eq("user_id", session.user.id)
      .order("played_date", { ascending: false });
    if (scoreData) setScores(scoreData);

    // Fetch Winnings Overview
    const { data: winningData } = await supabase
      .from("winners")
      .select("prize_amount, payment_status")
      .eq("user_id", session.user.id);
    if (winningData) setWinnings(winningData);

    // Fetch Charities for dropdown
    const { data: charityData } = await supabase
      .from("charities")
      .select("id, name")
      .order("name");
    if (charityData) setCharities(charityData);

    setLoading(false);
  };

  // --- ACTIONS ---

  const handleLogScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    const {
      data: { session },
    } = await supabase.auth.getSession();

    await supabase
      .from("scores")
      .insert([
        {
          user_id: session?.user.id,
          score_value: parseInt(newScore),
          played_date: new Date().toISOString().split("T")[0],
        },
      ]);
    setNewScore("");
    fetchDashboardData();
  };

  const handleEditScore = async (scoreId: string) => {
    await supabase
      .from("scores")
      .update({ score_value: parseInt(editScoreValue) })
      .eq("id", scoreId);
    setEditingScoreId(null);
    fetchDashboardData();
  };

  const handleSelectCharity = async (charityId: string) => {
    setIsSavingCharity(true);
    await supabase
      .from("users")
      .update({ selected_charity_id: charityId })
      .eq("id", profile.id);
    fetchDashboardData();
    setIsSavingCharity(false);
  };

  // --- CALCULATIONS ---

  const totalWon = winnings.reduce((sum, w) => sum + Number(w.prize_amount), 0);
  const pendingPayouts = winnings
    .filter((w) => w.payment_status !== "paid")
    .reduce((sum, w) => sum + Number(w.prize_amount), 0);

  // Calculate entries this month (Participation Summary)
  const currentMonth = new Date().getMonth();
  const scoresThisMonth = scores.filter(
    (s) => new Date(s.played_date).getMonth() === currentMonth,
  ).length;

  // Mock Renewal Date (1st of next month)
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1, 1);

  if (loading)
    return (
      <div className="min-h-screen bg-neutral-950 flex justify-center items-center text-white">
        Loading Dashboard...
      </div>
    );

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-neutral-800 pb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Member Dashboard
            </h1>
            <p className="text-neutral-400 mt-1">
              Manage your subscription, entries, and impact.
            </p>
          </div>
          <UserBadge />
        </header>

        {/* TOP ROW: Sub Status, Charity, Winnings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 1. Subscription Status */}
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl flex flex-col">
            <h3 className="text-neutral-400 text-sm font-medium mb-4">
              Subscription Status
            </h3>
            <div className="flex items-center gap-3 mb-2">
              <span
                className={`w-3 h-3 rounded-full ${profile?.subscription_status === "active" ? "bg-green-500" : "bg-red-500"}`}
              ></span>
              <span className="text-2xl font-bold capitalize">
                {profile?.subscription_status || "Inactive"}
              </span>
            </div>
            <p className="text-neutral-500 text-sm mt-auto">
              Plan:{" "}
              <span className="text-white capitalize">
                {profile?.subscription_plan || "None"}
              </span>
            </p>
            <p className="text-neutral-500 text-sm">
              Renewal Date:{" "}
              <span className="text-white">
                {nextMonth.toLocaleDateString()}
              </span>
            </p>
          </div>

          {/* 2. Selected Charity & Contribution */}
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl flex flex-col">
            <h3 className="text-neutral-400 text-sm font-medium mb-4">
              Your Impact Target
            </h3>
            <p className="text-3xl font-bold text-emerald-400 mb-1">
              10%{" "}
              <span className="text-sm font-normal text-neutral-500">
                of prize pool
              </span>
            </p>
            <p className="text-neutral-500 text-sm mb-3">
              Guaranteed contribution.
            </p>

            <select
              className="mt-auto w-full bg-neutral-950 border border-neutral-700 rounded-lg p-2 text-sm text-white focus:border-emerald-500 outline-none"
              value={profile?.selected_charity_id || ""}
              onChange={(e) => handleSelectCharity(e.target.value)}
              disabled={isSavingCharity}
            >
              <option value="" disabled>
                Select a Charity...
              </option>
              {charities.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Winnings Overview */}
          <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl flex flex-col">
            <h3 className="text-neutral-400 text-sm font-medium mb-4">
              Winnings Overview
            </h3>
            <p className="text-3xl font-bold text-white mb-1">
              $
              {totalWon.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
            <p className="text-neutral-500 text-sm mb-4">Lifetime Total Won</p>

            <div className="mt-auto flex justify-between items-center border-t border-neutral-800 pt-4">
              <span className="text-sm text-neutral-400">Pending Payouts:</span>
              <span className="text-sm font-bold text-yellow-500">
                $
                {pendingPayouts.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>
        </div>

        {/* MIDDLE ROW: Participation & Score Entry */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 4. Participation Summary */}
          <div className="md:col-span-1 bg-neutral-900 border border-neutral-800 p-6 rounded-2xl">
            <h3 className="text-neutral-400 text-sm font-medium mb-4">
              Participation Summary
            </h3>
            <div className="space-y-6">
              <div>
                <p className="text-4xl font-bold text-purple-400">
                  {scoresThisMonth}
                </p>
                <p className="text-neutral-500 text-sm mt-1">
                  Draw entries this month
                </p>
              </div>
              <div className="border-t border-neutral-800 pt-4">
                <p className="text-white font-medium">
                  {nextMonth.toLocaleDateString()}
                </p>
                <p className="text-neutral-500 text-sm mt-1">
                  Next scheduled algorithmic draw
                </p>
              </div>
            </div>
          </div>

          {/* 5. Score Entry & Edit Interface */}
          <div className="md:col-span-2 bg-neutral-900 border border-neutral-800 p-6 rounded-2xl flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold">Score Log & Edit Interface</h3>
              <form onSubmit={handleLogScore} className="flex gap-2">
                <input
                  type="number"
                  required
                  min="18"
                  max="144"
                  placeholder="Enter Score"
                  value={newScore}
                  onChange={(e) => setNewScore(e.target.value)}
                  className="bg-neutral-950 border border-neutral-700 rounded-lg px-3 py-1.5 text-sm w-32 focus:border-purple-500 outline-none text-white"
                />
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-1.5 rounded-lg text-sm font-bold transition-colors"
                >
                  Log Score
                </button>
              </form>
            </div>

            <div className="overflow-y-auto max-h-[250px] pr-2">
              {scores.length === 0 ? (
                <p className="text-neutral-500 text-center py-8">
                  No scores logged yet. Start playing!
                </p>
              ) : (
                <table className="w-full text-left text-sm">
                  <thead className="text-neutral-500 border-b border-neutral-800">
                    <tr>
                      <th className="pb-2 font-medium">Date Played</th>
                      <th className="pb-2 font-medium">Score</th>
                      <th className="pb-2 font-medium text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scores.map((score) => (
                      <tr
                        key={score.id}
                        className="border-b border-neutral-800/50 hover:bg-neutral-800/30"
                      >
                        <td className="py-3 text-neutral-300">
                          {new Date(score.played_date).toLocaleDateString()}
                        </td>
                        <td className="py-3 font-bold text-white">
                          {editingScoreId === score.id ? (
                            <input
                              type="number"
                              value={editScoreValue}
                              onChange={(e) =>
                                setEditScoreValue(e.target.value)
                              }
                              className="bg-neutral-950 border border-blue-500 rounded px-2 py-1 w-20 text-white outline-none"
                            />
                          ) : (
                            score.score_value
                          )}
                        </td>
                        <td className="py-3 text-right">
                          {editingScoreId === score.id ? (
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => setEditingScoreId(null)}
                                className="text-neutral-500 hover:text-white"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleEditScore(score.id)}
                                className="text-blue-400 hover:text-blue-300"
                              >
                                Save
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setEditingScoreId(score.id);
                                setEditScoreValue(score.score_value.toString());
                              }}
                              className="text-neutral-500 hover:text-white transition-colors"
                            >
                              Edit
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Link
            href="/dashboard/winnings"
            className="text-purple-400 hover:text-purple-300 font-medium text-sm flex items-center gap-1"
          >
            Go to Winnings Portal &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
