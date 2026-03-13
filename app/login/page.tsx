"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { LogIn, Mail, Lock, ArrowLeft, Loader2, UserPlus } from "lucide-react";
import Link from "next/link";
import { FEATURE_FLAGS } from "@/lib/feature-flags";
import { clsx } from "clsx";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      if (errorParam === "CredentialsSignin") {
        setError("Login credentials don't match our records.");
      } else if (errorParam.includes("No user found")) {
        setError("This email is not registered in our subsystem.");
      } else {
        setError(errorParam);
      }
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (res?.error) {
        if (res.error.includes("No user found")) {
          setError("User not registered. Please create an account.");
        } else if (res.error.includes("Invalid password") || res.error === "CredentialsSignin") {
          setError("Login credentials don't match. Please check your password.");
        } else {
          setError(res.error);
        }
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected authentication error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const isGlass = FEATURE_FLAGS.ENABLE_LIQUID_GLASS;

  return (
    <div className={clsx(
      "py-10 px-4 shadow-2xl sm:rounded-[2.5rem] sm:px-10 border-none",
      isGlass ? "glass-card" : "bg-white shadow-paper-shadow"
    )}>
      <form className="space-y-6" onSubmit={handleSubmit}>
        {error && (
          <div className="bg-red-500/10 border-l-4 border-red-500 p-4 rounded-r-xl animate-in slide-in-from-top-2 duration-300">
            <p className="text-[10px] font-black uppercase tracking-widest text-red-700 mb-1">Authorization_Failure</p>
            <p className="text-xs font-bold text-red-600/80 leading-relaxed">{error}</p>
            <div className="mt-3 flex gap-4">
               <Link href="/register" className="text-[9px] font-black uppercase tracking-widest text-red-700 hover:underline">Register_Now</Link>
               <button type="button" onClick={() => setError("")} className="text-[9px] font-black uppercase tracking-widest text-red-700/40 hover:text-red-700 transition-colors">Clear_Notice</button>
            </div>
          </div>
        )}

        <div>
          <label htmlFor="email" className={clsx(
            "block text-[10px] uppercase font-bold tracking-widest mb-2 ml-1",
            isGlass ? "text-white/40" : "text-lab-text/40"
          )}>
            Your email
          </label>
          <div className="relative group">
            <div className={clsx(
              "absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors",
              isGlass ? "text-white/20 group-focus-within:text-glass-secondary" : "text-lab-text/20 group-focus-within:text-lab-ui"
            )}>
              <Mail size={18} />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={clsx(
                "block w-full pl-12 pr-4 py-4 border-none rounded-2xl leading-5 focus:outline-none transition-all text-sm font-bold",
                isGlass
                  ? "glass-input text-white placeholder-white/20"
                  : "bg-lab-ui/10 text-lab-text placeholder-lab-text/20 focus:ring-2 focus:ring-lab-ui/40"
              )}
              placeholder="name@subsystem.com"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className={clsx(
            "block text-[10px] uppercase font-bold tracking-widest mb-2 ml-1",
            isGlass ? "text-white/40" : "text-lab-text/40"
          )}>
            Your password
          </label>
          <div className="relative group">
            <div className={clsx(
              "absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors",
              isGlass ? "text-white/20 group-focus-within:text-glass-secondary" : "text-lab-text/20 group-focus-within:text-lab-ui"
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
                isGlass
                  ? "glass-input text-white placeholder-white/20"
                  : "bg-lab-ui/10 text-lab-text placeholder-lab-text/20 focus:ring-2 focus:ring-lab-ui/40"
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
              isGlass
                ? "glass-button text-white"
                : "shadow-xl shadow-paper-shadow text-lab-bg bg-lab-text hover:bg-lab-ui hover:text-lab-text"
            )}
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              "Login"
            )}
          </button>
        </div>
      </form>

      <div className="mt-10">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className={clsx("w-full border-t", isGlass ? "border-white/20" : "border-lab-ui/20")}></div>
          </div>
        </div>

        <div className="mt-8">
          <Link
            href="/register"
            className={clsx(
              "w-full flex justify-center items-center gap-2 py-4 px-4 rounded-full text-xs font-bold uppercase tracking-widest transition-all active:scale-[0.98]",
              isGlass
                ? "border-2 border-white/20 text-white hover:bg-white/10"
                : "border-2 border-lab-ui/20 text-lab-text hover:bg-lab-ui/10"
            )}
          >
            <UserPlus size={16} />
            Register_Account
          </Link>
        </div>
      </div>
    </div>
  );
}

function LoginLoading() {
  const isGlass = FEATURE_FLAGS.ENABLE_LIQUID_GLASS;

  return (
    <div className={clsx(
      "py-10 px-4 shadow-2xl sm:rounded-[2.5rem] sm:px-10 border-none animate-pulse",
      isGlass ? "glass-card" : "bg-white shadow-paper-shadow"
    )}>
      <div className={clsx("h-10 rounded-2xl mb-6", isGlass ? "bg-white/10" : "bg-lab-ui/20")} />
      <div className="space-y-6">
        <div className={clsx("h-12 rounded-2xl", isGlass ? "bg-white/10" : "bg-lab-ui/10")} />
        <div className={clsx("h-12 rounded-2xl", isGlass ? "bg-white/10" : "bg-lab-ui/10")} />
        <div className={clsx("h-14 rounded-full", isGlass ? "bg-white/20" : "bg-lab-text/20")} />
      </div>
    </div>
  );
}

export default function LoginPage() {
  const isGlass = FEATURE_FLAGS.ENABLE_LIQUID_GLASS;

  return (
    <div className={clsx(
      "min-h-screen font-sans relative overflow-hidden flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8",
      isGlass
        ? "bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f0f23] text-white"
        : "bg-lab-bg text-lab-text"
    )}>
      {/* Background Layer */}
      {isGlass ? (
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
      )}

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
        <Link
          href="/"
          className={clsx(
            "flex items-center text-[10px] uppercase font-bold tracking-widest mb-8 transition-colors w-fit",
            isGlass ? "text-white/40 hover:text-white" : "text-lab-text/40 hover:text-lab-ui"
          )}
        >
          <ArrowLeft size={14} className="mr-2" />
          Back_to_Home
        </Link>

        <div className={clsx(
          "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 border-2",
          isGlass
            ? "bg-white/20 text-white border-white/30"
            : "bg-lab-ui/40 text-lab-text shadow-lg shadow-paper-shadow border-lab-ui/20"
        )}>
          <LogIn size={28} />
        </div>
        <h2 className={clsx(
          "text-center text-4xl font-bold tracking-tight",
          isGlass ? "text-white" : "text-lab-text"
        )}>
          Login
        </h2>
      </div>

      <div className="mt-8 relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
        <Suspense fallback={<LoginLoading />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
