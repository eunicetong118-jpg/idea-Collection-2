"use client";

import React, { useState } from "react";

interface IdeaFormProps {
  subTopicId: string;
  onSuccess?: () => void;
}

export default function IdeaForm({ subTopicId, onSuccess }: IdeaFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSimilarityModal, setShowSimilarityModal] = useState(false);
  const [similarIdea, setSimilarIdea] = useState<{ title: string; description: string } | null>(null);

  const handleSubmit = async (force = false) => {
    setLoading(true);
    setError(null);

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
      alert("Idea submitted successfully!");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
            Title
          </label>
          <input
            id="title"
            type="text"
            className="shadow-sm appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            disabled={loading}
            placeholder="What's your idea?"
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
            Description
          </label>
          <textarea
            id="description"
            className="shadow-sm appearance-none border rounded-lg w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 h-40 resize-none"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            disabled={loading}
            placeholder="Describe your idea in detail..."
          />
        </div>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg focus:outline-none focus:shadow-outline w-full disabled:bg-blue-300 transition-colors shadow-lg shadow-blue-100"
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit Idea"}
        </button>
      </form>

      {/* Similarity Modal */}
      {showSimilarityModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-red-600 mb-2">Similar Idea Found!</h3>
            <p className="text-gray-700 mb-4">
              Your idea seems very similar to an existing one:
            </p>
            <div className="bg-gray-100 p-3 rounded mb-4 border-l-4 border-yellow-500">
              <h4 className="font-bold">{similarIdea?.title}</h4>
              <p className="text-sm text-gray-600 line-clamp-3">{similarIdea?.description}</p>
            </div>
            <p className="text-gray-700 mb-6 font-medium">
              Are you sure you still want to proceed?
            </p>
            <div className="flex space-x-4">
              <button
                onClick={() => handleSubmit(true)}
                className="flex-1 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                disabled={loading}
              >
                Yes, Proceed
              </button>
              <button
                onClick={() => setShowSimilarityModal(false)}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                disabled={loading}
              >
                No, Go Back
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
