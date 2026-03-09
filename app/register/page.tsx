"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { UserPlus, Mail, Lock, User, ArrowLeft, Loader2 } from "lucide-react";

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
          router.push("/api/auth/signin");
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

  return (
    <div className="min-h-screen bg-lab-bg text-lab-text font-sans relative overflow-hidden flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Paper Texture Layer */}
      <div className="fixed inset-0 paper-texture z-0" />

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
        <button
          onClick={() => router.push("/")}
          className="flex items-center text-[10px] uppercase font-bold tracking-widest text-lab-text/40 hover:text-lab-ui mb-8 transition-colors"
        >
          <ArrowLeft size={14} className="mr-2" />
          Back_to_Home
        </button>

        <div className="bg-lab-ui/40 w-16 h-16 rounded-full flex items-center justify-center text-lab-text shadow-lg shadow-paper-shadow mx-auto mb-6">
          <UserPlus size={28} />
        </div>
        <h2 className="text-center text-4xl font-bold tracking-tight text-lab-text">
          Initialize Account
        </h2>
        <p className="mt-4 text-center text-sm text-lab-text/60 leading-relaxed max-w-xs mx-auto">
          Synchronize your credentials to join the innovation subsystem.
        </p>
      </div>

      <div className="mt-8 relative z-10 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="glass-panel py-10 px-4 shadow-2xl shadow-paper-shadow sm:rounded-[2.5rem] sm:px-10 border-none">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-500/10 border-l-4 border-red-500 p-4 text-xs font-bold text-red-700 rounded-r-xl">
                ERROR : {error}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-[10px] uppercase font-bold tracking-widest text-lab-text/40 mb-2 ml-1">
                Full_Name
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-lab-text/20 group-focus-within:text-lab-ui transition-colors">
                  <User size={18} />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="block w-full pl-12 pr-4 py-4 bg-lab-ui/10 border-none rounded-2xl leading-5 text-lab-text placeholder-lab-text/20 focus:outline-none focus:ring-2 focus:ring-lab-ui/40 transition-all text-sm"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-[10px] uppercase font-bold tracking-widest text-lab-text/40 mb-2 ml-1">
                Email_Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-lab-text/20 group-focus-within:text-lab-ui transition-colors">
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
                  className="block w-full pl-12 pr-4 py-4 bg-lab-ui/10 border-none rounded-2xl leading-5 text-lab-text placeholder-lab-text/20 focus:outline-none focus:ring-2 focus:ring-lab-ui/40 transition-all text-sm"
                  placeholder="you@innovation.org"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-[10px] uppercase font-bold tracking-widest text-lab-text/40 mb-2 ml-1">
                Security_Cipher
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-lab-text/20 group-focus-within:text-lab-ui transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="block w-full pl-12 pr-4 py-4 bg-lab-ui/10 border-none rounded-2xl leading-5 text-lab-text placeholder-lab-text/20 focus:outline-none focus:ring-2 focus:ring-lab-ui/40 transition-all text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-4 px-4 border border-transparent rounded-full shadow-xl shadow-paper-shadow text-sm font-bold uppercase tracking-widest text-lab-bg bg-lab-text hover:bg-lab-ui hover:text-lab-text focus:outline-none transition-all active:scale-[0.98] disabled:opacity-50"
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
                <div className="w-full border-t border-lab-ui/20"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-4 bg-transparent text-lab-text/40 font-bold uppercase tracking-widest">Existing Subsystem?</span>
              </div>
            </div>

            <div className="mt-8">
              <button
                onClick={() => signIn()}
                className="w-full flex justify-center py-4 px-4 border-2 border-lab-ui/20 rounded-full text-xs font-bold uppercase tracking-widest text-lab-text hover:bg-lab-ui/10 transition-all active:scale-[0.98]"
              >
                Access_Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
