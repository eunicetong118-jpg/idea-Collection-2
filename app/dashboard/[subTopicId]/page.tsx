"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import IdeaCard from "@/components/IdeaCard";
import IdeaForm from "@/components/IdeaForm";
import { Plus, LayoutDashboard, ChevronRight } from "lucide-react";
import clsx from "clsx";

interface SubTopic {
  id: string;
  title: string;
}

interface Idea {
  _id: string;
  title: string;
  description: string;
  userId: string;
  userName: string;
  createdAt: string;
  lastActivityAt: string;
  stage: string;
  stage_status: string;
  likes: string[];
  commentCount: number;
}

export default function DashboardPage() {
  const params = useParams();
  const router = useRouter();
  const subTopicId = params.subTopicId as string;

  const [theme, setTheme] = useState<{ title: string }>({ title: "" });
  const [subTopics, setSubTopics] = useState<SubTopic[]>([]);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const currentSubTopic = subTopics.find((st) => st.id === subTopicId);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [themeRes, subTopicsRes, ideasRes] = await Promise.all([
          fetch("/api/admin/theme"),
          fetch("/api/admin/subtopics"),
          fetch(`/api/ideas?subTopicId=${subTopicId}`),
        ]);

        if (themeRes.ok) setTheme(await themeRes.json());
        if (subTopicsRes.ok) setSubTopics(await subTopicsRes.json());
        if (ideasRes.ok) setIdeas(await ideasRes.json());
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (subTopicId) {
      fetchData();
    }
  }, [subTopicId]);

  const sortedIdeas = useMemo(() => {
    return [...ideas].sort((a, b) => {
      const aIsDone = a.stage === "Implement" && a.stage_status === "Done";
      const bIsDone = b.stage === "Implement" && b.stage_status === "Done";

      // Done cards always at the bottom
      if (aIsDone && !bIsDone) return 1;
      if (!aIsDone && bIsDone) return -1;

      // Score-based sorting for others
      const getScore = (idea: Idea) => {
        const likesWeight = (idea.likes?.length || 0) * 10;
        const commentsWeight = (idea.commentCount || 0) * 5;
        const recencyWeight = new Date(idea.lastActivityAt || idea.createdAt).getTime() / (1000 * 60 * 60); // hours since epoch
        return likesWeight + commentsWeight + recencyWeight;
      };

      return getScore(b) - getScore(a);
    });
  }, [ideas]);

  const handleIdeaSuccess = () => {
    setShowAddModal(false);
    // Refresh ideas
    fetch(`/api/ideas?subTopicId=${subTopicId}`)
      .then((res) => res.json())
      .then((data) => setIdeas(data));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-blue-200 rounded-full mb-4"></div>
          <p className="text-gray-500 font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div>
              <div className="flex items-center text-sm text-gray-500 mb-1">
                <LayoutDashboard size={14} className="mr-1" />
                <span>Dashboard</span>
                <ChevronRight size={14} className="mx-1" />
                <span className="font-medium text-gray-900">{theme.title}</span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                {currentSubTopic?.title || "Select a Topic"}
              </h1>
            </div>

            {/* Sub-topics Navigation */}
            <nav className="flex items-center space-x-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
              {subTopics.map((st) => (
                <button
                  key={st.id}
                  onClick={() => router.push(`/dashboard/${st.id}`)}
                  className={clsx(
                    "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                    subTopicId === st.id
                      ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                      : "bg-white text-gray-600 border border-gray-200 hover:border-blue-300 hover:text-blue-600"
                  )}
                >
                  {st.title}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {sortedIdeas.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <div className="mx-auto h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Plus size={32} className="text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No ideas yet</h2>
            <p className="text-gray-500 max-w-xs mx-auto">
              Be the first to share an idea for {currentSubTopic?.title}!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedIdeas.map((idea) => (
              <IdeaCard key={idea._id} idea={idea} />
            ))}
          </div>
        )}
      </main>

      {/* Floating Add Button */}
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-8 right-8 h-14 w-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 flex items-center justify-center transition-all hover:scale-110 active:scale-95 z-40"
      >
        <Plus size={28} />
      </button>

      {/* Idea Form Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Add New Idea</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Plus size={24} className="rotate-45" />
              </button>
            </div>
            <div className="p-6">
              <IdeaForm subTopicId={subTopicId} onSuccess={handleIdeaSuccess} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
