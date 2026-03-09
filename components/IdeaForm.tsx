"use client";

import React, { useState, useEffect, useRef } from "react";
import Toast, { ToastType } from "./Toast";
import { Upload, X, Loader2 } from "lucide-react";

interface Department {
  id: string;
  name: string;
}

interface Country {
  id: string;
  name: string;
}

interface IdeaFormProps {
  subTopicId: string;
  onSuccess?: () => void;
}

export default function IdeaForm({ subTopicId, onSuccess }: IdeaFormProps) {
  const [title, setTitle] = useState("");
  const [problem, setProblem] = useState("");
  const [solution, setSolution] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [impact, setImpact] = useState("Low");
  const [risks, setRisks] = useState("");
  const [resources, setResources] = useState("");
  const [revenue, setRevenue] = useState("");
  const [department, setDepartment] = useState("");
  const [country, setCountry] = useState("");
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const [departments, setDepartments] = useState<Department[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showSimilarityModal, setShowSimilarityModal] = useState(false);
  const [similarIdea, setSimilarIdea] = useState<{ title: string; description: string } | null>(null);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [depsRes, countriesRes] = await Promise.all([
          fetch("/api/admin/departments"),
          fetch("/api/admin/countries")
        ]);
        if (depsRes.ok) setDepartments(await depsRes.json());
        if (countriesRes.ok) setCountries(await countriesRes.json());
      } catch (error) {
        console.error("Error fetching form data:", error);
      } finally {
        setFetchingData(false);
      }
    };
    fetchData();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast("File size must be less than 2MB", "error");
        return;
      }

      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFileBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeFile = () => {
    setFileBase64(null);
    setFileName(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

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
          problem,
          solution,
          targetAudience,
          impact,
          risks,
          resources,
          revenue: parseFloat(revenue) || 0,
          department,
          country,
          fileBase64,
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

      // Reset all fields
      setTitle("");
      setProblem("");
      setSolution("");
      setTargetAudience("");
      setImpact("Low");
      setRisks("");
      setResources("");
      setRevenue("");
      setDepartment("");
      setCountry("");
      setFileBase64(null);
      setFileName(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

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
        className="space-y-8 ink-reveal"
      >
        {/* Row 1: Title */}
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-[0.4em] opacity-40 block font-bold" htmlFor="title">
            Title
          </label>
          <input
            id="title"
            type="text"
            className="w-full bg-lab-ui/10 rounded-2xl p-4 text-lab-text focus:outline-none focus:ring-2 focus:ring-lab-ui/40 transition-all placeholder:text-lab-text/20 font-bold"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            disabled={loading}
            placeholder="ENTER_IDEA_TITLE..."
          />
        </div>

        {/* Row 2: Problem & Solution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.4em] opacity-40 block font-bold" htmlFor="problem">
              Problem
            </label>
            <textarea
              id="problem"
              className="w-full bg-lab-ui/10 rounded-2xl p-4 text-lab-text focus:outline-none focus:ring-2 focus:ring-lab-ui/40 transition-all h-32 resize-none placeholder:text-lab-text/20"
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              required
              disabled={loading}
              placeholder="DESCRIBE_THE_ISSUE..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.4em] opacity-40 block font-bold" htmlFor="solution">
              Solution
            </label>
            <textarea
              id="solution"
              className="w-full bg-lab-ui/10 rounded-2xl p-4 text-lab-text focus:outline-none focus:ring-2 focus:ring-lab-ui/40 transition-all h-32 resize-none placeholder:text-lab-text/20"
              value={solution}
              onChange={(e) => setSolution(e.target.value)}
              required
              disabled={loading}
              placeholder="PROPOSE_THE_RESOLUTION..."
            />
          </div>
        </div>

        {/* Row 3: Target Audience & Risks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.4em] opacity-40 block font-bold" htmlFor="targetAudience">
              Target Audience
            </label>
            <textarea
              id="targetAudience"
              className="w-full bg-lab-ui/10 rounded-2xl p-4 text-lab-text focus:outline-none focus:ring-2 focus:ring-lab-ui/40 transition-all h-32 resize-none placeholder:text-lab-text/20"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              required
              disabled={loading}
              placeholder="WHO_BENEFITS..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.4em] opacity-40 block font-bold" htmlFor="risks">
              Risks
            </label>
            <textarea
              id="risks"
              className="w-full bg-lab-ui/10 rounded-2xl p-4 text-lab-text focus:outline-none focus:ring-2 focus:ring-lab-ui/40 transition-all h-32 resize-none placeholder:text-lab-text/20"
              value={risks}
              onChange={(e) => setRisks(e.target.value)}
              required
              disabled={loading}
              placeholder="POTENTIAL_FAILURES..."
            />
          </div>
        </div>

        {/* Row 4: Resources & Revenue */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.4em] opacity-40 block font-bold" htmlFor="resources">
              Resources
            </label>
            <textarea
              id="resources"
              className="w-full bg-lab-ui/10 rounded-2xl p-4 text-lab-text focus:outline-none focus:ring-2 focus:ring-lab-ui/40 transition-all h-32 resize-none placeholder:text-lab-text/20"
              value={resources}
              onChange={(e) => setResources(e.target.value)}
              required
              disabled={loading}
              placeholder="REQUIRED_ASSETS..."
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.4em] opacity-40 block font-bold" htmlFor="revenue">
              Potential Revenue (USD)
            </label>
            <input
              id="revenue"
              type="number"
              className="w-full bg-lab-ui/10 rounded-2xl p-4 text-lab-text focus:outline-none focus:ring-2 focus:ring-lab-ui/40 transition-all placeholder:text-lab-text/20 font-bold"
              value={revenue}
              onChange={(e) => setRevenue(e.target.value)}
              required
              disabled={loading}
              placeholder="ESTIMATED_VALUE..."
            />
          </div>
        </div>

        {/* Row 5: Department, Country & Impact */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.4em] opacity-40 block font-bold" htmlFor="department">
              Department
            </label>
            <select
              id="department"
              className="w-full bg-lab-ui/10 rounded-2xl p-4 text-lab-text focus:outline-none focus:ring-2 focus:ring-lab-ui/40 transition-all font-bold appearance-none cursor-pointer"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              required
              disabled={loading || fetchingData}
            >
              <option value="" disabled>SELECT_DEPT...</option>
              {departments.map((d) => (
                <option key={d.id} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.4em] opacity-40 block font-bold" htmlFor="country">
              Country
            </label>
            <select
              id="country"
              className="w-full bg-lab-ui/10 rounded-2xl p-4 text-lab-text focus:outline-none focus:ring-2 focus:ring-lab-ui/40 transition-all font-bold appearance-none cursor-pointer"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              required
              disabled={loading || fetchingData}
            >
              <option value="" disabled>SELECT_COUNTRY...</option>
              {countries.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-[0.4em] opacity-40 block font-bold" htmlFor="impact">
              Impact
            </label>
            <select
              id="impact"
              className="w-full bg-lab-ui/10 rounded-2xl p-4 text-lab-text focus:outline-none focus:ring-2 focus:ring-lab-ui/40 transition-all font-bold appearance-none cursor-pointer"
              value={impact}
              onChange={(e) => setImpact(e.target.value)}
              required
              disabled={loading}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>
        </div>

        {/* Row 6: File Upload */}
        <div className="space-y-2">
          <label className="text-[10px] uppercase tracking-[0.4em] opacity-40 block font-bold">
            Supporting Image (Max 2MB)
          </label>
          <div className="relative group/upload">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
              disabled={loading}
            />
            {!fileBase64 ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                className="w-full border-2 border-dashed border-lab-ui/30 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 hover:bg-lab-ui/5 hover:border-lab-ui/50 transition-all group"
              >
                <Upload size={32} className="text-lab-ui/40 group-hover:text-lab-ui transition-colors" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-lab-text/40">ATTACH_VISUAL_ASSET</span>
              </button>
            ) : (
              <div className="relative rounded-2xl overflow-hidden border border-lab-ui/20 bg-lab-ui/5 p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg overflow-hidden border border-lab-ui/20">
                    <img src={fileBase64} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                  <span className="text-sm font-bold text-lab-text truncate max-w-[200px]">{fileName}</span>
                </div>
                <button
                  type="button"
                  onClick={removeFile}
                  className="p-2 hover:bg-red-500/10 text-red-500 rounded-full transition-all"
                >
                  <X size={20} />
                </button>
              </div>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="rounded-full bg-lab-text text-lab-bg font-bold py-5 px-8 w-full disabled:opacity-30 hover:bg-lab-ui hover:text-lab-text transition-all duration-300 shadow-xl shadow-paper-shadow relative overflow-hidden group/btn"
          disabled={loading}
        >
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-500" />
          <span className="relative z-10 flex items-center justify-center gap-2">
            {loading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                <span>UPLOADING_SEQUENCE...</span>
              </>
            ) : (
              "COMMIT_INTELLIGENCE_ENTRY"
            )}
          </span>
        </button>
      </form>

      {toast && (
        <Toast
          key={toast.message + Date.now()}
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
