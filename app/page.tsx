"use client";

import React, { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LayoutDashboard, ShieldCheck, UserPlus, ArrowRight } from "lucide-react";

interface LabUser {
  isAdmin?: boolean;
}

export default function LandingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [theme, setTheme] = useState<{ title: string }>({ title: "Idea Collection" });
  const [subTopics, setSubTopics] = useState<{ id: string }[]>([]);

  useEffect(() => {
    // If authenticated, automatically redirect to first dashboard or admin
    if (status === "authenticated") {
      const user = session?.user as LabUser;
      if (subTopics.length > 0) {
        router.push(`/dashboard/${subTopics[0].id}`);
      } else if (user?.isAdmin) {
        router.push("/admin");
      }
    }
  }, [status, subTopics, router, session]);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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
    const user = session?.user as LabUser;
    if (status === "authenticated") {
      if (subTopics.length > 0) {
        router.push(`/dashboard/${subTopics[0].id}`);
      } else if (user?.isAdmin) {
        router.push("/admin");
      }
    } else {
      router.push("/register");
    }
  };

  const handleJoin = () => {
    const user = session?.user as LabUser;
    if (status === "authenticated") {
      if (subTopics.length > 0) {
        router.push(`/dashboard/${subTopics[0].id}`);
      } else if (user?.isAdmin) {
        router.push("/admin");
      }
    } else {
      signIn();
    }
  };

  return (
    <div className="min-h-screen bg-lab-bg text-lab-text font-mono selection:bg-lab-ui/30 relative overflow-hidden">
      {/* Tech Noise Layer */}
      <div className="absolute inset-0 tech-noise z-0" />

      {/* Scanline Overlay */}
      <div className="crt-overlay" />

      {/* Decorative Border Frame */}
      <div className="fixed inset-4 border border-lab-ui/30 pointer-events-none z-50">
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-lab-ui" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-lab-ui" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-lab-ui" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-lab-ui" />

        {/* Status Indicators in Corners */}
        <div className="absolute top-2 left-6 text-[10px] uppercase tracking-widest text-lab-ui/60 animate-flicker">
          SYS_LOG // {mounted ? new Date().toISOString().split('T')[0] : 'LOADING'} // SEC_LEVEL: 4
        </div>
        <div className="absolute bottom-2 right-6 text-[10px] uppercase tracking-widest text-lab-ui/60">
          STABLE_CONNECTION // {status.toUpperCase()}
        </div>
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-32">
        <div className="grid grid-cols-12 gap-8">

          {/* Main Hero Column - 8/12 */}
          <div className="col-span-12 lg:col-span-8 space-y-12">
            <header className="space-y-4">
              <div className="inline-block border border-lab-ui px-2 py-1 text-xs text-lab-ui animate-pulse mb-4">
                PROTOCOL: INNOVATION_V2.0
              </div>
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none uppercase italic">
                LAB // <br />
                <span className="text-lab-ui">IDEA</span> // <br />
                CORP
              </h1>
              <p className="max-w-xl text-lg text-lab-text/80 leading-relaxed font-sans mt-8">
                A high-fidelity capture module for innovation intelligence.
                Synchronize your cognitive outputs with the implementational pipeline.
              </p>
            </header>

            <div className="flex flex-wrap gap-6 pt-4">
              <button
                onClick={handleStart}
                className="group relative px-10 py-5 bg-lab-ui text-lab-bg font-black uppercase tracking-tighter hover:bg-lab-text transition-all active:scale-95 flex items-center gap-3 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="relative z-10">{status === "authenticated" ? "Access Dashboard" : "Initiate Protocol"}</span>
                <ArrowRight size={24} className="relative z-10 group-hover:translate-x-2 transition-transform" />
              </button>

              <button
                onClick={handleJoin}
                className="px-10 py-5 border-2 border-lab-ui/40 text-lab-ui font-black uppercase tracking-tighter hover:border-lab-ui hover:bg-lab-ui/10 transition-all active:scale-95 flex items-center gap-3"
              >
                {status === "authenticated" ? (
                  <>
                    <LayoutDashboard size={20} />
                    <span>View Matrix</span>
                  </>
                ) : (
                  <>
                    <UserPlus size={20} />
                    <span>Join Subsystem</span>
                  </>
                )}
              </button>
            </div>

            {/* Terminal Output Area */}
            <div className="mt-20 border border-lab-ui/20 bg-lab-bg/40 p-6 glass-panel font-mono text-sm space-y-2">
              <div className="flex gap-4 text-lab-ui/40">
                <span>[LOG]</span>
                <span>Initializing environment...</span>
              </div>
              <div className="flex gap-4 text-lab-ui">
                <span>[SUCC]</span>
                <span>Core Theme Loaded: {theme.title}</span>
              </div>
              <div className="flex gap-4 text-lab-ui/40">
                <span>[INFO]</span>
                <span>Active Submodules: {subTopics.length} detected</span>
              </div>
              <div className="flex gap-4 text-lab-text animate-pulse">
                <span>[WARN]</span>
                <span>Awaiting user input for implementation phase...</span>
              </div>
            </div>
          </div>

          {/* Sidebar Status Column - 4/12 */}
          <div className="hidden lg:col-span-4 lg:flex flex-col gap-8 pt-8">
            <div className="border border-lab-ui/30 p-6 space-y-6 glass-panel">
              <div className="flex items-center justify-between border-b border-lab-ui/30 pb-4">
                <span className="text-xs uppercase tracking-widest text-lab-ui/60">Module Stats</span>
                <div className="w-2 h-2 bg-lab-ui rounded-full animate-pulse" />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <span className="text-xs text-lab-text/60">SIMILARITY_CHECK</span>
                  <span className="text-lab-ui font-bold">ACTIVE</span>
                </div>
                <div className="w-full bg-lab-ui/10 h-1">
                  <div className="bg-lab-ui w-3/4 h-full shadow-[0_0_8px_rgba(193,219,232,0.8)]" />
                </div>

                <div className="flex justify-between items-end pt-4">
                  <span className="text-xs text-lab-text/60">AI_SUMMARIZATION</span>
                  <span className="text-lab-ui font-bold">GEMINI_004</span>
                </div>
                <div className="w-full bg-lab-ui/10 h-1">
                  <div className="bg-lab-ui w-full h-full shadow-[0_0_8px_rgba(193,219,232,0.8)]" />
                </div>
              </div>
            </div>

            <div className="border border-lab-ui/30 p-6 glass-panel relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-20 h-20 bg-lab-ui/5 -rotate-45 translate-x-10 -translate-y-10 group-hover:bg-lab-ui/10 transition-colors" />
              <ShieldCheck className="text-lab-ui mb-4" size={32} />
              <h3 className="font-black uppercase tracking-tighter text-xl mb-2">SECURE_AUTH</h3>
              <p className="text-xs text-lab-text/60 font-sans leading-relaxed">
                Multi-layered credential verification and session persistence management.
              </p>
            </div>

            <div className="flex-1 flex flex-col justify-end">
              <div className="text-[10px] text-lab-ui/30 leading-tight">
                * SYSTEM_ALERT: Unauthorized access attempts will be logged and reported to the central innovation authority.
                Protocol 42 remains in effect.
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Technical Footer */}
      <footer className="relative z-10 py-12 px-6 border-t border-lab-ui/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-xs text-lab-ui/40 tracking-widest">
            © 2026 {theme.title.toUpperCase()} // TECH_NOIR_EDITION
          </div>
          <div className="flex gap-8">
            <div className="text-[10px] text-lab-ui/60 flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
              GRID_STATUS: NOMINAL
            </div>
            <div className="text-[10px] text-lab-ui/60 flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-lab-ui rounded-full animate-flicker" />
              LATENCY: 24MS
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
