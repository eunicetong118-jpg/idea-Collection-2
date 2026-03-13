"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import IdeaCard from "@/components/IdeaCard";
import IdeaForm from "@/components/IdeaForm";
import { Plus } from "lucide-react";
import { clsx } from "clsx";
import { FEATURE_FLAGS } from "@/lib/feature-flags";

interface SubTopic {
  id: string;
  title: string;
}

interface Idea {
  _id: string;
  title: string;
  problem?: string;
  solution?: string;
  targetAudience?: string;
  impact?: string;
  risks?: string;
  resources?: string;
  revenue?: number;
  department?: string;
  country?: string;
  fileBase64?: string;
  description?: string;
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

  // Handle auto-scroll to card from URL hash
  useEffect(() => {
    if (!loading && window.location.hash) {
      const id = window.location.hash.substring(1);
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: "smooth", block: "center" });
          element.classList.add("ring-4", "ring-lab-ui", "ring-offset-8", "rounded-[2.5rem]", "transition-all", "duration-1000");
          setTimeout(() => {
            element.classList.remove("ring-4", "ring-lab-ui", "ring-offset-8");
          }, 3000);
        }
      }, 500); // Small delay to ensure cards are rendered and animations are playing
    }
  }, [loading]);

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

  const isGlass = FEATURE_FLAGS.ENABLE_LIQUID_GLASS;
  const isLG2 = FEATURE_FLAGS.ENABLE_LIQUID_GLASS_V2;

  if (loading) {
    return (
      <div className={clsx(
        "min-h-screen flex items-center justify-center",
        isLG2 ? "bg-lg2-bg" : (isGlass ? "bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f0f23]" : "bg-lab-bg")
      )}>
        <div className="w-48">
          <div className={clsx(
            "h-1 w-full rounded-full overflow-hidden",
            isLG2 ? "bg-slate-200" : (isGlass ? "bg-white/20" : "bg-lab-ui/20")
          )}>
            <div className={clsx(
              "h-full animate-pulse w-full",
              isLG2 ? "bg-teal-500" : (isGlass ? "bg-glass-secondary" : "bg-lab-ui")
            )} />
          </div>
          <p className={clsx(
            "text-[10px] uppercase tracking-[0.4em] opacity-40 mt-4 text-center",
            isLG2 ? "text-slate-800" : (isGlass ? "text-white" : "text-lab-text")
          )}>
            Unfolding matrix...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={clsx(
      "min-h-screen pb-20 relative overflow-hidden transition-colors duration-500",
      isLG2
        ? "bg-lg2-bg text-slate-800"
        : (isGlass ? "bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f0f23] text-white" : "bg-lab-bg text-lab-text")
    )}>
      {isLG2 ? (
        <div className="fixed inset-0 pointer-events-none opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_20%,#A855F7_0%,transparent_25%),radial-gradient(circle_at_80%_80%,#2DD4BF_0%,transparent_25%)] blur-3xl" />
        </div>
      ) : (
        isGlass ? (
          <>
            <div className="glass-bg-animated" />
            <div className="glass-orbs">
              <div className="glass-orb glass-orb-1" />
              <div className="glass-orb glass-orb-2" />
              <div className="glass-orb glass-orb-3" />
            </div>
          </>
        ) : (
          <div className="fixed inset-0 paper-texture z-0" />
        )
      )}

      {/* Sub-topics Navigation */}
      <div className={clsx(
        "sticky top-20 z-30 transition-all duration-300",
        isLG2
          ? "bg-lg2-bg/60 backdrop-blur-md border-b border-slate-200/50"
          : (isGlass ? "bg-black/20 backdrop-blur-md border-b border-white/5" : "bg-lab-bg/80 backdrop-blur-md border-b border-lab-ui/10")
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <nav className="flex items-center space-x-2 overflow-x-auto scrollbar-hide">
            {subTopics.map((st) => (
              <button
                key={st.id}
                onClick={() => router.push(`/dashboard/${st.id}`)}
                className={clsx(
                  "px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                  subTopicId === st.id
                    ? isLG2
                      ? "lg2-glass-bubble bg-slate-800 text-white shadow-lg"
                      : (isGlass ? "glass-button text-white shadow-md" : "bg-lab-ui text-lab-text shadow-md")
                    : isLG2
                      ? "lg2-glass-bubble text-slate-500 hover:text-slate-800"
                      : (isGlass ? "text-white/60 hover:bg-white/10" : "text-lab-text/60 hover:bg-lab-ui/20")
                )}
              >
                {st.title.replace(/\s+/g, '_').toUpperCase()}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 lg:px-8 pt-32 pb-12 relative z-10">
        <header className={clsx(
          "mb-16",
          isLG2 ? "lg2-reveal [animation-delay:200ms]" : (isGlass ? "glass-reveal [animation-delay:200ms]" : "ink-reveal [animation-delay:200ms]")
        )}>
          <h1 className={clsx(
            "text-5xl font-bold tracking-tighter italic",
            isLG2 ? "text-slate-800" : (isGlass ? "text-white" : "text-lab-text")
          )}>
            Share your <span className={isLG2 ? "text-teal-600" : (isGlass ? "text-glass-secondary" : "text-lab-ui")}>thoughts with us</span>
          </h1>
        </header>
        {sortedIdeas.length === 0 ? (
          <div className={clsx(
            "text-center py-32 rounded-[3rem] shadow-2xl",
            isLG2
              ? "lg2-glass-board border-white/20"
              : (isGlass ? "glass-card" : "bg-white/60 shadow-paper-shadow"),
            isLG2 ? "lg2-reveal [animation-delay:400ms]" : (isGlass ? "glass-reveal [animation-delay:400ms]" : "ink-reveal [animation-delay:400ms]")
          )}>
            <div className={clsx(
              "mx-auto h-20 w-20 rounded-full flex items-center justify-center mb-6",
              isLG2 ? "bg-slate-100" : (isGlass ? "bg-white/20" : "bg-lab-ui/20")
            )}>
              <Plus size={40} className={isLG2 ? "text-teal-500" : (isGlass ? "text-glass-secondary" : "text-lab-ui")} />
            </div>
            <h2 className={clsx(
              "text-3xl font-bold mb-3 tracking-tighter",
              isLG2 ? "text-slate-800" : (isGlass ? "text-white" : "text-lab-text")
            )}>Waiting for some nice ideas...</h2>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {sortedIdeas.map((idea, index) => (
              <div
                key={idea._id}
                id={idea._id}
                className={isLG2 ? "lg2-reveal" : (isGlass ? "glass-reveal" : "ink-reveal")}
                style={{ animationDelay: `${400 + index * 100}ms` }}
              >
                <IdeaCard idea={idea} />
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Floating Add Button */}
      <button
        onClick={() => setShowAddModal(true)}
        className={clsx(
          "fixed bottom-8 right-8 h-14 w-14 rounded-full shadow-xl transition-all z-40",
          isLG2
            ? "lg2-liquid-teal text-white hover:scale-110 shadow-2xl"
            : (isGlass ? "glass-button text-white hover:scale-110" : "bg-lab-ui text-lab-text shadow-paper-shadow hover:bg-lab-ui/80 hover:scale-110 active:scale-95")
        )}
      >
        <Plus size={24} />
      </button>

      {/* Idea Form Modal */}
      {showAddModal && (
        <div className={clsx(
          "fixed inset-0 flex items-center justify-center p-4 z-50 animate-in fade-in duration-300 overflow-y-auto",
          isLG2 ? "bg-slate-900/10 backdrop-blur-md" : (isGlass ? "bg-black/40 backdrop-blur-md" : "bg-lab-bg/95 backdrop-blur-md")
        )}>
          <div className={clsx(
            "w-full max-w-4xl my-8 overflow-hidden shadow-2xl border-none relative",
            isLG2
              ? "lg2-glass-board rounded-[2.5rem]"
              : (isGlass ? "glass-card" : "bg-white rounded-[2rem]")
          )}>
            <div className={clsx(
              "p-8 sticky top-0 z-10 flex justify-between items-center border-b",
              isLG2
                ? "bg-white/60 backdrop-blur-md border-slate-100"
                : (isGlass ? "bg-glass-text/95 border-white/10" : "bg-white border-lab-ui/10")
            )}>
              <div>
                <h2 className={clsx(
                  "text-2xl font-bold tracking-tight",
                  isLG2 ? "text-slate-800" : (isGlass ? "text-white" : "text-lab-text")
                )}>Idea Submission Form</h2>
                <p className={clsx(
                  "text-[10px] uppercase tracking-[0.3em] opacity-40 font-bold mt-1",
                  isLG2 ? "text-slate-500" : (isGlass ? "text-white" : "text-lab-text")
                )}>Initialize collective synchronization sequence</p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className={clsx(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                  isLG2
                    ? "lg2-glass-bubble text-slate-400 hover:text-slate-800"
                    : (isGlass ? "bg-white/10 text-white/40 hover:bg-white/20 hover:text-white" : "bg-lab-ui/10 text-lab-text/40 hover:bg-lab-ui hover:text-lab-text")
                )}
              >
                <Plus size={24} className="rotate-45" />
              </button>
            </div>
            <div className={clsx(
              "p-10 max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar",
              isGlass ? "" : ""
            )}>
              <IdeaForm subTopicId={subTopicId} onSuccess={handleIdeaSuccess} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
