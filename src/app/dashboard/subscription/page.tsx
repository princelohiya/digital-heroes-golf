"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function SubscriptionPage() {
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<"monthly" | "yearly" | null>(
    null,
  );
  const [userId, setUserId] = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = useState<string>("inactive");

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        setUserId(session.user.id);
        // Fetch their current status from your database
        const { data } = await supabase
          .from("users")
          .select("subscription_status")
          .eq("id", session.user.id)
          .single();

        if (data) setCurrentStatus(data.subscription_status);
      } else {
        router.push("/auth");
      }
    };
    getUser();
  }, [router]);

  const handleSubscribe = async (plan: "monthly" | "yearly") => {
    if (!userId) return;
    setLoadingPlan(plan);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, plan }),
      });

      const data = await res.json();

      // If the API successfully created a Stripe Checkout session, redirect the user there!
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Failed to create checkout session");
      }
    } catch (error: any) {
      alert(error.message);
      setLoadingPlan(null);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Section */}
        <header className="text-center border-b border-neutral-800 pb-8">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Join the Movement
          </h1>
          <p className="text-neutral-400 max-w-2xl mx-auto">
            Get full access to the performance tracking platform, enter the
            monthly prize draws, and support your chosen charity with every
            payment.
          </p>

          {currentStatus === "active" && (
            <div className="mt-6 inline-block bg-green-900/30 border border-green-800 text-green-400 px-4 py-2 rounded-full text-sm font-medium">
              You already have an active subscription!
            </div>
          )}
        </header>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto pt-4">
          {/* Monthly Plan */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-8 flex flex-col transition-all hover:border-neutral-700">
            <h2 className="text-xl font-semibold mb-2">Monthly Member</h2>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-bold">$19</span>
              <span className="text-neutral-500">/mo</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1 text-sm text-neutral-300">
              <li className="flex items-center gap-3">
                <span className="text-blue-500">✓</span> Performance score
                tracking
              </li>
              <li className="flex items-center gap-3">
                <span className="text-blue-500">✓</span> Entry to all monthly
                prize draws
              </li>
              <li className="flex items-center gap-3">
                <span className="text-blue-500">✓</span> Minimum 10% charity
                contribution
              </li>
            </ul>
            <button
              onClick={() => handleSubscribe("monthly")}
              disabled={loadingPlan !== null || currentStatus === "active"}
              className="w-full bg-neutral-800 hover:bg-neutral-700 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50"
            >
              {loadingPlan === "monthly" ? "Loading..." : "Subscribe Monthly"}
            </button>
          </div>

          {/* Yearly Plan (Highlighted) */}
          <div className="bg-gradient-to-b from-blue-900/20 to-neutral-900 border border-blue-800/50 rounded-2xl p-8 flex flex-col relative shadow-[0_0_30px_rgba(59,130,246,0.1)]">
            <div className="absolute top-0 right-8 -translate-y-1/2 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Best Value
            </div>
            <h2 className="text-xl font-semibold mb-2">Annual Member</h2>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-bold">$190</span>
              <span className="text-neutral-500">/yr</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1 text-sm text-neutral-300">
              <li className="flex items-center gap-3">
                <span className="text-blue-400">✓</span>{" "}
                <strong>Save $38 annually</strong>
              </li>
              <li className="flex items-center gap-3">
                <span className="text-blue-400">✓</span> Performance score
                tracking
              </li>
              <li className="flex items-center gap-3">
                <span className="text-blue-400">✓</span> Entry to all monthly
                prize draws
              </li>
              <li className="flex items-center gap-3">
                <span className="text-blue-400">✓</span> Larger upfront charity
                impact
              </li>
            </ul>
            <button
              onClick={() => handleSubscribe("yearly")}
              disabled={loadingPlan !== null || currentStatus === "active"}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors disabled:opacity-50"
            >
              {loadingPlan === "yearly" ? "Loading..." : "Subscribe Annually"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
