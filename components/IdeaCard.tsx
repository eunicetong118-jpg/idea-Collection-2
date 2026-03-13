"use client";

import React, { useState, useEffect } from "react";
import { ThumbsUp, MessageSquare, User, Calendar, ExternalLink, ChevronDown, ChevronUp, Briefcase, Globe, BarChart3, ShieldAlert, Package, DollarSign } from "lucide-react";
import { useSession } from "next-auth/react";
import { clsx } from "clsx";
import { FEATURE_FLAGS } from "@/lib/feature-flags";

interface Idea {
  _id: string;
  title: string;
  description?: string; // Old field
  problem?: string;
  solution?: string;
  relatedProduct?: string;
  additionalBusiness?: string;
  involvement?: string;
  department?: string;
  country?: string;
  revenue?: string | number;
  impact?: string;
  fileBase64?: string;
  userId: string;
  userName: string;
  createdAt: string;
  stage: string;
  stage_status: string;
  likes: string[];
  commentCount: number;
  summary?: string;
}

interface Comment {
  _id: string;
  content: string;
  userName: string;
  createdAt: string;
}

interface IdeaCardProps {
  idea: Idea;
}

export default function IdeaCard({ idea }: IdeaCardProps) {
  const { data: session } = useSession();
  const [likes, setLikes] = useState(idea.likes || []);
  const [commentCount, setCommentCount] = useState(idea.commentCount || 0);
  const [showComments, setShowComments] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [stage, setStage] = useState(idea.stage);
  const [stageStatus, setStageStatus] = useState(idea.stage_status);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showAiSummary, setShowAiSummary] = useState(false);
  const [showStatusControls, setShowStatusControls] = useState(false);

  const isAdmin = (session?.user as any)?.isAdmin === true;
  const hasLiked = session?.user?.email ? likes.includes(session.user.email) : false;

  const isLongProblem = (idea.problem?.trim().split(/\s+/).length ?? 0) > 100;
  const canShowSummary = isAdmin && FEATURE_FLAGS.ENABLE_AI_SUMMARY && isLongProblem && !!idea.summary;

  const isDone = stage === "Implement" && stageStatus === "Done";

  const displayRevenue = (rev: string | number | undefined) => {
    if (!rev) return null;
    if (typeof rev === 'number') {
      return `$${rev.toLocaleString()}`;
    }
    return rev;
  };

  const getStatusColor = () => {
    if (stage === "Implement" && stageStatus === "Done") return "bg-green-500";
    if ((stage === "Idea" || stage === "Development") && (stageStatus === "In Progress" || stageStatus === "Done")) return "bg-amber-500";
    if (stage === "Development" && stageStatus === "Pending") return "bg-red-500";
    return "bg-lab-ui";
  };

  const stages = ["Idea", "Development", "Implement"];
  const statuses = ["Pending", "In Progress", "Done"];

  const updateStatus = async (newStage: string, newStatus: string) => {
    if (!isAdmin || updatingStatus) return;
    setUpdatingStatus(true);
    try {
      const response = await fetch(`/api/ideas/${idea._id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: newStage, stage_status: newStatus }),
      });
      if (response.ok) {
        setStage(newStage);
        setStageStatus(newStatus);
      }
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const toggleLike = async () => {
    if (!session) return;

    try {
      const response = await fetch(`/api/ideas/${idea._id}/like`, {
        method: "POST",
      });
      if (response.ok) {
        const data = await response.json();
        if (data.liked) {
          setLikes([...likes, session.user?.email as string]);
        } else {
          setLikes(likes.filter((email) => email !== session.user?.email));
        }
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const fetchComments = async () => {
    setLoadingComments(true);
    try {
      const response = await fetch(`/api/ideas/${idea._id}/comments`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoadingComments(false);
    }
  };

  useEffect(() => {
    if (showComments) {
      fetchComments();
    }
  }, [showComments]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || submittingComment) return;

    setSubmittingComment(true);
    try {
      const response = await fetch(`/api/ideas/${idea._id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment }),
      });
      if (response.ok) {
        const data = await response.json();
        setComments([...comments, data.comment]);
        setNewComment("");
        setCommentCount(commentCount + 1);
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const isGlass = FEATURE_FLAGS.ENABLE_LIQUID_GLASS;
  const isLG2 = FEATURE_FLAGS.ENABLE_LIQUID_GLASS_V2;

  return (
    <div className="relative group">
      {/* Decorative Layers */}
      {!isLG2 && (
        isGlass ? (
          <>
            <div className="absolute inset-0 bg-white/5 rounded-[2rem] translate-x-2 translate-y-2 -z-10 group-hover:translate-x-3 group-hover:translate-y-3 transition-transform duration-500" />
            <div className="absolute inset-0 bg-white/10 rounded-[2rem] translate-x-1 translate-y-1 -z-10 group-hover:translate-x-1.5 group-hover:translate-y-1.5 transition-transform duration-500" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-white/20 rounded-[2rem] translate-x-2 translate-y-2 -z-10 group-hover:translate-x-3 group-hover:translate-y-3 transition-transform duration-500" />
            <div className="absolute inset-0 bg-white/40 rounded-[2rem] translate-x-1 translate-y-1 -z-10 group-hover:translate-x-1.5 group-hover:translate-y-1.5 transition-transform duration-500" />
          </>
        )
      )}

      <div
        data-testid="idea-card-container"
        className={clsx(
          "rounded-[2rem] p-10 shadow-2xl border-none transition-all duration-500 relative",
          isLG2
            ? "lg2-glass-bubble"
            : (isGlass ? "glass-card hover:translate-y-[-6px]" : "bg-white/90 shadow-paper-shadow hover:translate-y-[-6px]"),
          isDone && "opacity-60 grayscale-[0.3]"
        )}
      >
        {/* AI Summary Popup (Overlay) */}
        {showAiSummary && (
          <div className="absolute inset-0 z-[100] animate-in fade-in zoom-in-95 duration-300 p-6 pointer-events-none">
            <div className={clsx(
              "w-full h-full p-8 rounded-[1.5rem] shadow-2xl relative border flex flex-col justify-center overflow-y-auto",
              isLG2
                ? "lg2-glass-board border-white/20 text-slate-800"
                : (isGlass ? "bg-glass-text/95 text-white border-white/10 backdrop-blur-xl" : "bg-lab-text/95 text-lab-bg border-white/10")
            )}>
              <div className="flex items-center gap-3 mb-4 opacity-60">
                <div className={clsx(
                  "w-2 h-2 rounded-full animate-pulse",
                  isLG2 ? "bg-teal-500" : (isGlass ? "bg-glass-secondary" : "bg-lab-ui")
                )} />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">AI_SYNTHESIS_SUMMARY</span>
              </div>
              <p className="text-lg font-medium leading-relaxed italic serif">
                "{idea.summary}"
              </p>
            </div>
          </div>
        )}

        {/* Popular Idea Seal (Hanko) */}
        {likes.length >= 5 && (
          <div className="absolute -top-2 -right-4 rotate-12 scale-75 opacity-60 pointer-events-none">
            <div className="hanko-seal border-red-600 text-red-600">
              POPULAR<br />NODES
            </div>
          </div>
        )}

        <div className="flex justify-between items-start mb-8">
          <div
            data-testid="idea-status-section"
            className="flex items-center space-x-3 cursor-pointer"
            onMouseEnter={() => isAdmin && setShowStatusControls(true)}
            onMouseLeave={() => setShowStatusControls(false)}
          >
            <div className={clsx(
              "w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.1)]",
              getStatusColor()
            )} />
            <span className={clsx(
              "text-[10px] font-black uppercase tracking-[0.3em] opacity-40",
              isLG2 ? "text-slate-800" : (isGlass ? "text-white" : "text-lab-text")
            )}>
              {stage} // {stageStatus}
            </span>
          </div>

          {/* Admin Status Controls - Appears on Hover */}
          {isAdmin && (
            <div
              data-testid="admin-status-controls"
              className={clsx(
                "absolute top-8 right-10 transition-opacity duration-300 flex flex-col items-end gap-2 z-50",
                showStatusControls ? "opacity-100" : "opacity-0 pointer-events-none"
              )}
              onMouseEnter={() => setShowStatusControls(true)}
              onMouseLeave={() => setShowStatusControls(false)}
            >
            <div className={clsx(
              "p-3 rounded-2xl shadow-xl flex flex-col gap-3 animate-in fade-in slide-in-from-right-4",
              isLG2
                ? "lg2-glass-board border-white/20"
                : (isGlass ? "glass-card" : "bg-white/95 backdrop-blur-md border border-lab-ui/20")
            )}>
              <div className="flex flex-col gap-1">
                <span className={clsx(
                  "text-[8px] font-black uppercase tracking-widest ml-1",
                  isLG2 ? "text-slate-400" : (isGlass ? "text-white/40" : "text-lab-text/40")
                )}>Set Stage</span>
                <div className="flex gap-1">
                  {stages.map((s) => (
                    <button
                      key={s}
                      onClick={() => updateStatus(s, stageStatus)}
                      className={clsx(
                        "px-2 py-1 rounded-md text-[9px] font-bold uppercase transition-all",
                        isLG2
                          ? stage === s
                            ? "bg-slate-800 text-white"
                            : "lg2-glass-bubble text-slate-600 hover:text-slate-800"
                          : (isGlass
                            ? stage === s
                              ? "bg-white text-glass-text"
                              : "bg-white/10 text-white hover:bg-white/20"
                            : stage === s
                              ? "bg-lab-text text-lab-bg"
                              : "bg-lab-ui/20 text-lab-text hover:bg-lab-ui/40")
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <span className={clsx(
                  "text-[8px] font-black uppercase tracking-widest ml-1",
                  isLG2 ? "text-slate-400" : (isGlass ? "text-white/40" : "text-lab-text/40")
                )}>Set Status</span>
                <div className="flex gap-1">
                  {statuses.map((s) => (
                    <button
                      key={s}
                      onClick={() => updateStatus(stage, s)}
                      className={clsx(
                        "px-2 py-1 rounded-md text-[9px] font-bold uppercase transition-all",
                        isLG2
                          ? stageStatus === s
                            ? "bg-slate-800 text-white"
                            : "lg2-glass-bubble text-slate-600 hover:text-slate-800"
                          : (isGlass
                            ? stageStatus === s
                              ? "bg-white text-glass-text"
                              : "bg-white/10 text-white hover:bg-white/20"
                            : stageStatus === s
                              ? "bg-lab-text text-lab-bg"
                              : "bg-lab-ui/20 text-lab-text hover:bg-lab-ui/40")
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            </div>
          )}

          {isDone && (
            <span className={clsx(
              "text-green-700 text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border border-green-700/10 bg-green-700/5 transition-opacity duration-300",
              isAdmin && showStatusControls && "opacity-0"
            )}>
              DONE
            </span>
          )}
        </div>

        <div>
          <h3
            data-testid="idea-title"
            className={clsx(
              "text-3xl font-bold tracking-tight mb-6 leading-[1.1]",
              isLG2 ? "text-slate-800" : (isGlass ? "text-white" : "text-lab-text"),
              canShowSummary && "cursor-help"
            )}
            onMouseEnter={() => canShowSummary && setShowAiSummary(true)}
            onMouseLeave={() => setShowAiSummary(false)}
          >
            {idea.title}
          </h3>

          <div className="relative mb-4">
            <p
              data-testid="idea-problem-text"
              className={clsx(
                "text-lg whitespace-pre-wrap leading-relaxed font-light italic serif transition-all duration-300",
                isLG2 ? "text-slate-600" : (isGlass ? "text-white/70" : "text-lab-text/70"),
                !isExpanded && "line-clamp-3"
              )}
            >
              {idea.problem || idea.description}
            </p>
            {(idea.problem || idea.description || "").length > 150 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={clsx(
                  "text-[10px] font-black uppercase tracking-[0.2em] mt-2 transition-colors flex items-center gap-1",
                  isLG2 ? "text-teal-600 hover:text-teal-800" : (isGlass ? "text-glass-secondary hover:text-white" : "text-lab-ui hover:text-lab-text")
                )}
              >
                {isExpanded ? (
                  <>SHOW_LESS <ChevronUp size={12} /></>
                ) : (
                  <>EXTEND_NODE <ChevronDown size={12} /></>
                )}
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-4 mb-8">
            {idea.department && (
              <span className={clsx(
                "flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                isLG2
                  ? "bg-slate-100 text-slate-500 border-slate-200"
                  : (isGlass ? "bg-white/10 text-white/60 border-white/20" : "bg-lab-ui/10 text-lab-text/60 border-lab-ui/20")
              )}>
                <Briefcase size={10} /> {idea.department}
              </span>
            )}
            {idea.country && (
              <span className={clsx(
                "flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                isLG2
                  ? "bg-slate-100 text-slate-500 border-slate-200"
                  : (isGlass ? "bg-white/10 text-white/60 border-white/20" : "bg-lab-ui/10 text-lab-text/60 border-lab-ui/20")
              )}>
                <Globe size={10} /> {idea.country}
              </span>
            )}
            {idea.impact && (
              <span className={clsx(
                "flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                idea.impact === "Critical"
                  ? isLG2
                    ? "bg-red-50 text-red-600 border-red-100"
                    : (isGlass ? "bg-red-500/20 text-red-400 border-red-500/30" : "bg-red-500/10 text-red-600 border-red-500/20")
                  : idea.impact === "High"
                    ? isLG2
                      ? "bg-orange-50 text-orange-600 border-orange-100"
                      : (isGlass ? "bg-orange-500/20 text-orange-400 border-orange-500/30" : "bg-orange-500/10 text-orange-600 border-orange-500/20")
                    : isLG2
                      ? "bg-slate-100 text-slate-500 border-slate-200"
                      : (isGlass ? "bg-white/10 text-white/60 border-white/20" : "bg-lab-ui/10 text-lab-text/60 border-lab-ui/20")
              )}>
                <BarChart3 size={10} /> {idea.impact}
              </span>
            )}
          </div>

          {/* Details Toggle */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowDetails(!showDetails);
            }}
            className={clsx(
              "flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] transition-colors mb-8 group/details cursor-pointer relative z-10",
              isLG2 ? "text-slate-400 hover:text-slate-800" : (isGlass ? "text-glass-secondary hover:text-white" : "text-lab-ui hover:text-lab-text")
            )}
          >
            {showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {showDetails ? "HIDE_DETAILS" : "VIEW_FULL_CARD"}
          </button>

          {showDetails && (
            <div className={clsx(
              "mb-10 space-y-8 animate-in fade-in duration-500 slide-in-from-top-4 border-t pt-8",
              isLG2 ? "border-slate-100" : (isGlass ? "border-white/10" : "border-lab-ui/10")
            )}>
              {!idea.solution && !idea.relatedProduct && !idea.additionalBusiness && !idea.involvement && !idea.revenue && !idea.fileBase64 ? (
                <p className={clsx(
                  "text-[10px] font-black uppercase tracking-widest italic",
                  isLG2 ? "text-slate-300" : (isGlass ? "text-white/30" : "text-lab-text/30")
                )}>NO_ADDITIONAL_INTELLIGENCE_RECORDED_FOR_THIS_NODE</p>
              ) : (
                <>
                  {/* Solution Section */}
                  {idea.solution && (
                    <div className={clsx(
                      "p-6 rounded-2xl border",
                      isLG2 ? "bg-slate-50 border-slate-100" : (isGlass ? "bg-white/5 border-white/10" : "bg-lab-ui/5 border-lab-ui/10")
                    )}>
                      <h4 className={clsx(
                        "text-[10px] font-black uppercase tracking-[0.3em] mb-3 break-words whitespace-normal",
                        isLG2 ? "text-slate-400" : (isGlass ? "text-white/40" : "text-lab-text/40")
                      )}>Proposed Solution</h4>
                      <p className={clsx(
                        "text-base leading-relaxed whitespace-pre-wrap",
                        isLG2 ? "text-slate-700" : (isGlass ? "text-white/80" : "text-lab-text/80")
                      )}>{idea.solution}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {idea.relatedProduct && (
                      <div className={clsx(
                        "p-6 rounded-2xl border",
                        isLG2 ? "bg-slate-50 border-slate-100" : (isGlass ? "bg-white/5 border-white/10" : "bg-lab-ui/5 border-lab-ui/10")
                      )}>
                        <h4 className={clsx(
                          "text-[10px] font-black uppercase tracking-[0.3em] mb-3 break-words whitespace-normal",
                          isLG2 ? "text-slate-400" : (isGlass ? "text-white/40" : "text-lab-text/40")
                        )}>Related Product</h4>
                        <p className={clsx(
                          "text-sm leading-relaxed whitespace-pre-wrap",
                          isLG2 ? "text-slate-600" : (isGlass ? "text-white/80" : "text-lab-text/80")
                        )}>{idea.relatedProduct}</p>
                      </div>
                    )}
                    {idea.additionalBusiness && (
                      <div className={clsx(
                        "p-6 rounded-2xl border",
                        isLG2 ? "bg-slate-50 border-slate-100" : (isGlass ? "bg-white/5 border-white/10" : "bg-lab-ui/5 border-lab-ui/10")
                      )}>
                        <h4 className={clsx(
                          "text-[10px] font-black uppercase tracking-[0.3em] mb-3 break-words whitespace-normal",
                          isLG2 ? "text-slate-400" : (isGlass ? "text-white/40" : "text-lab-text/40")
                        )}>Additional Business</h4>
                        <p className={clsx(
                          "text-sm leading-relaxed whitespace-pre-wrap",
                          isLG2 ? "text-slate-600" : (isGlass ? "text-white/80" : "text-lab-text/80")
                        )}>{idea.additionalBusiness}</p>
                      </div>
                    )}
                    {idea.involvement && (
                      <div className={clsx(
                        "p-6 rounded-2xl border",
                        isLG2 ? "bg-slate-50 border-slate-100" : (isGlass ? "bg-white/5 border-white/10" : "bg-lab-ui/5 border-lab-ui/10")
                      )}>
                        <h4 className={clsx(
                          "text-[10px] font-black uppercase tracking-[0.3em] mb-3 break-words whitespace-normal",
                          isLG2 ? "text-slate-400" : (isGlass ? "text-white/40" : "text-lab-text/40")
                        )}>Development Involvement</h4>
                        <p className={clsx(
                          "text-sm leading-relaxed whitespace-pre-wrap",
                          isLG2 ? "text-slate-600" : (isGlass ? "text-white/80" : "text-lab-text/80")
                        )}>{idea.involvement}</p>
                      </div>
                    )}
                    {idea.revenue && (
                      <div className={clsx(
                        "p-6 rounded-2xl border",
                        isLG2 ? "bg-slate-50 border-slate-100" : (isGlass ? "bg-white/5 border-white/10" : "bg-lab-ui/5 border-lab-ui/10")
                      )}>
                        <h4 className={clsx(
                          "text-[10px] font-black uppercase tracking-[0.3em] mb-3 flex items-center gap-2 break-words whitespace-normal",
                          isLG2 ? "text-slate-400" : (isGlass ? "text-white/40" : "text-lab-text/40")
                        )}>
                          <DollarSign size={12} /> Potential Revenue
                        </h4>
                        <p className={clsx(
                          "text-sm font-bold",
                          isLG2 ? "text-slate-800" : (isGlass ? "text-white" : "text-lab-text")
                        )}>
                          {displayRevenue(idea.revenue)} {typeof idea.revenue === 'number' && <span className="text-[10px] font-normal opacity-40">USD</span>}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Uploaded Image */}
                  {idea.fileBase64 && (
                    <div className="space-y-3">
                      <h4 className={clsx(
                        "text-[10px] font-black uppercase tracking-[0.3em] break-words whitespace-normal",
                        isLG2 ? "text-slate-400" : (isGlass ? "text-white/40" : "text-lab-text/40")
                      )}>Visual Asset Nodes</h4>
                      <div className={clsx(
                        "rounded-[1.5rem] overflow-hidden border shadow-lg group/img relative",
                        isLG2 ? "border-slate-100" : (isGlass ? "border-white/20" : "border-lab-ui/20")
                      )}>
                        <img
                          src={idea.fileBase64}
                          alt={idea.title}
                          className="w-full h-auto object-contain transition-transform duration-700 group-hover/img:scale-105"
                        />
                        <div className={clsx(
                          "absolute inset-0 opacity-0 group-hover/img:opacity-100 transition-opacity pointer-events-none",
                          isGlass ? "bg-white/20" : "bg-lab-text/20"
                        )} />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          <div className={clsx(
            "flex items-start justify-between text-xs font-bold tracking-widest uppercase opacity-40 mb-10 border-t pt-6 gap-4",
            isLG2 ? "border-slate-100 text-slate-800" : (isGlass ? "border-white/10 text-white" : "border-lab-text/5 text-lab-text")
          )}>
            <span className="flex-1 break-words">USR_{idea.userName.toUpperCase()}</span>
            <span className="shrink-0 whitespace-nowrap">TS_{new Date(idea.createdAt).toLocaleDateString()}</span>
          </div>

          <div className="flex items-center space-x-6">
            <button
              onClick={toggleLike}
              className={clsx(
                "flex items-center justify-center w-14 h-14 rounded-full transition-all duration-500 shadow-lg hover:shadow-xl active:scale-90",
                isLG2
                  ? hasLiked
                    ? "lg2-liquid-teal text-white shadow-xl"
                    : "lg2-glass-bubble text-teal-600 hover:text-teal-800"
                  : (isGlass
                    ? hasLiked
                      ? "glass-button text-white"
                      : "bg-white/10 text-white hover:bg-white/20"
                    : hasLiked
                      ? "bg-lab-ui text-lab-bg"
                      : "bg-lab-ui/10 text-lab-ui hover:bg-lab-ui/20")
              )}
            >
              <ThumbsUp size={24} fill={hasLiked ? "currentColor" : "none"} />
            </button>

            <button
              onClick={() => setShowComments(!showComments)}
              className={clsx(
                "flex items-center justify-center w-14 h-14 rounded-full transition-all duration-500 shadow-lg hover:shadow-xl active:scale-90",
                isLG2
                  ? showComments
                    ? "lg2-liquid-purple text-white shadow-xl"
                    : "lg2-glass-bubble text-slate-600 hover:text-slate-800"
                  : (isGlass
                    ? showComments
                      ? "bg-white text-glass-text"
                      : "bg-white/10 text-white hover:bg-white/20"
                    : showComments
                      ? "bg-lab-text text-lab-bg"
                      : "bg-lab-text/5 text-lab-text hover:bg-lab-text/10")
              )}
            >
              <MessageSquare size={24} />
            </button>

            <div className={clsx(
              "flex-1 flex justify-end items-center space-x-6 text-[10px] font-black tracking-[0.2em] opacity-30 uppercase",
              isLG2 ? "text-slate-800" : (isGlass ? "text-white" : "text-lab-text")
            )}>
              <span>{likes.length} LKS</span>
              <span>{commentCount} CMS</span>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className={clsx(
            "mt-10 pt-10 border-t",
            isLG2 ? "border-slate-100" : (isGlass ? "border-white/10" : "border-lab-text/5"),
            isLG2 ? "lg2-reveal" : (isGlass ? "glass-reveal" : "ink-reveal")
          )}>
            <div className="space-y-8 mb-10 pr-4">
              {loadingComments ? (
                <p className={clsx(
                  "text-xs font-bold uppercase tracking-widest animate-pulse",
                  isLG2 ? "text-slate-400" : (isGlass ? "text-white/40" : "text-lab-text/40")
                )}>Syncing nodes...</p>
              ) : comments.length === 0 ? (
                <p className={clsx(
                  "text-xs font-bold uppercase tracking-widest",
                  isLG2 ? "text-slate-400" : (isGlass ? "text-white/40" : "text-lab-text/40")
                )}>No communications recorded.</p>
              ) : (
                comments.map((comment, index) => (
                  <div key={index} className={clsx(
                    "pb-8 border-b last:border-none",
                    isLG2 ? "border-slate-50" : (isGlass ? "border-white/10" : "border-lab-text/5")
                  )}>
                    <div className="flex justify-between items-center mb-3">
                      <span className={clsx(
                        "text-xs font-black uppercase tracking-widest",
                        isLG2 ? "text-slate-800" : (isGlass ? "text-white" : "text-lab-text")
                      )}>ID_{comment.userName.toUpperCase()}</span>
                      <span className={clsx(
                        "text-[10px] font-bold tracking-widest",
                        isLG2 ? "text-slate-300" : (isGlass ? "text-white/30" : "text-lab-text/30")
                      )}>
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className={clsx(
                      "text-base leading-relaxed font-sans",
                      isLG2 ? "text-slate-600" : (isGlass ? "text-white/70" : "text-lab-text/70")
                    )}>{comment.content}</p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleAddComment} className="relative mt-6 group/form">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="ENTER_REPLY_SEQUENCE..."
                className={clsx(
                  "w-full rounded-[1.5rem] p-6 text-base focus:outline-none transition-all resize-none h-28 font-bold",
                  isLG2
                    ? "lg2-glass-bubble border-slate-200 text-slate-800 placeholder:text-slate-300"
                    : (isGlass
                      ? "glass-input text-white placeholder:text-white/20"
                      : "bg-lab-ui/5 text-lab-text placeholder:text-lab-text/20 focus:bg-lab-ui/10")
                )}
                disabled={submittingComment}
              />
              <button
                type="submit"
                disabled={!newComment.trim() || submittingComment}
                className={clsx(
                  "absolute bottom-6 right-6 text-[10px] font-black tracking-[0.2em] px-8 py-3 rounded-full transition-all disabled:opacity-20 uppercase shadow-xl",
                  isLG2
                    ? "lg2-liquid-teal text-white"
                    : (isGlass
                      ? "glass-button text-white"
                      : "bg-lab-text text-lab-bg hover:bg-lab-ui hover:text-lab-text")
                )}
              >
                {submittingComment ? "TRANSMITTING..." : "POST_LOG"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
