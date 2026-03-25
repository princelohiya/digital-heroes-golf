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

export default function CharityManagement() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [charities, setCharities] = useState<Charity[]>([]);

  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    is_featured: false,
  });

  useEffect(() => {
    verifyAdminAndFetchCharities();
  }, []);

  const verifyAdminAndFetchCharities = async () => {
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

    fetchCharities();
  };

  const fetchCharities = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("charities")
      .select("*")
      .order("name");
    if (data) setCharities(data);
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditing && editingId) {
        // UPDATE existing
        const { error } = await supabase
          .from("charities")
          .update(formData)
          .eq("id", editingId);
        if (error) throw error;
        alert("Charity updated successfully!");
      } else {
        // INSERT new
        const { error } = await supabase.from("charities").insert([formData]);
        if (error) throw error;
        alert("Charity added successfully!");
      }

      resetForm();
      fetchCharities();
    } catch (error: any) {
      alert("Error saving: " + error.message);
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this charity?"))
      return;

    try {
      const { error } = await supabase.from("charities").delete().eq("id", id);
      if (error) throw error;
      fetchCharities();
    } catch (error: any) {
      alert("Error deleting: " + error.message);
    }
  };

  const handleEditClick = (charity: Charity) => {
    setIsEditing(true);
    setEditingId(charity.id);
    setFormData({
      name: charity.name,
      description: charity.description || "",
      is_featured: charity.is_featured || false,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({ name: "", description: "", is_featured: false });
  };

  if (loading && charities.length === 0)
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex justify-center items-center">
        Loading Data...
      </div>
    );

  return (
    <div className="min-h-screen bg-neutral-950 text-white p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="flex justify-between items-center border-b border-neutral-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-purple-400">
              Charity Management
            </h1>
            <p className="text-neutral-400 mt-1">
              Add, edit, or remove charities from the platform directory.
            </p>
          </div>
          <button
            onClick={() => router.push("/admin")}
            className="text-sm text-neutral-400 hover:text-white"
          >
            &larr; Back to Admin
          </button>
        </header>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Create/Edit Form */}
          <div className="md:col-span-1 bg-neutral-900 border border-neutral-800 p-6 rounded-2xl h-fit sticky top-6">
            <h2 className="text-xl font-semibold mb-4">
              {isEditing ? "Edit Charity" : "Add New Charity"}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm text-neutral-400 mb-1">
                  Organization Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500"
                />
              </div>
              <div>
                <label className="block text-sm text-neutral-400 mb-1">
                  Description & Media URL
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg p-3 text-white focus:outline-none focus:border-purple-500"
                ></textarea>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={formData.is_featured}
                  onChange={(e) =>
                    setFormData({ ...formData, is_featured: e.target.checked })
                  }
                  className="w-5 h-5 accent-purple-600"
                />
                <label htmlFor="featured" className="text-sm text-neutral-300">
                  Highlight as Featured Charity
                </label>
              </div>

              <div className="pt-4 flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 py-3 rounded-lg font-bold transition-colors"
                >
                  {isEditing ? "Update Charity" : "Save Charity"}
                </button>
                {isEditing && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 bg-neutral-800 hover:bg-neutral-700 rounded-lg font-medium transition-colors"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Charity List */}
          <div className="md:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold mb-4">Active Directory</h2>
            {charities.length === 0 ? (
              <p className="text-neutral-500">
                No charities found in the database.
              </p>
            ) : (
              charities.map((charity) => (
                <div
                  key={charity.id}
                  className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl flex flex-col sm:flex-row justify-between sm:items-center gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-white">
                        {charity.name}
                      </h3>
                      {charity.is_featured && (
                        <span className="bg-purple-900/30 text-purple-400 text-[10px] px-2 py-0.5 rounded border border-purple-800/50 uppercase tracking-wider font-bold">
                          Featured
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-neutral-400 line-clamp-2">
                      {charity.description}
                    </p>
                  </div>

                  <div className="flex gap-2 sm:ml-auto">
                    <button
                      onClick={() => handleEditClick(charity)}
                      className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 text-sm font-medium rounded-lg transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(charity.id)}
                      className="px-4 py-2 bg-red-950/30 hover:bg-red-900/50 text-red-500 border border-red-900/30 text-sm font-medium rounded-lg transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
