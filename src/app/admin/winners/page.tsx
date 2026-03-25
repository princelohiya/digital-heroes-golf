"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import UserBadge from "@/components/UserBadge";

interface WinnerRecord {
  id: string;
  match_tier: string;
  prize_amount: number;
  admin_verification: string;
  payment_status: string;
  created_at: string;
  users: { id: string };
  draws: { draw_month: string };
}

export default function WinnersLedger() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [winners, setWinners] = useState<WinnerRecord[]>([]);

  useEffect(() => {
    verifyAdminAndFetchWinners();
  }, []);

  const verifyAdminAndFetchWinners = async () => {
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

    fetchWinners();
  };

  const fetchWinners = async () => {
    setLoading(true);
    // Fetch ALL winners and join the associated user and draw data
    const { data, error } = await supabase
      .from("winners")
      .select(
        `
        id, match_tier, prize_amount, admin_verification, payment_status, created_at,
        users ( id ),
        draws ( draw_month )
      `,
      )
      .order("created_at", { ascending: false });

    if (error) console.error(error);
    if (data) setWinners(data as any);
    setLoading(false);
  };

  if (loading)
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex justify-center items-center">
        Loading Ledger...
      </div>
    );

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-neutral-800 pb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-green-400">
              Master Winners Ledger
            </h1>
            <p className="text-neutral-400 mt-1">
              A complete historical record of all platform payouts and
              verifications.
            </p>
          </div>
          <UserBadge />
        </header>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => router.push("/admin")}
            className="text-sm bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 px-4 py-2 rounded transition-colors"
          >
            &larr; Back to Admin
          </button>
          <button
            onClick={() => router.push("/admin/verification")}
            className="text-sm bg-purple-900/30 text-purple-400 border border-purple-800 hover:bg-purple-900/50 px-4 py-2 rounded transition-colors"
          >
            Go to Pending Queue &rarr;
          </button>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-950/50 border-b border-neutral-800 text-neutral-400 text-sm">
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Draw Month</th>
                  <th className="p-4 font-medium">User ID</th>
                  <th className="p-4 font-medium">Tier</th>
                  <th className="p-4 font-medium text-right">Amount</th>
                  <th className="p-4 font-medium text-center">Verification</th>
                  <th className="p-4 font-medium text-center">Payout</th>
                </tr>
              </thead>
              <tbody>
                {winners.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="p-8 text-center text-neutral-500"
                    >
                      No winning records found.
                    </td>
                  </tr>
                ) : (
                  winners.map((winner) => (
                    <tr
                      key={winner.id}
                      className="border-b border-neutral-800/50 hover:bg-neutral-800/20 transition-colors"
                    >
                      <td className="p-4 text-sm text-neutral-300">
                        {new Date(winner.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-4 text-sm font-medium">
                        {winner.draws?.draw_month || "N/A"}
                      </td>
                      <td className="p-4 font-mono text-xs text-neutral-500">
                        {winner.users?.id?.substring(0, 8)}...
                      </td>
                      <td className="p-4">
                        <span className="text-xs bg-neutral-800 text-neutral-300 px-2 py-1 rounded uppercase tracking-wider font-bold border border-neutral-700">
                          {winner.match_tier}
                        </span>
                      </td>
                      <td className="p-4 text-right font-bold text-white">
                        $
                        {Number(winner.prize_amount).toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider border ${
                            winner.admin_verification === "approved"
                              ? "bg-green-900/30 text-green-400 border-green-800/50"
                              : winner.admin_verification === "rejected"
                                ? "bg-red-900/30 text-red-400 border-red-800/50"
                                : "bg-yellow-900/30 text-yellow-400 border-yellow-800/50"
                          }`}
                        >
                          {winner.admin_verification}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`text-[10px] px-2 py-1 rounded-full font-bold uppercase tracking-wider border ${
                            winner.payment_status === "paid"
                              ? "bg-green-900/30 text-green-400 border-green-800/50"
                              : "bg-neutral-800 text-neutral-400 border-neutral-700"
                          }`}
                        >
                          {winner.payment_status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
