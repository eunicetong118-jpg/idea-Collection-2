"use client";

import React, { useState, useEffect } from "react";
import { ThumbsUp, MessageSquare, User, Calendar, ExternalLink, ChevronDown, ChevronUp, Briefcase, Globe, BarChart3, ShieldAlert, Package, DollarSign } from "lucide-react";
import { useSession } from "next-auth/react";
import clsx from "clsx";

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

  const isAdmin = (session?.user as any)?.isAdmin === true;
  const hasLiked = session?.user?.email ? likes.includes(session.user.email) : false;

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

  return (
    <div className="relative group">
      {/* Decorative Paper Layers (Stack Effect) */}
      <div className="absolute inset-0 bg-white/20 rounded-[2rem] translate-x-2 translate-y-2 -z-10 group-hover:translate-x-3 group-hover:translate-y-3 transition-transform duration-500" />
      <div className="absolute inset-0 bg-white/40 rounded-[2rem] translate-x-1 translate-y-1 -z-10 group-hover:translate-x-1.5 group-hover:translate-y-1.5 transition-transform duration-500" />

      <div
        className={clsx(
          "bg-white/90 rounded-[2rem] p-10 shadow-2xl shadow-paper-shadow border-none hover:translate-y-[-6px] transition-all duration-500 relative",
          isDone && "opacity-60 grayscale-[0.3]"
        )}
      >
        {/* Popular Idea Seal (Hanko) */}
        {likes.length >= 5 && (
          <div className="absolute -top-2 -right-4 rotate-12 scale-75 opacity-60 pointer-events-none">
            <div className="hanko-seal border-red-600 text-red-600">
              POPULAR<br />NODES
            </div>
          </div>
        )}

        <div className="flex justify-between items-start mb-8">
          <div className="flex items-center space-x-3">
            <div className={clsx(
              "w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.1)]",
              getStatusColor()
            )} />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-lab-text opacity-40">
              {stage} // {stageStatus}
            </span>
          </div>

          {/* Admin Status Controls - Appears on Hover */}
          {isAdmin && (
            <div className="absolute top-8 right-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-end gap-2">
              <div className="bg-white/95 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-lab-ui/20 flex flex-col gap-3 animate-in fade-in slide-in-from-right-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[8px] font-black uppercase tracking-widest text-lab-text/40 ml-1">Set Stage</span>
                  <div className="flex gap-1">
                    {stages.map((s) => (
                      <button
                        key={s}
                        onClick={() => updateStatus(s, stageStatus)}
                        className={clsx(
                          "px-2 py-1 rounded-md text-[9px] font-bold uppercase transition-all",
                          stage === s ? "bg-lab-text text-lab-bg" : "bg-lab-ui/20 text-lab-text hover:bg-lab-ui/40"
                        )}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[8px] font-black uppercase tracking-widest text-lab-text/40 ml-1">Set Status</span>
                  <div className="flex gap-1">
                    {statuses.map((s) => (
                      <button
                        key={s}
                        onClick={() => updateStatus(stage, s)}
                        className={clsx(
                          "px-2 py-1 rounded-md text-[9px] font-bold uppercase transition-all",
                          stageStatus === s ? "bg-lab-text text-lab-bg" : "bg-lab-ui/20 text-lab-text hover:bg-lab-ui/40"
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
              isAdmin && "group-hover:opacity-0"
            )}>
              DONE
            </span>
          )}
        </div>

        <div>
          <h3 className="text-3xl font-bold tracking-tight text-lab-text mb-6 leading-[1.1]">{idea.title}</h3>

          <div className="relative mb-4">
            <p className={clsx(
              "text-lab-text/70 text-lg whitespace-pre-wrap leading-relaxed font-light italic serif transition-all duration-300",
              !isExpanded && "line-clamp-3"
            )}>
              {idea.problem || idea.description}
            </p>
            {(idea.problem || idea.description || "").length > 150 && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-[10px] font-black uppercase tracking-[0.2em] text-lab-ui hover:text-lab-text mt-2 transition-colors flex items-center gap-1"
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
              <span className="flex items-center gap-1.5 px-3 py-1 bg-lab-ui/10 text-lab-text/60 rounded-full text-[10px] font-black uppercase tracking-widest border border-lab-ui/20">
                <Briefcase size={10} /> {idea.department}
              </span>
            )}
            {idea.country && (
              <span className="flex items-center gap-1.5 px-3 py-1 bg-lab-ui/10 text-lab-text/60 rounded-full text-[10px] font-black uppercase tracking-widest border border-lab-ui/20">
                <Globe size={10} /> {idea.country}
              </span>
            )}
            {idea.impact && (
              <span className={clsx(
                "flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                idea.impact === "Critical" ? "bg-red-500/10 text-red-600 border-red-500/20" :
                idea.impact === "High" ? "bg-orange-500/10 text-orange-600 border-orange-500/20" :
                "bg-lab-ui/10 text-lab-text/60 border-lab-ui/20"
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
            className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-lab-ui hover:text-lab-text transition-colors mb-8 group/details cursor-pointer relative z-10"
          >
            {showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {showDetails ? "HIDE_DETAILS" : "VIEW_FULL_CARD"}
          </button>

          {showDetails && (
            <div className="mb-10 space-y-8 animate-in fade-in duration-500 slide-in-from-top-4 border-t border-lab-ui/10 pt-8">
              {!idea.solution && !idea.relatedProduct && !idea.additionalBusiness && !idea.involvement && !idea.revenue && !idea.fileBase64 ? (
                <p className="text-[10px] font-black uppercase tracking-widest text-lab-text/30 italic">NO_ADDITIONAL_INTELLIGENCE_RECORDED_FOR_THIS_NODE</p>
              ) : (
                <>
                  {/* Solution Section */}
                  {idea.solution && (
                    <div className="p-6 bg-lab-ui/5 rounded-2xl border border-lab-ui/10">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-lab-text/40 mb-3 break-words whitespace-normal">Proposed Solution</h4>
                      <p className="text-base text-lab-text/80 leading-relaxed whitespace-pre-wrap">{idea.solution}</p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {idea.relatedProduct && (
                      <div className="p-6 bg-lab-ui/5 rounded-2xl border border-lab-ui/10">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-lab-text/40 mb-3 break-words whitespace-normal">Related Product</h4>
                        <p className="text-sm text-lab-text/80 leading-relaxed whitespace-pre-wrap">{idea.relatedProduct}</p>
                      </div>
                    )}
                    {idea.additionalBusiness && (
                      <div className="p-6 bg-lab-ui/5 rounded-2xl border border-lab-ui/10">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-lab-text/40 mb-3 break-words whitespace-normal">Additional Business</h4>
                        <p className="text-sm text-lab-text/80 leading-relaxed whitespace-pre-wrap">{idea.additionalBusiness}</p>
                      </div>
                    )}
                    {idea.involvement && (
                      <div className="p-6 bg-lab-ui/5 rounded-2xl border border-lab-ui/10">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-lab-text/40 mb-3 break-words whitespace-normal">Development Involvement</h4>
                        <p className="text-sm text-lab-text/80 leading-relaxed whitespace-pre-wrap">{idea.involvement}</p>
                      </div>
                    )}
                    {idea.revenue && (
                      <div className="p-6 bg-lab-ui/5 rounded-2xl border border-lab-ui/10">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-lab-text/40 mb-3 flex items-center gap-2 break-words whitespace-normal">
                          <DollarSign size={12} /> Potential Revenue
                        </h4>
                        <p className="text-sm font-bold text-lab-text">
                          {displayRevenue(idea.revenue)} {typeof idea.revenue === 'number' && <span className="text-[10px] font-normal opacity-40">USD</span>}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Uploaded Image */}
                  {idea.fileBase64 && (
                    <div className="space-y-3">
                      <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-lab-text/40 break-words whitespace-normal">Visual Asset Nodes</h4>
                      <div className="rounded-[1.5rem] overflow-hidden border border-lab-ui/20 shadow-lg group/img relative">
                        <img
                          src={idea.fileBase64}
                          alt={idea.title}
                          className="w-full h-auto object-contain transition-transform duration-700 group-hover/img:scale-105"
                        />
                        <div className="absolute inset-0 bg-lab-text/20 opacity-0 group-hover/img:opacity-100 transition-opacity pointer-events-none" />
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          <div className="flex items-start justify-between text-xs font-bold tracking-widest uppercase opacity-40 mb-10 border-t border-lab-text/5 pt-6 gap-4">
            <span className="flex-1 break-words">USR_{idea.userName.toUpperCase()}</span>
            <span className="shrink-0 whitespace-nowrap">TS_{new Date(idea.createdAt).toLocaleDateString()}</span>
          </div>

          <div className="flex items-center space-x-6">
            <button
              onClick={toggleLike}
              className={clsx(
                "flex items-center justify-center w-14 h-14 rounded-full transition-all duration-500 shadow-lg hover:shadow-xl active:scale-90",
                hasLiked ? "bg-lab-ui text-lab-bg" : "bg-lab-ui/10 text-lab-ui hover:bg-lab-ui/20"
              )}
            >
              <ThumbsUp size={24} fill={hasLiked ? "currentColor" : "none"} />
            </button>

            <button
              onClick={() => setShowComments(!showComments)}
              className={clsx(
                "flex items-center justify-center w-14 h-14 rounded-full transition-all duration-500 shadow-lg hover:shadow-xl active:scale-90",
                showComments ? "bg-lab-text text-lab-bg" : "bg-lab-text/5 text-lab-text hover:bg-lab-text/10"
              )}
            >
              <MessageSquare size={24} />
            </button>

            <div className="flex-1 flex justify-end items-center space-x-6 text-[10px] font-black tracking-[0.2em] text-lab-text opacity-30 uppercase">
              <span>{likes.length} LKS</span>
              <span>{commentCount} CMS</span>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="mt-10 pt-10 border-t border-lab-text/5 ink-reveal">
            <div className="space-y-8 mb-10 pr-4">
              {loadingComments ? (
                <p className="text-xs text-lab-text/40 font-bold uppercase tracking-widest animate-pulse">Syncing nodes...</p>
              ) : comments.length === 0 ? (
                <p className="text-xs text-lab-text/40 font-bold uppercase tracking-widest">No communications recorded.</p>
              ) : (
                comments.map((comment, index) => (
                  <div key={index} className="pb-8 border-b border-lab-text/5 last:border-none">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-black uppercase tracking-widest text-lab-text">ID_{comment.userName.toUpperCase()}</span>
                      <span className="text-[10px] font-bold text-lab-text/30 tracking-widest">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-base text-lab-text/70 leading-relaxed font-sans">{comment.content}</p>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleAddComment} className="relative mt-6 group/form">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="ENTER_REPLY_SEQUENCE..."
                className="w-full bg-lab-ui/5 rounded-[1.5rem] p-6 text-base focus:outline-none focus:bg-lab-ui/10 transition-all resize-none h-28 text-lab-text placeholder:text-lab-text/20 font-bold"
                disabled={submittingComment}
              />
              <button
                type="submit"
                disabled={!newComment.trim() || submittingComment}
                className="absolute bottom-6 right-6 bg-lab-text text-lab-bg text-[10px] font-black tracking-[0.2em] px-8 py-3 rounded-full hover:bg-lab-ui hover:text-lab-text transition-all disabled:opacity-20 uppercase shadow-xl"
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
