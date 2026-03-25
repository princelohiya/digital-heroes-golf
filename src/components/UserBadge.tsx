"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function UserBadge() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        setEmail(session.user.email ?? "Unknown User");

        // Fetch their role from our public table
        const { data } = await supabase
          .from("users")
          .select("role")
          .eq("id", session.user.id)
          .single();

        if (data) setRole(data.role);
      }
    };
    fetchUser();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/"); // Send them back to the landing page
  };
  const handleAdminRedirect = () => {
    if (role === "admin") router.push("/admin");
  };
  const handleUserRedirect = () => {
    if (role === "admin") router.push("/dashboard");
  };

  // Don't render anything if it's still loading
  if (!email)
    return (
      <div className="animate-pulse bg-neutral-800 h-8 w-48 rounded-full"></div>
    );

  return (
    <div className="flex items-center gap-4 bg-neutral-900 border border-neutral-800 px-4 py-2 rounded-full w-fit shadow-lg">
      <div className="flex items-center gap-3">
        {/* Email */}
        <span className="text-sm font-medium text-neutral-300">{email}</span>

        {/* Dynamic Role Tag */}
        <span
          className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${
            role === "admin"
              ? "bg-purple-900/30 text-purple-400 border-purple-800/50 shadow-[0_0_10px_rgba(168,85,247,0.2)]"
              : "bg-neutral-800 text-neutral-400 border-neutral-700"
          }`}
        >
          {role || "User"}
        </span>
      </div>

      {/* Divider */}
      <div className="w-px h-4 bg-neutral-700"></div>
      <button
        onClick={handleAdminRedirect}
        className="text-xs text-neutral-400 hover:text-white transition-colors font-medium cursor-pointer"
      >
        Admin dashboard
      </button>

      <div className="w-px h-4 bg-neutral-700"></div>
      <button
        onClick={handleUserRedirect}
        className="text-xs text-neutral-400 hover:text-white transition-colors font-medium cursor-pointer"
      >
        User dashboard
      </button>

      <div className="w-px h-4 bg-neutral-700"></div>

      {/* Logout Button */}
      <button
        onClick={handleSignOut}
        className="text-xs text-neutral-400 hover:text-white transition-colors font-medium cursor-pointer"
      >
        Log out
      </button>
    </div>
  );
}
