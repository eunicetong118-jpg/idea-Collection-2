"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { useSession } from "next-auth/react";
import { Columns, ArrowRight, User as UserIcon } from "lucide-react";
import { clsx } from "clsx";
import { FEATURE_FLAGS } from "@/lib/feature-flags";

interface Idea {
  _id: string;
  title: string;
  userName: string;
  createdAt: string;
  stage: string;
  stage_status: string;
  subTopicId: string;
}

const COLUMNS = [
  { id: "backlog", title: "Backlog", stage: "Idea", status: "Pending" },
  { id: "reviewing", title: "Reviewing", stage: "Idea", status: "In Progress" },
  { id: "selected", title: "Selected for development", stage: "Development", status: "Pending" },
  { id: "development", title: "Development", stage: "Development", status: "In Progress" },
  { id: "done", title: "Done", stage: "Development", status: "Done" },
];

export default function KanbanPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = (session?.user as any)?.isAdmin === true;
  const isGlass = FEATURE_FLAGS.ENABLE_LIQUID_GLASS;
  const isLG2 = FEATURE_FLAGS.ENABLE_LIQUID_GLASS_V2;

  useEffect(() => {
    if (!FEATURE_FLAGS.ENABLE_KANBAN_BOARD) {
      router.push("/");
      return;
    }

    const fetchIdeas = async () => {
      try {
        const res = await fetch("/api/ideas");
        if (res.ok) {
          const data = await res.json();
          setIdeas(data);
        }
      } catch (error) {
        console.error("Error fetching ideas:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchIdeas();
  }, [router]);

  const columnsData = useMemo(() => {
    const data: Record<string, Idea[]> = {
      backlog: [],
      reviewing: [],
      selected: [],
      development: [],
      done: [],
    };

    ideas.forEach((idea) => {
      if (idea.stage === "Idea" && idea.stage_status === "Pending") {
        data.backlog.push(idea);
      } else if (idea.stage === "Idea" && idea.stage_status === "In Progress") {
        data.reviewing.push(idea);
      } else if (idea.stage === "Development" && idea.stage_status === "Pending") {
        data.selected.push(idea);
      } else if (idea.stage === "Development" && idea.stage_status === "In Progress") {
        data.development.push(idea);
      } else if (
        (idea.stage === "Development" && idea.stage_status === "Done") ||
        idea.stage === "Implement"
      ) {
        data.done.push(idea);
      }
    });

    // Sort each column by creation date (oldest first for Kanban flow, or newest first?)
    // User requested "sorted chronologically". Usually Kanban is oldest first (FIFO).
    Object.keys(data).forEach((key) => {
      data[key].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    });

    return data;
  }, [ideas]);

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    if (!isAdmin) {
      alert("Only administrators can move cards.");
      return;
    }

    const targetColumn = COLUMNS.find((col) => col.id === destination.droppableId);
    if (!targetColumn) return;

    // Optimistic update
    const updatedIdeas = ideas.map((idea) => {
      if (idea._id === draggableId) {
        return {
          ...idea,
          stage: targetColumn.stage,
          stage_status: targetColumn.status,
        };
      }
      return idea;
    });
    setIdeas(updatedIdeas);

    try {
      const response = await fetch(`/api/ideas/${draggableId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stage: targetColumn.stage,
          stage_status: targetColumn.status,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }
    } catch (error) {
      console.error("Error updating idea status:", error);
      // Revert on error
      const res = await fetch("/api/ideas");
      if (res.ok) {
        setIdeas(await res.json());
      }
    }
  };

  const handleCardClick = (idea: Idea) => {
    router.push(`/dashboard/${idea.subTopicId}#${idea._id}`);
  };

  if (loading || authStatus === "loading") {
    return (
      <div className={clsx(
        "min-h-screen flex items-center justify-center",
        isLG2
          ? "bg-lg2-bg"
          : (isGlass ? "bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f0f23]" : "bg-lab-bg")
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
            Initializing board...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={clsx(
      "min-h-screen pb-20 relative overflow-hidden flex flex-col transition-colors duration-500",
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

      <main className="flex-1 flex flex-col max-w-[1600px] mx-auto w-full px-6 lg:px-8 py-12 relative z-10 overflow-hidden">
        <header className={clsx("mb-12", isLG2 ? "lg2-reveal" : (isGlass ? "glass-reveal" : "ink-reveal"))}>
          <div className="flex items-center gap-4 mb-4">
            <div className={clsx(
              "p-3 rounded-full",
              isLG2
                ? "lg2-glass-bubble text-slate-800 border-white/40 shadow-xl"
                : (isGlass ? "bg-white/20 text-white" : "bg-lab-ui/40 text-lab-text")
            )}>
              <Columns size={24} />
            </div>
            <h1 className={clsx("text-4xl font-bold tracking-tighter italic", isLG2 ? "text-slate-800" : (isGlass ? "text-white" : "text-lab-text"))}>
              Idea <span className={isLG2 ? "text-teal-500" : (isGlass ? "text-glass-secondary" : "text-lab-ui")}>Pipeline</span>
            </h1>
          </div>
          <p className={clsx(
            "text-[10px] uppercase tracking-[0.4em] opacity-40 font-bold",
            isLG2 ? "text-slate-400" : (isGlass ? "text-white" : "")
          )}>
            Synchronizing collective intelligence across implementation nodes
          </p>
        </header>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex-1 flex gap-6 overflow-x-auto pb-8 scrollbar-hide min-h-0">
            {COLUMNS.map((column) => (
              <div
                key={column.id}
                className={clsx(
                  "flex-1 min-w-[300px] flex flex-col rounded-[2rem] shadow-xl overflow-hidden",
                  isLG2 ? "lg2-glass-board border-none" : (isGlass ? "glass-card" : "bg-white/40 border border-lab-ui/10 shadow-paper-shadow/5")
                )}
              >
                <div className={clsx(
                  "p-6 border-b flex items-center justify-between",
                  isLG2
                    ? "border-slate-100 bg-white/20 backdrop-blur-md"
                    : (isGlass ? "border-white/10 bg-white/10 backdrop-blur-sm" : "border-lab-ui/10 bg-white/20 backdrop-blur-sm")
                )}>
                  <h2 className={clsx(
                    "text-[11px] font-black uppercase tracking-[0.3em]",
                    isLG2 ? "text-slate-400" : (isGlass ? "text-white/60" : "text-lab-text/60")
                  )}>
                    {column.title.replace(/\s+/g, '_')}
                  </h2>
                  <span className={clsx(
                    "text-[10px] font-bold px-3 py-1 rounded-full",
                    isLG2 ? "bg-slate-100 text-slate-400" : (isGlass ? "bg-white/20 text-white/60" : "bg-lab-ui/30 text-lab-text/60")
                  )}>
                    {columnsData[column.id].length}
                  </span>
                </div>

                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className={clsx(
                        "flex-1 p-4 space-y-4 overflow-y-auto custom-scrollbar transition-colors duration-300",
                        snapshot.isDraggingOver
                          ? (isLG2 ? "bg-white/10" : (isGlass ? "bg-white/5" : "bg-lab-ui/5"))
                          : "bg-transparent"
                      )}
                    >
                      {columnsData[column.id].map((idea, index) => (
                        <Draggable
                          key={idea._id}
                          draggableId={idea._id}
                          index={index}
                          isDragDisabled={!isAdmin}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => handleCardClick(idea)}
                              className={clsx(
                                "group relative transition-all duration-300",
                                snapshot.isDragging ? "scale-105 z-50" : "hover:translate-y-[-4px]"
                              )}
                            >
                              {/* Card Style */}
                              {isLG2 ? (
                                <div className="lg2-glass-bubble p-6 relative overflow-hidden cursor-pointer border-white/40">
                                  <h3 className="text-lg font-bold tracking-tight text-slate-800 mb-4 leading-tight">
                                    {idea.title}
                                  </h3>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-800">
                                        {idea.userName.charAt(0).toUpperCase()}
                                      </div>
                                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                                        {idea.userName.split(' ')[0]}
                                      </span>
                                    </div>
                                    <div className="text-teal-500 group-hover:translate-x-1 transition-transform">
                                      <ArrowRight size={14} />
                                    </div>
                                  </div>
                                </div>
                              ) : isGlass ? (
                                <>
                                  <div className="absolute inset-0 bg-white/5 rounded-2xl translate-x-1 translate-y-1 -z-10" />
                                  <div className="glass-card p-6 relative overflow-hidden cursor-pointer">
                                    <h3 className="text-lg font-bold tracking-tight text-white mb-4 leading-tight">
                                      {idea.title}
                                    </h3>
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-bold text-white">
                                          {idea.userName.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="text-[9px] font-black uppercase tracking-widest text-white/40">
                                          {idea.userName.split(' ')[0]}
                                        </span>
                                      </div>
                                      <div className="text-glass-secondary group-hover:translate-x-1 transition-transform">
                                        <ArrowRight size={14} />
                                      </div>
                                    </div>
                                  </div>
                                </>
                              ) : (
                                <>
                                  <div className="absolute inset-0 bg-white/20 rounded-2xl translate-x-1 translate-y-1 -z-10" />
                                  <div className="bg-white/90 rounded-2xl p-6 shadow-lg shadow-paper-shadow/10 border border-lab-ui/10 relative overflow-hidden cursor-pointer">
                                    <div className="paper-texture absolute inset-0 opacity-10" />
                                    <h3 className="text-lg font-bold tracking-tight text-lab-text mb-4 leading-tight">
                                      {idea.title}
                                    </h3>
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-lab-ui/40 flex items-center justify-center text-[10px] font-bold text-lab-text">
                                          {idea.userName.charAt(0).toUpperCase()}
                                        </div>
                                        <span className="text-[9px] font-black uppercase tracking-widest text-lab-text/40">
                                          {idea.userName.split(' ')[0]}
                                        </span>
                                      </div>
                                      <div className="text-lab-ui group-hover:translate-x-1 transition-transform">
                                        <ArrowRight size={14} />
                                      </div>
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      </main>
    </div>
  );
}
