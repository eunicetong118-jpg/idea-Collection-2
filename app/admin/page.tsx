"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Trash2, Edit2, Plus, Info, ShieldCheck, Loader2 } from "lucide-react";
import Toast, { ToastType } from "../../components/Toast";
import clsx from "clsx";

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
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type });
  };

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
      showToast("Theme updated successfully!", "success");
    } else {
      showToast("Failed to update theme.", "error");
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
      showToast("Sub-topic added!", "success");
    } else {
      showToast("Failed to add sub-topic.", "error");
    }
  };

  const deleteSubTopic = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    const res = await fetch(`/api/admin/subtopics?id=${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      fetchSubTopics();
      showToast("Sub-topic deleted.", "success");
    } else {
      showToast("Failed to delete sub-topic.", "error");
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
      showToast("Sub-topic updated!", "success");
    } else {
      showToast("Failed to save changes.", "error");
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-lab-bg flex items-center justify-center">
        <Loader2 className="animate-spin text-lab-ui" size={32} />
      </div>
    );
  }

  if (!(session?.user as any)?.isAdmin) return null;

  return (
    <div className="min-h-screen bg-lab-bg text-lab-text py-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      {/* Paper Texture Layer */}
      <div className="fixed inset-0 paper-texture z-0" />

      <div className="max-w-4xl mx-auto relative z-10">
        <header className="mb-12">
          <div className="flex items-center space-x-4 mb-2">
            <span className="text-[10px] uppercase tracking-[0.4em] opacity-40 font-bold">SYSTEM_OVERRIDE</span>
            <div className="h-[1px] w-12 bg-lab-ui/20" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-lab-text">Admin Control Panel</h1>
          <p className="text-lab-text/50 mt-2">Manage the organic matrix and review community output.</p>
        </header>

        {/* Main Theme Section */}
        <section className="mb-8 p-8 glass-panel rounded-[2rem] border-none shadow-xl shadow-paper-shadow">
          <h2 className="text-lg font-bold text-lab-text/40 uppercase tracking-widest mb-6 ml-1">Main_Theme_Config</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              value={mainTheme}
              onChange={(e) => setMainTheme(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && updateTheme()}
              className="flex-1 px-5 py-4 bg-lab-ui/10 border-none rounded-2xl text-lab-text focus:outline-none focus:ring-2 focus:ring-lab-ui/40 transition-all placeholder:text-lab-text/20"
              placeholder="e.g., Q1 Product Roadmap"
            />
            <button
              onClick={updateTheme}
              className="bg-lab-text text-lab-bg px-8 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-lab-ui hover:text-lab-text transition-all active:scale-[0.98] shadow-lg shadow-paper-shadow"
            >
              Update_System
            </button>
          </div>
        </section>

        {/* Sub-topics Section */}
        <section className="mb-8 p-8 glass-panel rounded-[2rem] border-none shadow-xl shadow-paper-shadow">
          <h2 className="text-lg font-bold text-lab-text/40 uppercase tracking-widest mb-6 ml-1">Sector_Management</h2>

          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <input
              type="text"
              value={newSubTopic}
              onChange={(e) => setNewSubTopic(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addSubTopic()}
              className="flex-1 px-5 py-4 bg-lab-ui/10 border-none rounded-2xl text-lab-text focus:outline-none focus:ring-2 focus:ring-lab-ui/40 transition-all placeholder:text-lab-text/20"
              placeholder="e.g., Marketing Sector"
            />
            <button
              onClick={addSubTopic}
              className="bg-lab-ui text-lab-text px-8 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-lab-ui/80 flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-paper-shadow"
            >
              <Plus size={20} />
              <span>Add_Sector</span>
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-lab-ui/10 bg-lab-ui/5">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-lab-ui/10">
                  <th className="text-left py-4 px-6 text-[10px] font-bold text-lab-text/40 uppercase tracking-[0.2em]">Title</th>
                  <th className="text-center py-4 px-6 text-[10px] font-bold text-lab-text/40 uppercase tracking-[0.2em]">Density</th>
                  <th className="text-right py-4 px-6 text-[10px] font-bold text-lab-text/40 uppercase tracking-[0.2em]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-lab-ui/10">
                {subTopics.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-10 text-center text-lab-text/30 italic">
                      No active sectors detected.
                    </td>
                  </tr>
                ) : (
                  subTopics.map((st) => (
                    <tr key={st.id} className="hover:bg-lab-ui/5 transition-colors">
                      <td className="py-4 px-6">
                        {editingSubTopic?.id === st.id ? (
                          <input
                            type="text"
                            value={editingSubTopic.title}
                            onChange={(e) => setEditingSubTopic({ ...editingSubTopic, title: e.target.value })}
                            onKeyDown={(e) => e.key === "Enter" && saveEdit()}
                            className="w-full px-3 py-1 bg-lab-bg/50 border border-lab-ui rounded-lg text-lab-text focus:outline-none"
                            autoFocus
                          />
                        ) : (
                          <span className="font-bold text-lab-text">{st.title}</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold bg-lab-ui/20 text-lab-text">
                          {st.cardCount} UNITS
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right space-x-4">
                        {editingSubTopic?.id === st.id ? (
                          <button onClick={saveEdit} className="text-lab-ui font-bold hover:text-lab-text uppercase text-[10px] tracking-widest transition-colors">Save</button>
                        ) : (
                          <button onClick={() => startEdit(st)} className="text-lab-text/40 hover:text-lab-ui transition-colors">
                            <Edit2 size={16} />
                          </button>
                        )}
                        <button onClick={() => deleteSubTopic(st.id)} className="text-lab-text/40 hover:text-red-500 transition-colors">
                          <Trash2 size={16} />
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
        <section className="p-8 glass-panel rounded-[2rem] border-none shadow-xl shadow-paper-shadow relative overflow-hidden">
          <h2 className="text-lg font-bold text-lab-text/40 uppercase tracking-widest mb-6 ml-1">Input_Intelligence_Review</h2>
          <p className="text-xs text-lab-text/40 mb-6 font-bold tracking-widest uppercase">SCANNING_DATA_STREAMS...</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {ideas.length === 0 ? (
              <div className="col-span-2 py-10 text-center text-lab-text/20 border-2 border-dashed border-lab-ui/20 rounded-[2rem]">
                No ideas processed in this session.
              </div>
            ) : (
              ideas.map((idea) => (
                <div
                  key={idea.id}
                  className="p-5 bg-lab-ui/5 border border-lab-ui/10 rounded-2xl hover:bg-lab-ui/10 hover:border-lab-ui/30 cursor-help flex items-center justify-between group transition-all"
                  onMouseEnter={() => setHoveredSummary(idea.summary || "No summary available.")}
                  onMouseLeave={() => setHoveredSummary(null)}
                >
                  <span className="font-bold text-lab-text/70 truncate mr-2 text-sm">{idea.title}</span>
                  <Info size={14} className="text-lab-ui/40 group-hover:text-lab-ui transition-colors shrink-0" />
                </div>
              ))
            )}
          </div>

          {hoveredSummary && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 p-8 bg-white/95 backdrop-blur-xl border-none shadow-2xl rounded-[2rem] z-20 text-sm animate-in fade-in zoom-in duration-300 shadow-paper-shadow">
              <div className="flex items-center gap-2 mb-4 text-lab-ui">
                <div className="p-1.5 bg-lab-ui/20 rounded-full">
                  <ShieldCheck size={18} />
                </div>
                <h3 className="font-bold uppercase tracking-widest text-[10px]">AI Intelligence Summary</h3>
              </div>
              <p className="text-lab-text/70 leading-relaxed italic font-sans">&quot;{hoveredSummary}&quot;</p>
              <div className="mt-6 pt-4 border-t border-lab-ui/10 text-[9px] text-lab-text/30 uppercase tracking-[0.3em] font-bold">
                PROCESSED BY GEMINI_MATRIX
              </div>
            </div>
          )}
        </section>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
