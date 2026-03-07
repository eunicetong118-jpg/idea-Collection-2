"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Trash2, Edit2, Plus, Info } from "lucide-react";

interface SubTopic {
  id: string;
  _id?: string;
  title: string;
  cardCount: number;
}

interface Idea {
  id: string;
  title: string;
  summary?: string;
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [mainTheme, setMainTheme] = useState("");
  const [subTopics, setSubTopics] = useState<SubTopic[]>([]);
  const [newSubTopic, setNewSubTopic] = useState("");
  const [editingSubTopic, setEditingSubTopic] = useState<SubTopic | null>(null);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [hoveredSummary, setHoveredSummary] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated" || (status === "authenticated" && !(session?.user as any)?.isAdmin)) {
      router.push("/");
    }
  }, [status, session, router]);

  useEffect(() => {
    if ((session?.user as any)?.isAdmin) {
      fetchTheme();
      fetchSubTopics();
      fetchIdeas();
    }
  }, [session]);

  const fetchTheme = async () => {
    const res = await fetch("/api/admin/theme");
    if (res.ok) {
      const data = await res.json();
      setMainTheme(data.title || "");
    }
  };

  const fetchSubTopics = async () => {
    const res = await fetch("/api/admin/subtopics");
    if (res.ok) {
      const data = await res.json();
      setSubTopics(data);
    }
  };

  const fetchIdeas = async () => {
    const res = await fetch("/api/admin/ideas");
    if (res.ok) {
      const data = await res.json();
      setIdeas(data);
    }
  };

  const updateTheme = async () => {
    const res = await fetch("/api/admin/theme", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: mainTheme }),
    });
    if (res.ok) {
      alert("Theme updated!");
    }
  };

  const addSubTopic = async () => {
    if (!newSubTopic) return;
    const res = await fetch("/api/admin/subtopics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newSubTopic }),
    });
    if (res.ok) {
      setNewSubTopic("");
      fetchSubTopics();
    }
  };

  const deleteSubTopic = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    const res = await fetch(`/api/admin/subtopics?id=${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      fetchSubTopics();
    }
  };

  const startEdit = (st: SubTopic) => {
    setEditingSubTopic(st);
  };

  const saveEdit = async () => {
    if (!editingSubTopic) return;
    const res = await fetch("/api/admin/subtopics", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editingSubTopic.id, title: editingSubTopic.title }),
    });
    if (res.ok) {
      setEditingSubTopic(null);
      fetchSubTopics();
    }
  };

  if (status === "loading") return <div className="p-8 text-center">Loading...</div>;
  if (!(session?.user as any)?.isAdmin) return null;

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8 font-[family-name:var(--font-geist-sans)]">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Admin Panel</h1>
        <p className="text-gray-500 mb-10">Manage themes, sub-topics, and review community ideas.</p>

        {/* Main Theme Section */}
        <section className="mb-12 p-8 border border-gray-100 rounded-3xl bg-white shadow-sm shadow-gray-100/50">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Main Theme</h2>
          <div className="flex gap-3">
            <input
              type="text"
              value={mainTheme}
              onChange={(e) => setMainTheme(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && updateTheme()}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-2xl text-black focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder-gray-400"
              placeholder="e.g., Q1 Product Roadmap"
            />
            <button
              onClick={updateTheme}
              className="bg-gray-900 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-gray-800 transition-all active:scale-95 shadow-lg shadow-gray-200"
            >
              Update
            </button>
          </div>
        </section>

        {/* Sub-topics Section */}
        <section className="mb-12 p-8 border border-gray-100 rounded-3xl bg-white shadow-sm shadow-gray-100/50">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Sub-topics Management</h2>

          <div className="flex gap-3 mb-8">
            <input
              type="text"
              value={newSubTopic}
              onChange={(e) => setNewSubTopic(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addSubTopic()}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-2xl text-black focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder-gray-400"
              placeholder="e.g., Marketing Ideas"
            />
            <button
              onClick={addSubTopic}
              className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-blue-700 flex items-center gap-2 transition-all active:scale-95 shadow-lg shadow-blue-100"
            >
              <Plus size={20} />
              <span>Add Topic</span>
            </button>
          </div>

          <div className="overflow-hidden border border-gray-100 rounded-2xl">
            <table className="w-full border-collapse bg-white">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="text-left py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Title</th>
                  <th className="text-center py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Cards</th>
                  <th className="text-right py-4 px-6 text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {subTopics.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-10 text-center text-gray-400 italic">
                      No sub-topics created yet.
                    </td>
                  </tr>
                ) : (
                  subTopics.map((st) => (
                    <tr key={st.id} className="hover:bg-gray-50/30 transition-colors">
                      <td className="py-4 px-6">
                        {editingSubTopic?.id === st.id ? (
                          <input
                            type="text"
                            value={editingSubTopic.title}
                            onChange={(e) => setEditingSubTopic({ ...editingSubTopic, title: e.target.value })}
                            onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                            className="w-full px-3 py-1 border border-blue-200 rounded-lg text-black focus:ring-2 focus:ring-blue-500/20 outline-none"
                            autoFocus
                          />
                        ) : (
                          <span className="font-medium text-gray-900">{st.title}</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                          {st.cardCount}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right space-x-3">
                        {editingSubTopic?.id === st.id ? (
                          <button onClick={saveEdit} className="text-blue-600 font-bold hover:text-blue-700">Save</button>
                        ) : (
                          <button onClick={() => startEdit(st)} className="text-gray-400 hover:text-blue-600 transition-colors">
                            <Edit2 size={18} />
                          </button>
                        )}
                        <button onClick={() => deleteSubTopic(st.id)} className="text-gray-400 hover:text-red-600 transition-colors">
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Ideas Summary Hover Section */}
        <section className="p-8 border border-gray-100 rounded-3xl bg-white shadow-sm shadow-gray-100/50 relative overflow-hidden">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Ideas Review</h2>
          <p className="text-sm text-gray-400 mb-6">Hover over an idea title to preview the AI summary.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ideas.length === 0 ? (
              <div className="col-span-2 py-10 text-center text-gray-400 border-2 border-dashed border-gray-50 rounded-2xl">
                No ideas submitted yet.
              </div>
            ) : (
              ideas.map((idea) => (
                <div
                  key={idea.id}
                  className="p-4 border border-gray-100 rounded-2xl hover:bg-blue-50/50 hover:border-blue-100 cursor-help flex items-center justify-between group transition-all"
                  onMouseEnter={() => setHoveredSummary(idea.summary || "No summary available.")}
                  onMouseLeave={() => setHoveredSummary(null)}
                >
                  <span className="font-semibold text-gray-700 truncate mr-2">{idea.title}</span>
                  <Info size={16} className="text-gray-300 group-hover:text-blue-500 transition-colors shrink-0" />
                </div>
              ))
            )}
          </div>

          {hoveredSummary && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 p-6 bg-white border border-gray-100 shadow-2xl rounded-3xl z-20 text-sm animate-in fade-in zoom-in duration-300">
              <div className="flex items-center gap-2 mb-3 text-blue-600">
                <div className="p-1 bg-blue-50 rounded-lg">
                  <ShieldCheck size={16} />
                </div>
                <h3 className="font-bold">AI Summary</h3>
              </div>
              <p className="text-gray-600 leading-relaxed italic">&quot;{hoveredSummary}&quot;</p>
              <div className="mt-4 pt-4 border-t border-gray-50 text-[10px] text-gray-300 uppercase tracking-widest font-bold">
                Powered by Gemini AI
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
