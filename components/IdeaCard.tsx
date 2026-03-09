"use client";

import React, { useState, useEffect } from "react";
import { ThumbsUp, MessageSquare, User, Calendar } from "lucide-react";
import { useSession } from "next-auth/react";
import clsx from "clsx";

interface Idea {
  _id: string;
  title: string;
  description: string;
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
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);

  const hasLiked = session?.user?.email ? likes.includes(session.user.email) : false;

  const isDone = idea.stage === "Implement" && idea.stage_status === "Done";

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
    <div
      className={clsx(
        "bg-white/80 rounded-[2rem] p-8 shadow-xl shadow-paper-shadow border-none hover:translate-y-[-4px] transition-all duration-300 relative overflow-hidden",
        isDone && "opacity-60 grayscale-[0.5]"
      )}
    >
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center space-x-2">
          <div className={clsx(
            "w-2 h-2 rounded-full",
            isDone ? "bg-green-500" : "bg-lab-ui"
          )} />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-lab-text opacity-40">
            {idea.stage} : {idea.stage_status}
          </span>
        </div>
        {isDone && (
          <span className="bg-green-500/10 text-green-700 text-[10px] px-3 py-1 rounded-full font-bold">
            COMPLETED
          </span>
        )}
      </div>

      <div>
        <h3 className="text-2xl font-bold tracking-tight text-lab-text mb-4 font-sans">{idea.title}</h3>
        <p className="text-lab-text/70 text-base mb-8 line-clamp-3 whitespace-pre-wrap leading-relaxed">
          {idea.description}
        </p>

        <div className="flex items-center justify-between text-sm font-sans opacity-40 mb-8">
          <span>{idea.userName}</span>
          <span>{new Date(idea.createdAt).toLocaleDateString()}</span>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={toggleLike}
            className={clsx(
              "flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 shadow-sm hover:shadow-md",
              hasLiked ? "bg-lab-ui/20 text-lab-text" : "bg-gray-100/50 text-gray-400 hover:bg-lab-ui/20 hover:text-lab-text"
            )}
          >
            <ThumbsUp size={20} fill={hasLiked ? "currentColor" : "none"} />
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className={clsx(
              "flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 shadow-sm hover:shadow-md",
              showComments ? "bg-lab-ui/20 text-lab-text" : "bg-gray-100/50 text-gray-400 hover:bg-lab-ui/20 hover:text-lab-text"
            )}
          >
            <MessageSquare size={20} />
          </button>

          <div className="flex-1 flex justify-end items-center space-x-4 text-sm font-medium text-lab-text opacity-40">
            <span>{likes.length} Likes</span>
            <span>{commentCount} Comments</span>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-8 pt-8 border-t border-lab-text/5 animate-in slide-in-from-top duration-200">
          <div className="space-y-6 mb-8 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
            {loadingComments ? (
              <p className="text-sm text-lab-text/40 italic">Loading comments...</p>
            ) : comments.length === 0 ? (
              <p className="text-sm text-lab-text/40 italic">No comments yet. Be the first to reply!</p>
            ) : (
              comments.map((comment, index) => (
                <div key={index} className="pb-6 border-b border-lab-text/5 last:border-none">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-lab-text">{comment.userName}</span>
                    <span className="text-xs text-lab-text/40 font-sans">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-lab-text/70 leading-relaxed font-sans">{comment.content}</p>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleAddComment} className="relative">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a reply..."
              className="w-full bg-lab-ui/10 rounded-2xl p-4 text-sm focus:outline-none transition-all resize-none h-24 text-lab-text placeholder:text-lab-text/30 font-sans"
              disabled={submittingComment}
            />
            <button
              type="submit"
              disabled={!newComment.trim() || submittingComment}
              className="absolute bottom-4 right-4 bg-lab-text text-lab-bg text-xs font-bold px-6 py-2 rounded-full hover:bg-lab-ui transition-colors disabled:opacity-30"
            >
              {submittingComment ? "Posting..." : "Reply"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
