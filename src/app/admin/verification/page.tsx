"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface PendingWinner {
  id: string;
  user_id: string;
  match_tier: string;
  prize_amount: number;
  proof_image_url: string;
  admin_verification: string;
  draws: { draw_month: string };
}

export default function VerificationPanel() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [pendingWinners, setPendingWinners] = useState<PendingWinner[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    verifyAdminAndFetchData();
  }, []);

  const verifyAdminAndFetchData = async () => {
    try {
      // 1. Secure the route
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

      // 2. Fetch all winners who have uploaded proof but are still 'pending'
      const { data, error } = await supabase
        .from("winners")
        .select(
          `
          id, user_id, match_tier, prize_amount, proof_image_url, admin_verification,
          draws ( draw_month )
        `,
        )
        .not("proof_image_url", "is", null)
        .eq("admin_verification", "pending")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) setPendingWinners(data as any);
    } catch (error) {
      console.error("Error fetching verification queue:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerification = async (
    winnerId: string,
    status: "approved" | "rejected",
  ) => {
    setProcessingId(winnerId);
    try {
      // If approved, we also automatically mark the payment as 'paid' to complete the loop
      const paymentStatus = status === "approved" ? "paid" : "pending";

      // If rejected, we clear the image URL so the user is forced to upload a new, clearer screenshot
      const updates: any = {
        admin_verification: status,
        payment_status: paymentStatus,
      };

      if (status === "rejected") {
        updates.proof_image_url = null;
        updates.admin_verification = "pending"; // Reset it so they can try again
      }

      const { error } = await supabase
        .from("winners")
        .update(updates)
        .eq("id", winnerId);

      if (error) throw error;

      alert(`Winner successfully ${status}!`);
      verifyAdminAndFetchData(); // Refresh the queue
    } catch (error: any) {
      alert("Action failed: " + error.message);
    } finally {
      setProcessingId(null);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex justify-center items-center">
        Loading Queue...
      </div>
    );

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex justify-between items-center border-b border-neutral-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-purple-400">
              Verification Queue
            </h1>
            <p className="text-neutral-400 mt-1">
              Review user score screenshots and approve payouts.
            </p>
          </div>
          <button
            onClick={() => router.push("/admin")}
            className="text-sm text-neutral-400 hover:text-white"
          >
            &larr; Back to Admin
          </button>
        </header>

        {pendingWinners.length === 0 ? (
          <div className="bg-neutral-900 border border-neutral-800 p-12 rounded-2xl text-center">
            <h2 className="text-xl font-medium text-neutral-300">
              The queue is empty!
            </h2>
            <p className="text-neutral-500 mt-2">
              All uploaded proofs have been reviewed.
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-8">
            {pendingWinners.map((winner) => (
              <div
                key={winner.id}
                className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden flex flex-col"
              >
                {/* Image Viewer */}
                <div className="h-64 bg-neutral-950 relative border-b border-neutral-800 p-2">
                  <a
                    href={winner.proof_image_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full h-full relative group"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={winner.proof_image_url}
                      alt="Score Proof"
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white font-medium bg-black/80 px-4 py-2 rounded-lg backdrop-blur-sm">
                        Click to Enlarge
                      </span>
                    </div>
                  </a>
                </div>

                {/* Info & Actions */}
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="text-xs text-neutral-500 uppercase tracking-widest font-bold mb-1">
                        User ID: {winner.user_id.substring(0, 8)}...
                      </p>
                      <h3 className="text-2xl font-bold text-white">
                        $
                        {Number(winner.prize_amount).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </h3>
                    </div>
                    <span className="bg-purple-900/30 border border-purple-800 text-purple-400 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider">
                      {winner.match_tier}
                    </span>
                  </div>

                  <div className="mt-auto grid grid-cols-2 gap-4">
                    <button
                      onClick={() => handleVerification(winner.id, "rejected")}
                      disabled={processingId === winner.id}
                      className="bg-red-950 hover:bg-red-900 text-red-500 border border-red-900/50 py-3 rounded-xl font-medium transition-colors"
                    >
                      Reject Proof
                    </button>
                    <button
                      onClick={() => handleVerification(winner.id, "approved")}
                      disabled={processingId === winner.id}
                      className="bg-green-600 hover:bg-green-700 text-white shadow-[0_0_15px_rgba(22,163,74,0.3)] py-3 rounded-xl font-bold transition-all hover:scale-[1.02]"
                    >
                      Approve & Pay
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
