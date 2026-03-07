"use client";

import React, { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LayoutDashboard, ShieldCheck, UserPlus, LogIn, ArrowRight } from "lucide-react";
import clsx from "clsx";

export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [theme, setTheme] = useState<{ title: string }>({ title: "Idea Collection" });
  const [subTopics, setSubTopics] = useState<{ id: string }[]>([]);

  useEffect(() => {
    // If authenticated, automatically redirect to first dashboard or admin
    if (status === "authenticated") {
      if (subTopics.length > 0) {
        router.push(`/dashboard/${subTopics[0].id}`);
      } else if ((session?.user as any)?.isAdmin) {
        router.push("/admin");
      }
    }
  }, [status, subTopics, router, session]);

  useEffect(() => {
    // Fetch theme and subtopics
    const fetchData = async () => {
      try {
        const [themeRes, subTopicsRes] = await Promise.all([
          fetch("/api/admin/theme"),
          fetch("/api/admin/subtopics"),
        ]);
        if (themeRes.ok) setTheme(await themeRes.json());
        if (subTopicsRes.ok) setSubTopics(await subTopicsRes.json());
      } catch (error) {
        console.error("Error fetching landing data:", error);
      }
    };
    fetchData();
  }, []);

  const handleStart = () => {
    if (status === "authenticated") {
      if (subTopics.length > 0) {
        router.push(`/dashboard/${subTopics[0].id}`);
      } else if ((session?.user as any)?.isAdmin) {
        router.push("/admin");
      }
    } else {
      router.push("/register");
    }
  };

  const handleJoin = () => {
    if (status === "authenticated") {
      if (subTopics.length > 0) {
        router.push(`/dashboard/${subTopics[0].id}`);
      } else if ((session?.user as any)?.isAdmin) {
        router.push("/admin");
      }
    } else {
      signIn();
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 selection:bg-blue-100 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-3xl opacity-50 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-3xl opacity-50 pointer-events-none" />

      {/* Navigation */}
      <nav className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-200">
              <LayoutDashboard size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">
              {theme.title}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {status === "authenticated" && (session?.user as any)?.isAdmin && (
              <button
                onClick={() => router.push("/admin")}
                className="flex items-center space-x-2 bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-800 transition-all shadow-md active:scale-95"
              >
                <ShieldCheck size={16} />
                <span>Admin Panel</span>
              </button>
            )}

            {status === "authenticated" ? (
              <div className="flex items-center space-x-3 bg-gray-100 pl-3 pr-1 py-1 rounded-full border border-gray-200">
                <span className="text-sm font-medium text-gray-600">{session.user?.name}</span>
                <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-inner">
                  {session.user?.name?.charAt(0).toUpperCase()}
                </div>
              </div>
            ) : (
              <button
                onClick={() => signIn()}
                className="text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors"
              >
                Log In
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
        <div className="text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            Collaborate on <br />
            <span className="text-blue-600">Tomorrow&apos;s Ideas.</span>
          </h1>

          <p className="max-w-2xl mx-auto text-xl text-gray-500 mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            A specialized platform for capturing, discussing, and managing innovation.
            Submit your ideas, get feedback, and track implementation in real-time.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            <button
              onClick={handleStart}
              className="group relative flex items-center justify-center bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-blue-200 hover:bg-blue-700 hover:shadow-blue-300 transition-all active:scale-95 w-full sm:w-auto"
            >
              <span>{status === "authenticated" ? "Go to Dashboard" : "Get Started"}</span>
              <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={handleJoin}
              className="flex items-center justify-center bg-white text-gray-900 border-2 border-gray-100 px-8 py-4 rounded-2xl font-bold text-lg hover:border-blue-200 hover:bg-blue-50/50 transition-all active:scale-95 w-full sm:w-auto"
            >
              {status === "authenticated" ? (
                <>
                  <LayoutDashboard size={20} className="mr-2 text-gray-400" />
                  <span>Main Page</span>
                </>
              ) : (
                <>
                  <UserPlus size={20} className="mr-2 text-gray-400" />
                  <span>Join Discussion</span>
                </>
              )}
            </button>
          </div>

          {/* Feature Grid */}
          <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-12 text-left">
            <div className="group animate-in fade-in zoom-in duration-700 delay-300">
              <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all">
                <LayoutDashboard size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Topic Dashboards</h3>
              <p className="text-gray-500 leading-relaxed">
                Dedicated boards for every theme. View, react, and comment on ideas in one collaborative space.
              </p>
            </div>

            <div className="group animate-in fade-in zoom-in duration-700 delay-400">
              <div className="h-12 w-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">AI Intelligence</h3>
              <p className="text-gray-500 leading-relaxed">
                Smart similarity screening and automated summarization powered by Google Gemini AI.
              </p>
            </div>

            <div className="group animate-in fade-in zoom-in duration-700 delay-500">
              <div className="h-12 w-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-all">
                <LogIn size={24} />
              </div>
              <h3 className="text-xl font-bold mb-3">Seamless Access</h3>
              <p className="text-gray-500 leading-relaxed">
                Simple authentication and dynamic admin controls to manage your organization&apos;s innovation pipeline.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Branding */}
      <footer className="relative z-10 border-t border-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-400 text-sm">
          <p>© 2026 {theme.title} • Designed for collaborative innovation</p>
        </div>
      </footer>
    </div>
  );
}
