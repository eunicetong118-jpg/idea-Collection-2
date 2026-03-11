"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Trash2, Edit2, Plus, Loader2 } from "lucide-react";
import Toast, { ToastType } from "../../components/Toast";
import clsx from "clsx";

interface SubTopic {
  id: string;
  _id?: string;
  title: string;
  cardCount: number;
}

interface Department {
  id: string;
  name: string;
}

interface Country {
  id: string;
  name: string;
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
  const [departments, setDepartments] = useState<Department[]>([]);
  const [newDepartment, setNewDepartment] = useState("");
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [countries, setCountries] = useState<Country[]>([]);
  const [newCountry, setNewCountry] = useState("");
  const [editingCountry, setEditingCountry] = useState<Country | null>(null);
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
      fetchDepartments();
      fetchCountries();
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

  const fetchDepartments = async () => {
    const res = await fetch("/api/admin/departments");
    if (res.ok) {
      const data = await res.json();
      setDepartments(data);
    }
  };

  const fetchCountries = async () => {
    const res = await fetch("/api/admin/countries");
    if (res.ok) {
      const data = await res.json();
      setCountries(data);
    }
  };

  const updateTheme = async () => {
    try {
      const res = await fetch("/api/admin/theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: mainTheme }),
      });
      if (res.ok) {
        showToast("Theme updated successfully!", "success");
      } else {
        const data = await res.json();
        showToast(data.error || "Failed to update theme.", "error");
      }
    } catch (error) {
      showToast("Network error. Please try again.", "error");
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

  const addDepartment = async () => {
    if (!newDepartment) return;
    const res = await fetch("/api/admin/departments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newDepartment }),
    });
    if (res.ok) {
      setNewDepartment("");
      fetchDepartments();
      showToast("Department added!", "success");
    } else {
      showToast("Failed to add department.", "error");
    }
  };

  const deleteDepartment = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    const res = await fetch(`/api/admin/departments?id=${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      fetchDepartments();
      showToast("Department deleted.", "success");
    } else {
      showToast("Failed to delete department.", "error");
    }
  };

  const saveDepartmentEdit = async () => {
    if (!editingDepartment) return;
    const res = await fetch("/api/admin/departments", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editingDepartment.id, name: editingDepartment.name }),
    });
    if (res.ok) {
      setEditingDepartment(null);
      fetchDepartments();
      showToast("Department updated!", "success");
    } else {
      showToast("Failed to save changes.", "error");
    }
  };

  const addCountry = async () => {
    if (!newCountry) return;
    const res = await fetch("/api/admin/countries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newCountry }),
    });
    if (res.ok) {
      setNewCountry("");
      fetchCountries();
      showToast("Country added!", "success");
    } else {
      showToast("Failed to add country.", "error");
    }
  };

  const deleteCountry = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    const res = await fetch(`/api/admin/countries?id=${id}`, {
      method: "DELETE",
    });
    if (res.ok) {
      fetchCountries();
      showToast("Country deleted.", "success");
    } else {
      showToast("Failed to delete country.", "error");
    }
  };

  const saveCountryEdit = async () => {
    if (!editingCountry) return;
    const res = await fetch("/api/admin/countries", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editingCountry.id, name: editingCountry.name }),
    });
    if (res.ok) {
      setEditingCountry(null);
      fetchCountries();
      showToast("Country updated!", "success");
    } else {
      showToast("Failed to save changes.", "error");
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
          <h1 className="text-4xl font-bold tracking-tight text-lab-text">Admin Control Panel</h1>
        </header>

        {/* Main Theme Section */}
        <section className="mb-8 p-8 bg-white rounded-[2rem] border-none shadow-xl shadow-paper-shadow">
          <h2 className="text-lg font-bold text-lab-text/40 uppercase tracking-widest mb-6 ml-1">Main Theme Config</h2>
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
              Update System
            </button>
          </div>
        </section>

        {/* Sub-topics Section */}
        <section className="mb-8 p-8 bg-white rounded-[2rem] border-none shadow-xl shadow-paper-shadow">
          <h2 className="text-lg font-bold text-lab-text/40 uppercase tracking-widest mb-6 ml-1">Sector Management</h2>

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
              <span>Add Sector</span>
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

        {/* Departments Section */}
        <section className="mb-8 p-8 bg-white rounded-[2rem] border-none shadow-xl shadow-paper-shadow">
          <h2 className="text-lg font-bold text-lab-text/40 uppercase tracking-widest mb-6 ml-1">Department Registry</h2>

          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <input
              type="text"
              value={newDepartment}
              onChange={(e) => setNewDepartment(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addDepartment()}
              className="flex-1 px-5 py-4 bg-lab-ui/10 border-none rounded-2xl text-lab-text focus:outline-none focus:ring-2 focus:ring-lab-ui/40 transition-all placeholder:text-lab-text/20"
              placeholder="e.g., Engineering"
            />
            <button
              onClick={addDepartment}
              className="bg-lab-ui text-lab-text px-8 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-lab-ui/80 flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-paper-shadow"
            >
              <Plus size={20} />
              <span>Add Department</span>
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-lab-ui/10 bg-lab-ui/5">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-lab-ui/10">
                  <th className="text-left py-4 px-6 text-[10px] font-bold text-lab-text/40 uppercase tracking-[0.2em]">Name</th>
                  <th className="text-right py-4 px-6 text-[10px] font-bold text-lab-text/40 uppercase tracking-[0.2em]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-lab-ui/10">
                {departments.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="py-10 text-center text-lab-text/30 italic">
                      No departments registered.
                    </td>
                  </tr>
                ) : (
                  departments.map((d) => (
                    <tr key={d.id} className="hover:bg-lab-ui/5 transition-colors">
                      <td className="py-4 px-6">
                        {editingDepartment?.id === d.id ? (
                          <input
                            type="text"
                            value={editingDepartment.name}
                            onChange={(e) => setEditingDepartment({ ...editingDepartment, name: e.target.value })}
                            onKeyDown={(e) => e.key === "Enter" && saveDepartmentEdit()}
                            className="w-full px-3 py-1 bg-lab-bg/50 border border-lab-ui rounded-lg text-lab-text focus:outline-none"
                            autoFocus
                          />
                        ) : (
                          <span className="font-bold text-lab-text">{d.name}</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right space-x-4">
                        {editingDepartment?.id === d.id ? (
                          <button onClick={saveDepartmentEdit} className="text-lab-ui font-bold hover:text-lab-text uppercase text-[10px] tracking-widest transition-colors">Save</button>
                        ) : (
                          <button onClick={() => setEditingDepartment(d)} className="text-lab-text/40 hover:text-lab-ui transition-colors">
                            <Edit2 size={16} />
                          </button>
                        )}
                        <button onClick={() => deleteDepartment(d.id)} className="text-lab-text/40 hover:text-red-500 transition-colors">
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

        {/* Countries Section */}
        <section className="mb-8 p-8 bg-white rounded-[2rem] border-none shadow-xl shadow-paper-shadow">
          <h2 className="text-lg font-bold text-lab-text/40 uppercase tracking-widest mb-6 ml-1">Country Registry</h2>

          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <input
              type="text"
              value={newCountry}
              onChange={(e) => setNewCountry(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addCountry()}
              className="flex-1 px-5 py-4 bg-lab-ui/10 border-none rounded-2xl text-lab-text focus:outline-none focus:ring-2 focus:ring-lab-ui/40 transition-all placeholder:text-lab-text/20"
              placeholder="e.g., Switzerland"
            />
            <button
              onClick={addCountry}
              className="bg-lab-ui text-lab-text px-8 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-lab-ui/80 flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-paper-shadow"
            >
              <Plus size={20} />
              <span>Add Country</span>
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-lab-ui/10 bg-lab-ui/5">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-lab-ui/10">
                  <th className="text-left py-4 px-6 text-[10px] font-bold text-lab-text/40 uppercase tracking-[0.2em]">Name</th>
                  <th className="text-right py-4 px-6 text-[10px] font-bold text-lab-text/40 uppercase tracking-[0.2em]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-lab-ui/10">
                {countries.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="py-10 text-center text-lab-text/30 italic">
                      No countries registered.
                    </td>
                  </tr>
                ) : (
                  countries.map((c) => (
                    <tr key={c.id} className="hover:bg-lab-ui/5 transition-colors">
                      <td className="py-4 px-6">
                        {editingCountry?.id === c.id ? (
                          <input
                            type="text"
                            value={editingCountry.name}
                            onChange={(e) => setEditingCountry({ ...editingCountry, name: e.target.value })}
                            onKeyDown={(e) => e.key === "Enter" && saveCountryEdit()}
                            className="w-full px-3 py-1 bg-lab-bg/50 border border-lab-ui rounded-lg text-lab-text focus:outline-none"
                            autoFocus
                          />
                        ) : (
                          <span className="font-bold text-lab-text">{c.name}</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right space-x-4">
                        {editingCountry?.id === c.id ? (
                          <button onClick={saveCountryEdit} className="text-lab-ui font-bold hover:text-lab-text uppercase text-[10px] tracking-widest transition-colors">Save</button>
                        ) : (
                          <button onClick={() => setEditingCountry(c)} className="text-lab-text/40 hover:text-lab-ui transition-colors">
                            <Edit2 size={16} />
                          </button>
                        )}
                        <button onClick={() => deleteCountry(c.id)} className="text-lab-text/40 hover:text-red-500 transition-colors">
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
      </div>

      {toast && (
        <Toast
          key={toast.message + Date.now()}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
