"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { UserPlus, Mail, Lock, User, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { FEATURE_FLAGS } from "@/lib/feature-flags";
import { clsx } from "clsx";

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        // Automatically sign in after successful registration
        const signInRes = await signIn("credentials", {
          redirect: false,
          email: formData.email,
          password: formData.password,
        });

        if (signInRes?.ok) {
          router.push("/"); // Landing page will handle redirect to dashboard
        } else {
          router.push("/login");
        }
      } else {
        const data = await res.json();
        setError(data.error || "Registration failed");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const isGlass = FEATURE_FLAGS.ENABLE_LIQUID_GLASS;
  const isLG2 = FEATURE_FLAGS.ENABLE_LIQUID_GLASS_V2;

  return (
    <div className={clsx(
      "min-h-screen font-sans relative overflow-hidden flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-500",
      isLG2
        ? "bg-lg2-bg text-slate-800"
        : (isGlass ? "bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f0f23] text-white" : "bg-lab-bg text-lab-text")
    )}>
      {/* Background Layer */}
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

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
        <button
          onClick={() => router.push("/")}
          className={clsx(
            "flex items-center text-[10px] uppercase font-bold tracking-widest mb-8 transition-colors",
            isLG2 ? "text-slate-400 hover:text-slate-800" : (isGlass ? "text-white/40 hover:text-white" : "text-lab-text/40 hover:text-lab-ui")
          )}
        >
          <ArrowLeft size={14} className="mr-2" />
          Back_to_Home
        </button>

        <div className={clsx(
          "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 border-2",
          isLG2
            ? "lg2-glass-bubble text-slate-800 border-white/40 shadow-xl"
            : (isGlass ? "bg-white/20 text-white border-white/30" : "bg-lab-ui/40 text-lab-text shadow-lg shadow-paper-shadow border-lab-ui/20")
        )}>
          <UserPlus size={28} />
        </div>
        <h2 className={clsx(
          "text-center text-4xl font-bold tracking-tight",
          isLG2 ? "text-slate-800" : (isGlass ? "text-white" : "text-lab-text")
        )}>
          Register your account
        </h2>
      </div>

      <div className="mt-8 relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
        <div className={clsx(
          "py-10 px-4 shadow-2xl sm:rounded-[2.5rem] sm:px-10 border-none",
          isLG2 ? "lg2-glass-board" : (isGlass ? "glass-card" : "bg-white shadow-paper-shadow")
        )}>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-500/10 border-l-4 border-red-500 p-4 text-xs font-bold text-red-700 rounded-r-xl">
                ERROR : {error}
              </div>
            )}

            <div>
              <label htmlFor="name" className={clsx(
                "block text-[10px] uppercase font-bold tracking-widest mb-2 ml-1",
                isLG2 ? "text-slate-400" : (isGlass ? "text-white/40" : "text-lab-text/40")
              )}>
                Your name
              </label>
              <div className="relative group">
                <div className={clsx(
                  "absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors",
                  isLG2 ? "text-slate-300 group-focus-within:text-teal-500" : (isGlass ? "text-white/20 group-focus-within:text-glass-secondary" : "text-lab-text/20 group-focus-within:text-lab-ui")
                )}>
                  <User size={18} />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={clsx(
                    "block w-full pl-12 pr-4 py-4 border-none rounded-2xl leading-5 focus:outline-none transition-all text-sm font-bold",
                    isLG2
                      ? "lg2-glass-bubble text-slate-800 placeholder-slate-300 focus:ring-2 focus:ring-teal-500/20"
                      : (isGlass
                        ? "glass-input text-white placeholder-white/20"
                        : "bg-lab-ui/10 text-lab-text placeholder-lab-text/20 focus:ring-2 focus:ring-lab-ui/40")
                  )}
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className={clsx(
                "block text-[10px] uppercase font-bold tracking-widest mb-2 ml-1",
                isLG2 ? "text-slate-400" : (isGlass ? "text-white/40" : "text-lab-text/40")
              )}>
                Your email
              </label>
              <div className="relative group">
                <div className={clsx(
                  "absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors",
                  isLG2 ? "text-slate-300 group-focus-within:text-teal-500" : (isGlass ? "text-white/20 group-focus-within:text-glass-secondary" : "text-lab-text/20 group-focus-within:text-lab-ui")
                )}>
                  <Mail size={18} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={clsx(
                    "block w-full pl-12 pr-4 py-4 border-none rounded-2xl leading-5 focus:outline-none transition-all text-sm font-bold",
                    isLG2
                      ? "lg2-glass-bubble text-slate-800 placeholder-slate-300 focus:ring-2 focus:ring-teal-500/20"
                      : (isGlass
                        ? "glass-input text-white placeholder-white/20"
                        : "bg-lab-ui/10 text-lab-text placeholder-lab-text/20 focus:ring-2 focus:ring-lab-ui/40")
                  )}
                  placeholder="you@innovation.org"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className={clsx(
                "block text-[10px] uppercase font-bold tracking-widest mb-2 ml-1",
                isLG2 ? "text-slate-400" : (isGlass ? "text-white/40" : "text-lab-text/40")
              )}>
                Your password
              </label>
              <div className="relative group">
                <div className={clsx(
                  "absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors",
                  isLG2 ? "text-slate-300 group-focus-within:text-teal-500" : (isGlass ? "text-white/20 group-focus-within:text-glass-secondary" : "text-lab-text/20 group-focus-within:text-lab-ui")
                )}>
                  <Lock size={18} />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className={clsx(
                    "block w-full pl-12 pr-4 py-4 border-none rounded-2xl leading-5 focus:outline-none transition-all text-sm font-bold",
                    isLG2
                      ? "lg2-glass-bubble text-slate-800 placeholder-slate-300 focus:ring-2 focus:ring-teal-500/20"
                      : (isGlass
                        ? "glass-input text-white placeholder-white/20"
                        : "bg-lab-ui/10 text-lab-text placeholder-lab-text/20 focus:ring-2 focus:ring-lab-ui/40")
                  )}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={clsx(
                  "w-full flex justify-center py-4 px-4 border border-transparent rounded-full text-sm font-bold uppercase tracking-widest focus:outline-none transition-all active:scale-[0.98] disabled:opacity-50",
                  isLG2
                    ? "lg2-liquid-teal text-white shadow-xl"
                    : (isGlass ? "glass-button text-white" : "shadow-xl shadow-paper-shadow text-lab-bg bg-lab-text hover:bg-lab-ui hover:text-lab-text")
                )}
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  "Create_Account"
                )}
              </button>
            </div>
          </form>

          <div className="mt-10">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className={clsx("w-full border-t", isLG2 ? "border-slate-100" : (isGlass ? "border-white/20" : "border-lab-ui/20"))}></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className={clsx(
                  "px-4 font-bold uppercase tracking-widest",
                  isLG2 ? "bg-white/0 text-slate-400" : (isGlass ? "bg-transparent text-white/40" : "bg-white text-lab-text/40")
                )}>Already have an account?</span>
              </div>
            </div>

            <div className="mt-8">
              <Link
                href="/login"
                className={clsx(
                  "w-full flex justify-center py-4 px-4 rounded-full text-xs font-bold uppercase tracking-widest transition-all active:scale-[0.98]",
                  isLG2
                    ? "lg2-glass-bubble text-slate-600 hover:text-slate-800"
                    : (isGlass ? "border-2 border-white/20 text-white hover:bg-white/10" : "border-2 border-lab-ui/20 text-lab-text hover:bg-lab-ui/10")
                )}
              >
                Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
