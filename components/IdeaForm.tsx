"use client";

import React, { useState } from "react";
import Toast, { ToastType } from "./Toast";

interface IdeaFormProps {
  subTopicId: string;
  onSuccess?: () => void;
}

export default function IdeaForm({ subTopicId, onSuccess }: IdeaFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSimilarityModal, setShowSimilarityModal] = useState(false);
  const [similarIdea, setSimilarIdea] = useState<{ title: string; description: string } | null>(null);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type });
  };

  const handleSubmit = async (force = false) => {
    setLoading(true);

    try {
      const response = await fetch("/api/ideas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          subTopicId,
          force,
        }),
      });

      if (response.status === 409) {
        const data = await response.json();
        setSimilarIdea(data.similarIdea);
        setShowSimilarityModal(true);
        setLoading(false);
        return;
      }

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to submit idea");
      }

      setTitle("");
      setDescription("");
      setShowSimilarityModal(false);
      if (onSuccess) onSuccess();
      showToast("Idea submitted successfully!", "success");
    } catch (err: any) {
      showToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-mono">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        className="space-y-6"
      >
        <div className="mb-6">
          <label className="text-[10px] uppercase tracking-[0.4em] opacity-40 mb-2 block font-bold" htmlFor="title">
            Title
          </label>
          <input
            id="title"
            type="text"
            className="w-full bg-lab-ui/10 rounded-2xl p-4 text-lab-text focus:outline-none transition-all placeholder:text-lab-text/20"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            disabled={loading}
            placeholder="ENTER_IDEA_TITLE..."
          />
        </div>
        <div className="mb-8">
          <label className="text-[10px] uppercase tracking-[0.4em] opacity-40 mb-2 block font-bold" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            className="w-full bg-lab-ui/10 rounded-2xl p-4 text-lab-text focus:outline-none transition-all h-40 resize-none placeholder:text-lab-text/20"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            disabled={loading}
            placeholder="DESCRIBE_INTELLIGENCE_OBJECT..."
          />
        </div>
        <button
          type="submit"
          className="rounded-full bg-lab-text text-lab-bg font-bold py-4 px-8 w-full disabled:opacity-30 hover:bg-lab-ui hover:text-white transition-all duration-300 shadow-lg shadow-paper-shadow"
          disabled={loading}
        >
          <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
          <span className="relative z-10">{loading ? "UPLOADING_SEQUENCE..." : "COMMIT_ENTRY"}</span>
        </button>
      </form>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Similarity Modal */}
      {showSimilarityModal && (
        <div className="fixed inset-0 bg-lab-text/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[2rem] p-10 max-w-xl w-full shadow-2xl shadow-paper-shadow border-none animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-bold text-lab-text mb-4">Similar Idea Found</h3>
            <p className="text-lab-text/60 mb-6 leading-relaxed">
              We found an existing idea that seems very similar to yours. Would you like to proceed or refine your idea?
            </p>
            <div className="bg-lab-ui/5 rounded-2xl p-6 mb-8 border border-lab-ui/10">
              <h4 className="font-bold text-lab-text mb-2 text-lg">{similarIdea?.title}</h4>
              <p className="text-sm text-lab-text/50 line-clamp-4 leading-relaxed">{similarIdea?.description}</p>
            </div>
            <p className="text-lab-text mb-8 font-medium">
              Are you sure you still want to proceed?
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => handleSubmit(true)}
                className="flex-1 bg-lab-text text-lab-bg font-bold py-4 px-6 rounded-full hover:bg-lab-ui transition-all duration-300"
                disabled={loading}
              >
                PROCEED_BYPASS
              </button>
              <button
                onClick={() => setShowSimilarityModal(false)}
                className="flex-1 bg-lab-ui/10 text-lab-text font-bold py-4 px-6 rounded-full hover:bg-lab-ui/20 transition-all duration-300"
                disabled={loading}
              >
                ABORT_SEQUENCE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
