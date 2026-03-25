"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface Charity {
  id: string;
  name: string;
  description: string;
  is_featured: boolean;
}

export default function CharityDirectoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [charities, setCharities] = useState<Charity[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // User's current settings
  const [userProfileId, setUserProfileId] = useState<string | null>(null);
  const [selectedCharityId, setSelectedCharityId] = useState<string | null>(
    null,
  );
  const [contributionPct, setContributionPct] = useState<number>(10);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // 1. Get current user
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/auth");
        return;
      }
      setUserProfileId(session.user.id);

      // 2. Fetch User's current charity settings
      const { data: profile } = await supabase
        .from("users")
        .select("selected_charity_id, charity_contribution_pct")
        .eq("id", session.user.id)
        .single();

      if (profile) {
        setSelectedCharityId(profile.selected_charity_id);
        setContributionPct(profile.charity_contribution_pct || 10);
      }

      // 3. Fetch all charities
      const { data: charityData } = await supabase
        .from("charities")
        .select("*")
        .order("is_featured", { ascending: false }); // Featured charities first

      if (charityData) setCharities(charityData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSelection = async (charityId: string) => {
    if (!userProfileId) return;
    setSaving(true);

    try {
      // PRD Logic: Enforce minimum 10%
      const finalPct = Math.max(10, contributionPct);

      const { error } = await supabase
        .from("users")
        .update({
          selected_charity_id: charityId,
          charity_contribution_pct: finalPct,
        })
        .eq("id", userProfileId);

      if (error) throw error;

      setSelectedCharityId(charityId);
      setContributionPct(finalPct);
      alert("Charity preferences updated successfully!");
    } catch (error: any) {
      alert(error.message || "Failed to update charity");
    } finally {
      setSaving(false);
    }
  };

  // PRD Logic: Search & Filter capability
  const filteredCharities = charities.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.description.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading)
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex justify-center items-center">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-neutral-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Impact Directory
            </h1>
            <p className="text-neutral-400 mt-1">
              Select where your subscription makes a difference.
            </p>
          </div>
          <button
            onClick={() => router.push("/dashboard")}
            className="text-sm text-blue-400 hover:text-blue-300 cursor-pointer"
          >
            &larr; Back to Dashboard
          </button>
        </div>

        {/* Contribution Settings (Only shows if a charity is selected) */}
        {selectedCharityId && (
          <div className="bg-blue-900/20 border border-blue-800/50 p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-lg font-semibold text-blue-400">
                Your Contribution Level
              </h2>
              <p className="text-sm text-neutral-400 mt-1">
                You currently donate{" "}
                <strong className="text-white">{contributionPct}%</strong> of
                your subscription fee.
              </p>
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <span className="text-sm text-neutral-400">10%</span>
              <input
                type="range"
                min="10"
                max="100"
                value={contributionPct}
                onChange={(e) => setContributionPct(parseInt(e.target.value))}
                className="w-full md:w-48 accent-blue-500"
              />
              <span className="text-sm text-neutral-400">100%</span>
              {/* Only show save button if they change the slider for their currently selected charity */}
              <button
                onClick={() => handleSaveSelection(selectedCharityId)}
                disabled={saving}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
              >
                Update %
              </button>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <input
          type="text"
          placeholder="Search charities by name or cause..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-6 py-4 focus:ring-2 focus:ring-blue-500 focus:outline-none text-lg"
        />

        {/* Charity Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {filteredCharities.map((charity) => {
            const isSelected = selectedCharityId === charity.id;

            return (
              <div
                key={charity.id}
                className={`p-6 rounded-2xl border transition-all ${
                  isSelected
                    ? "bg-neutral-900 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.2)]"
                    : "bg-neutral-900 border-neutral-800 hover:border-neutral-700"
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold">{charity.name}</h3>
                  {charity.is_featured && (
                    <span className="bg-blue-500/10 text-blue-400 text-xs px-3 py-1 rounded-full font-medium border border-blue-500/20">
                      Featured
                    </span>
                  )}
                </div>
                <p className="text-neutral-400 text-sm mb-6 min-h-[40px]">
                  {charity.description}
                </p>

                <button
                  onClick={() => handleSaveSelection(charity.id)}
                  disabled={isSelected || saving}
                  className={`w-full py-3 rounded-lg font-medium transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-blue-600/20 text-blue-400 cursor-default"
                      : "bg-neutral-800 hover:bg-neutral-700 text-white"
                  }`}
                >
                  {isSelected ? "Currently Supporting" : "Support this Charity"}
                </button>
              </div>
            );
          })}
        </div>

        {filteredCharities.length === 0 && (
          <div className="text-center text-neutral-500 py-12">
            No charities found matching your search.
          </div>
        )}
      </div>
    </div>
  );
}
