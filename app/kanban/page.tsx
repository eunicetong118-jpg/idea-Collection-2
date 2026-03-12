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
      <div className="min-h-screen bg-lab-bg flex items-center justify-center">
        <div className="w-48">
          <div className="h-1 w-full bg-lab-ui/20 rounded-full overflow-hidden">
            <div className="h-full bg-lab-ui animate-pulse w-full" />
          </div>
          <p className="text-[10px] uppercase tracking-[0.4em] opacity-40 mt-4 text-center text-lab-text">
            Initializing board...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-lab-bg text-lab-text pb-20 relative overflow-hidden flex flex-col">
      <div className="fixed inset-0 paper-texture z-0" />

      <main className="flex-1 flex flex-col max-w-[1600px] mx-auto w-full px-6 lg:px-8 py-12 relative z-10 overflow-hidden">
        <header className="mb-12 ink-reveal">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-lab-ui/40 p-3 rounded-full text-lab-text">
              <Columns size={24} />
            </div>
            <h1 className="text-4xl font-bold tracking-tighter text-lab-text italic">
              Idea <span className="text-lab-ui">Pipeline</span>
            </h1>
          </div>
          <p className="text-[10px] uppercase tracking-[0.4em] opacity-40 font-bold">
            Synchronizing collective intelligence across implementation nodes
          </p>
        </header>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex-1 flex gap-6 overflow-x-auto pb-8 scrollbar-hide min-h-0">
            {COLUMNS.map((column) => (
              <div
                key={column.id}
                className="flex-1 min-w-[300px] flex flex-col bg-white/40 rounded-[2rem] border border-lab-ui/10 shadow-xl shadow-paper-shadow/5 overflow-hidden"
              >
                <div className="p-6 border-b border-lab-ui/10 flex items-center justify-between bg-white/20 backdrop-blur-sm">
                  <h2 className="text-[11px] font-black uppercase tracking-[0.3em] text-lab-text/60">
                    {column.title.replace(/\s+/g, '_')}
                  </h2>
                  <span className="bg-lab-ui/30 text-lab-text/60 text-[10px] font-bold px-3 py-1 rounded-full">
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
                        snapshot.isDraggingOver ? "bg-lab-ui/5" : "bg-transparent"
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
                              {/* Card Style: Washi Paper Matrix */}
                              <div className="absolute inset-0 bg-white/20 rounded-2xl translate-x-1 translate-y-1 -z-10" />
                              <div className="bg-white/90 rounded-2xl p-6 shadow-lg shadow-paper-shadow/10 border border-lab-ui/10 relative overflow-hidden cursor-pointer">
                                <div className="paper-texture absolute inset-0 opacity-10" />

                                <h3 className="text-lg font-bold tracking-tight text-lab-text mb-4 leading-tight">
                                  {idea.title}
                                </h3>

                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-lab-ui/40 flex items-center justify-center text-[10px] font-bold">
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
