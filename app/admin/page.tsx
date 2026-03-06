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
    <div className="max-w-4xl mx-auto p-8 font-[family-name:var(--font-geist-sans)]">
      <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>

      {/* Main Theme Section */}
      <section className="mb-12 p-6 border rounded-lg bg-card">
        <h2 className="text-xl font-semibold mb-4">Main Theme</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={mainTheme}
            onChange={(e) => setMainTheme(e.target.value)}
            className="flex-1 p-2 border rounded text-black"
            placeholder="Enter main theme"
          />
          <button
            onClick={updateTheme}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Update
          </button>
        </div>
      </section>

      {/* Sub-topics Section */}
      <section className="mb-12 p-6 border rounded-lg bg-card">
        <h2 className="text-xl font-semibold mb-4">Sub-topics Management</h2>

        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={newSubTopic}
            onChange={(e) => setNewSubTopic(e.target.value)}
            className="flex-1 p-2 border rounded text-black"
            placeholder="New sub-topic title"
          />
          <button
            onClick={addSubTopic}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-1"
          >
            <Plus size={18} /> Add
          </button>
        </div>

        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Title</th>
              <th className="text-center py-2">Cards</th>
              <th className="text-right py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {subTopics.map((st) => (
              <tr key={st.id} className="border-b">
                <td className="py-3">
                  {editingSubTopic?.id === st.id ? (
                    <input
                      type="text"
                      value={editingSubTopic.title}
                      onChange={(e) => setEditingSubTopic({ ...editingSubTopic, title: e.target.value })}
                      className="p-1 border rounded text-black"
                    />
                  ) : (
                    st.title
                  )}
                </td>
                <td className="text-center">{st.cardCount}</td>
                <td className="text-right py-3 space-x-2">
                  {editingSubTopic?.id === st.id ? (
                    <button onClick={saveEdit} className="text-blue-600 hover:underline">Save</button>
                  ) : (
                    <button onClick={() => startEdit(st)} className="text-gray-600 hover:text-blue-600">
                      <Edit2 size={18} />
                    </button>
                  )}
                  <button onClick={() => deleteSubTopic(st.id)} className="text-gray-600 hover:text-red-600">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Ideas Summary Hover Placeholder Section */}
      <section className="p-6 border rounded-lg bg-card relative">
        <h2 className="text-xl font-semibold mb-4">Ideas Review (Hover for Summary)</h2>
        <div className="space-y-2">
          {ideas.map((idea) => (
            <div
              key={idea.id}
              className="p-3 border rounded hover:bg-slate-50 cursor-help flex items-center justify-between group"
              onMouseEnter={() => setHoveredSummary(idea.summary || "No summary available.")}
              onMouseLeave={() => setHoveredSummary(null)}
            >
              <span className="font-medium">{idea.title}</span>
              <Info size={16} className="text-gray-400 group-hover:text-blue-500" />
            </div>
          ))}
        </div>

        {hoveredSummary && (
          <div className="absolute top-0 right-0 mt-12 mr-6 w-64 p-4 bg-white border shadow-xl rounded-lg z-10 text-sm animate-in fade-in zoom-in duration-200 text-black">
            <h3 className="font-bold mb-1 flex items-center gap-1">
              <Info size={14} /> AI Summary
            </h3>
            <p className="text-gray-700">{hoveredSummary}</p>
          </div>
        )}
      </section>
    </div>
  );
}
