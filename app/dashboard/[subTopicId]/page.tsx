"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import IdeaCard from "@/components/IdeaCard";
import IdeaForm from "@/components/IdeaForm";
import { Plus } from "lucide-react";
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

  const [subTopics, setSubTopics] = useState<SubTopic[]>([]);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const currentSubTopic = subTopics.find((st) => st.id === subTopicId);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subTopicsRes, ideasRes] = await Promise.all([
          fetch("/api/admin/subtopics"),
          fetch(`/api/ideas?subTopicId=${subTopicId}`),
        ]);

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
      <div className="min-h-screen bg-lab-bg flex items-center justify-center">
        <div className="w-48">
          <div className="h-1 w-full bg-lab-ui/20 rounded-full overflow-hidden">
            <div className="h-full bg-lab-ui animate-pulse w-full" />
          </div>
          <p className="text-[10px] uppercase tracking-[0.4em] opacity-40 mt-4 text-center text-lab-text">
            Unfolding matrix...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-lab-bg text-lab-text pb-20 relative overflow-hidden">
      <div className="fixed inset-0 paper-texture z-0" />

      {/* Sub-topics Navigation */}
      <div className="sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <nav className="flex items-center space-x-2 overflow-x-auto scrollbar-hide">
            {subTopics.map((st) => (
              <button
                key={st.id}
                onClick={() => router.push(`/dashboard/${st.id}`)}
                className={clsx(
                  "px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                  subTopicId === st.id
                    ? "bg-lab-ui text-lab-text shadow-md"
                    : "text-lab-text/60 hover:bg-lab-ui/20"
                )}
              >
                {st.title.replace(/\s+/g, '_').toUpperCase()}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <header className="mb-12">
          <div className="flex items-center space-x-4 mb-2">
            <span className="text-[10px] uppercase tracking-[0.4em] opacity-40">ACTIVE_SECTOR</span>
            <div className="h-[1px] w-12 bg-lab-ui/20" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-lab-text">Ideas Repository</h1>
        </header>
        {sortedIdeas.length === 0 ? (
          <div className="text-center py-20 bg-white/80 rounded-[2rem] shadow-xl shadow-paper-shadow">
            <div className="mx-auto h-16 w-16 bg-lab-ui/20 rounded-full flex items-center justify-center mb-4">
              <Plus size={32} className="text-lab-ui" />
            </div>
            <h2 className="text-2xl font-bold text-lab-text mb-2 tracking-tight">No ideas yet</h2>
            <p className="text-lab-text/60 max-w-xs mx-auto">
              Be the first to share an idea for {currentSubTopic?.title}!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedIdeas.map((idea) => (
              <IdeaCard key={idea._id} idea={idea} />
            ))}
          </div>
        )}
      </main>

      {/* Floating Add Button */}
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-8 right-8 h-14 w-14 bg-lab-ui text-lab-text rounded-full shadow-xl shadow-paper-shadow hover:bg-lab-ui/80 flex items-center justify-center transition-all hover:scale-110 active:scale-95 z-40"
      >
        <Plus size={24} />
      </button>

      {/* Idea Form Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-lab-bg/95 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2rem] w-full max-w-lg overflow-hidden shadow-2xl shadow-paper-shadow animate-in zoom-in-95 duration-300 border-none">
            <div className="p-8 flex justify-between items-center">
              <h2 className="text-2xl font-bold tracking-tight text-lab-text">Add New Idea</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-lab-text/40 hover:text-lab-text transition-colors"
              >
                <Plus size={24} className="rotate-45" />
              </button>
            </div>
            <div className="px-8 pb-8">
              <IdeaForm subTopicId={subTopicId} onSuccess={handleIdeaSuccess} />
            </div>
            {/* Modal Corner Accents */}
            <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-lab-ui" />
            <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-lab-ui" />
          </div>
        </div>
      )}
    </div>
  );
}
