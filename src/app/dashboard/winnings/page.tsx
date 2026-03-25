"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface WinningRecord {
  id: string;
  match_tier: string;
  prize_amount: number;
  proof_image_url: string | null;
  admin_verification: string;
  payment_status: string;
  draws: { draw_month: string };
}

export default function WinningsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [winnings, setWinnings] = useState<WinningRecord[]>([]);
  const [totalWon, setTotalWon] = useState(0);

  useEffect(() => {
    fetchWinnings();
  }, []);

  const fetchWinnings = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return router.push("/auth");

      // Fetch the user's winning records and join the draw month [cite: 96]
      const { data, error } = await supabase
        .from("winners")
        .select(
          `
          id, match_tier, prize_amount, proof_image_url, admin_verification, payment_status,
          draws ( draw_month )
        `,
        )
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        setWinnings(data as any);
        const total = data.reduce(
          (sum, record) => sum + Number(record.prize_amount),
          0,
        );
        setTotalWon(total);
      }
    } catch (error) {
      console.error("Error fetching winnings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    winningId: string,
  ) => {
    if (!e.target.files || e.target.files.length === 0) return;

    setUploadingId(winningId);
    const file = e.target.files[0];
    const fileExt = file.name.split(".").pop();
    const fileName = `${winningId}-${Math.random()}.${fileExt}`;
    const filePath = `${fileName}`;

    try {
      // 1. Upload the image to Supabase Storage [cite: 33, 85]
      const { error: uploadError } = await supabase.storage
        .from("proof_uploads")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get the public URL for the image
      const {
        data: { publicUrl },
      } = supabase.storage.from("proof_uploads").getPublicUrl(filePath);

      // 3. Update the winners table with the URL
      const { error: updateError } = await supabase
        .from("winners")
        .update({ proof_image_url: publicUrl })
        .eq("id", winningId);

      if (updateError) throw updateError;

      alert("Proof uploaded successfully! Awaiting Admin verification.");
      fetchWinnings(); // Refresh the UI
    } catch (error: any) {
      alert("Upload failed: " + error.message);
    } finally {
      setUploadingId(null);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex justify-center items-center">
        Loading Data...
      </div>
    );

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-neutral-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-green-400">
              Your Winnings
            </h1>
            <p className="text-neutral-400 mt-1">
              Upload score proof to claim your prize.
            </p>
          </div>
          <div className="bg-green-900/20 border border-green-800/50 px-6 py-3 rounded-xl text-right">
            <p className="text-xs text-green-500 font-medium uppercase tracking-wider">
              Total Lifetime Won
            </p>
            <p className="text-2xl font-bold text-green-400">
              $
              {totalWon.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
        </header>

        {winnings.length === 0 ? (
          <div className="bg-neutral-900 border border-neutral-800 p-12 rounded-2xl text-center">
            <h2 className="text-xl font-medium text-neutral-300">
              No winnings yet.
            </h2>
            <p className="text-neutral-500 mt-2">
              Keep logging your scores to enter the next monthly draw!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {winnings.map((win) => {
              const drawDate = new Date(
                win.draws.draw_month,
              ).toLocaleDateString(undefined, {
                month: "long",
                year: "numeric",
              });

              return (
                <div
                  key={win.id}
                  className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-6"
                >
                  {/* Info Section */}
                  <div className="flex-1 w-full">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="bg-blue-600/20 text-blue-400 text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider border border-blue-500/20">
                        {win.match_tier}
                      </span>
                      <span className="text-neutral-400 text-sm">
                        {drawDate} Draw
                      </span>
                    </div>
                    <p className="text-3xl font-bold text-white mb-2">
                      $
                      {Number(win.prize_amount).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>

                    {/* Status Badges  */}
                    <div className="flex gap-2">
                      <span
                        className={`text-xs px-2 py-1 rounded border ${
                          win.admin_verification === "approved"
                            ? "bg-green-900/30 border-green-800 text-green-400"
                            : win.admin_verification === "rejected"
                              ? "bg-red-900/30 border-red-800 text-red-400"
                              : "bg-yellow-900/30 border-yellow-800 text-yellow-400"
                        }`}
                      >
                        Verification: {win.admin_verification.toUpperCase()}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded border ${
                          win.payment_status === "paid"
                            ? "bg-green-900/30 border-green-800 text-green-400"
                            : "bg-neutral-800 border-neutral-700 text-neutral-400"
                        }`}
                      >
                        Payout: {win.payment_status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Action Section */}
                  <div className="w-full md:w-auto flex flex-col items-center justify-center min-w-[200px]">
                    {!win.proof_image_url ? (
                      <div className="w-full text-center">
                        <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors block text-center shadow-lg">
                          {uploadingId === win.id
                            ? "Uploading..."
                            : "Upload Proof Image"}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleFileUpload(e, win.id)}
                            disabled={uploadingId === win.id}
                          />
                        </label>
                        <p className="text-xs text-neutral-500 mt-2">
                          Required: Screenshot of your scores.
                        </p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="w-full h-32 md:w-48 bg-neutral-800 rounded-lg overflow-hidden border border-neutral-700 mb-2">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={win.proof_image_url}
                            alt="Proof"
                            className="w-full h-full object-cover opacity-75 hover:opacity-100 transition-opacity"
                          />
                        </div>
                        <p className="text-xs text-neutral-400 font-medium">
                          Proof Uploaded
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
