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
        "bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all",
        isDone && "opacity-60 grayscale-[0.5]"
      )}
    >
      {/* Status Bar */}
      <div className="bg-gray-50 px-4 py-2 border-b border-gray-100 flex justify-between items-center">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {idea.stage} : {idea.stage_status}
        </span>
        {isDone && (
          <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
            COMPLETED
          </span>
        )}
      </div>

      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-900 mb-2">{idea.title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-3 whitespace-pre-wrap">
          {idea.description}
        </p>

        <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
          <div className="flex items-center">
            <User size={14} className="mr-1" />
            <span>{idea.userName}</span>
          </div>
          <div className="flex items-center">
            <Calendar size={14} className="mr-1" />
            <span>{new Date(idea.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="flex items-center space-x-6 border-t border-gray-50 pt-4">
          <button
            onClick={toggleLike}
            className={clsx(
              "flex items-center space-x-2 transition-colors",
              hasLiked ? "text-blue-600" : "text-gray-500 hover:text-blue-600"
            )}
          >
            <ThumbsUp size={18} fill={hasLiked ? "currentColor" : "none"} />
            <span className="font-medium">{likes.length}</span>
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className={clsx(
              "flex items-center space-x-2 transition-colors",
              showComments ? "text-blue-600" : "text-gray-500 hover:text-blue-600"
            )}
          >
            <MessageSquare size={18} />
            <span className="font-medium">{commentCount}</span>
          </button>
        </div>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="bg-gray-50 border-t border-gray-100 p-5 animate-in slide-in-from-top duration-200">
          <h4 className="text-sm font-bold text-gray-700 mb-4">Comments</h4>

          <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2">
            {loadingComments ? (
              <p className="text-xs text-gray-500 italic">Loading comments...</p>
            ) : comments.length === 0 ? (
              <p className="text-xs text-gray-500 italic">No comments yet. Be the first to reply!</p>
            ) : (
              comments.map((comment, index) => (
                <div key={index} className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-gray-800">{comment.userName}</span>
                    <span className="text-[10px] text-gray-400">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{comment.content}</p>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleAddComment} className="relative">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a reply..."
              className="w-full bg-white border border-gray-200 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none h-20"
              disabled={submittingComment}
            />
            <button
              type="submit"
              disabled={!newComment.trim() || submittingComment}
              className="absolute bottom-3 right-3 bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {submittingComment ? "Posting..." : "Reply"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
