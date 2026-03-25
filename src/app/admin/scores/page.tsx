"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import UserBadge from "@/components/UserBadge";

interface ScoreRecord {
  id: string;
  user_id: string;
  score_value: number;
  played_date: string;
}

export default function ScoreEditor() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [scores, setScores] = useState<ScoreRecord[]>([]);

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);

  useEffect(() => {
    verifyAdminAndFetchScores();
  }, []);

  const verifyAdminAndFetchScores = async () => {
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

    fetchScores();
  };

  const fetchScores = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("scores")
      .select("*")
      .order("played_date", { ascending: false });

    if (data) setScores(data);
    setLoading(false);
  };

  const handleSave = async (scoreId: string) => {
    try {
      const { error } = await supabase
        .from("scores")
        .update({ score_value: editValue })
        .eq("id", scoreId);

      if (error) throw error;
      setEditingId(null);
      fetchScores();
    } catch (error: any) {
      alert("Error updating score: " + error.message);
    }
  };

  const handleDelete = async (scoreId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this score? This might affect the user's draw eligibility.",
      )
    )
      return;

    try {
      const { error } = await supabase
        .from("scores")
        .delete()
        .eq("id", scoreId);
      if (error) throw error;
      fetchScores();
    } catch (error: any) {
      alert("Error deleting score: " + error.message);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex justify-center items-center">
        Loading Scores...
      </div>
    );

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-neutral-800 pb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-blue-400">
              Master Score Editor
            </h1>
            <p className="text-neutral-400 mt-1">
              Audit, edit, or remove user golf scores to maintain platform
              integrity.
            </p>
          </div>
          <UserBadge />
        </header>

        <button
          onClick={() => router.push("/admin")}
          className="text-sm bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 px-4 py-2 rounded transition-colors mb-4"
        >
          &larr; Back to Admin
        </button>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-950/50 border-b border-neutral-800 text-neutral-400 text-sm">
                <th className="p-4 font-medium">Date Played</th>
                <th className="p-4 font-medium">User ID</th>
                <th className="p-4 font-medium">Score</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {scores.map((score) => (
                <tr
                  key={score.id}
                  className="border-b border-neutral-800/50 hover:bg-neutral-800/20 transition-colors"
                >
                  <td className="p-4 text-sm text-neutral-300">
                    {new Date(score.played_date).toLocaleDateString()}
                  </td>
                  <td className="p-4 font-mono text-xs text-neutral-500">
                    {score.user_id.substring(0, 12)}...
                  </td>
                  <td className="p-4">
                    {editingId === score.id ? (
                      <input
                        type="number"
                        value={editValue}
                        onChange={(e) => setEditValue(Number(e.target.value))}
                        className="bg-neutral-950 border border-blue-500 rounded p-1 text-sm w-20 outline-none text-white"
                      />
                    ) : (
                      <span className="font-bold text-white text-lg">
                        {score.score_value}
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    {editingId === score.id ? (
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-xs text-neutral-400 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSave(score.id)}
                          className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => {
                            setEditingId(score.id);
                            setEditValue(score.score_value);
                          }}
                          className="text-sm text-blue-400 hover:text-blue-300"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(score.id)}
                          className="text-sm text-red-500 hover:text-red-400"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
