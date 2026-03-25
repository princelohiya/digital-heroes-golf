"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface UserProfile {
  id: string;
  role: string;
  subscription_status: string;
  subscription_plan: string;
  created_at: string;
}

export default function UserManagement() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserProfile[]>([]);

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    role: "",
    subscription_status: "",
    subscription_plan: "",
  });

  useEffect(() => {
    verifyAdminAndFetchUsers();
  }, []);

  const verifyAdminAndFetchUsers = async () => {
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

    fetchUsers();
  };

  const fetchUsers = async () => {
    setLoading(true);
    // Fetch all users
    const { data, error } = await supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) console.error(error);
    if (data) setUsers(data);
    setLoading(false);
  };

  const handleEditClick = (user: UserProfile) => {
    setEditingId(user.id);
    setFormData({
      role: user.role || "user",
      subscription_status: user.subscription_status || "inactive",
      subscription_plan: user.subscription_plan || "none",
    });
  };

  const handleSave = async (userId: string) => {
    try {
      setLoading(true);
      const { error } = await supabase
        .from("users")
        .update(formData)
        .eq("id", userId);

      if (error) throw error;

      alert("User updated successfully!");
      setEditingId(null);
      fetchUsers();
    } catch (error: any) {
      alert("Error updating user: " + error.message);
      setLoading(false);
    }
  };

  if (loading && users.length === 0)
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex justify-center items-center">
        Loading Data...
      </div>
    );

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex justify-between items-center border-b border-neutral-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-blue-400">
              User Management
            </h1>
            <p className="text-neutral-400 mt-1">
              View profiles, manage roles, and override subscription statuses.
            </p>
          </div>
          <button
            onClick={() => router.push("/admin")}
            className="text-sm text-neutral-400 hover:text-white cursor-pointer"
          >
            &larr; Back to Admin
          </button>
        </header>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-950/50 border-b border-neutral-800 text-neutral-400 text-sm">
                  <th className="p-4 font-medium">User ID</th>
                  <th className="p-4 font-medium">Role</th>
                  <th className="p-4 font-medium">Sub Status</th>
                  <th className="p-4 font-medium">Plan</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-neutral-800/50 hover:bg-neutral-800/20 transition-colors"
                  >
                    <td className="p-4 font-mono text-xs text-neutral-300">
                      {user.id.substring(0, 12)}...
                    </td>

                    {/* Role Column */}
                    <td className="p-4">
                      {editingId === user.id ? (
                        <select
                          value={formData.role}
                          onChange={(e) =>
                            setFormData({ ...formData, role: e.target.value })
                          }
                          className="bg-neutral-950 border border-neutral-700 rounded p-1 text-sm focus:border-blue-500 outline-none"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      ) : (
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-bold uppercase tracking-wider ${
                            user.role === "admin"
                              ? "bg-purple-900/30 text-purple-400 border border-purple-800/50"
                              : "bg-neutral-800 text-neutral-400"
                          }`}
                        >
                          {user.role || "user"}
                        </span>
                      )}
                    </td>

                    {/* Status Column */}
                    <td className="p-4">
                      {editingId === user.id ? (
                        <select
                          value={formData.subscription_status}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              subscription_status: e.target.value,
                            })
                          }
                          className="bg-neutral-950 border border-neutral-700 rounded p-1 text-sm focus:border-blue-500 outline-none"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="past_due">Past Due</option>
                        </select>
                      ) : (
                        <span
                          className={`text-xs px-2 py-1 rounded font-bold uppercase ${
                            user.subscription_status === "active"
                              ? "text-green-400"
                              : "text-neutral-500"
                          }`}
                        >
                          {user.subscription_status || "inactive"}
                        </span>
                      )}
                    </td>

                    {/* Plan Column */}
                    <td className="p-4">
                      {editingId === user.id ? (
                        <select
                          value={formData.subscription_plan}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              subscription_plan: e.target.value,
                            })
                          }
                          className="bg-neutral-950 border border-neutral-700 rounded p-1 text-sm focus:border-blue-500 outline-none"
                        >
                          <option value="monthly">Monthly</option>
                          <option value="annual">Annual</option>
                          <option value="none">None</option>
                        </select>
                      ) : (
                        <span className="text-sm text-neutral-300 capitalize">
                          {user.subscription_plan || "None"}
                        </span>
                      )}
                    </td>

                    {/* Actions Column */}
                    <td className="p-4 text-right">
                      {editingId === user.id ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => setEditingId(null)}
                            className="text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleSave(user.id)}
                            className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition-colors cursor-pointer"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEditClick(user)}
                          className="text-sm text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                        >
                          Edit User
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
