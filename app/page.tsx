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
    <div className="min-h-screen bg-lab-bg text-lab-text font-sans selection:bg-lab-ui/30 relative overflow-hidden">
      {/* Paper Texture Layer */}
      <div className="fixed inset-0 paper-texture z-0" />

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-32">
        <div className="grid grid-cols-12 gap-8">

          {/* Main Hero Column - 8/12 */}
          <div className="col-span-12 lg:col-span-8 space-y-12">
            <header className="space-y-4">
              <div className="flex items-center space-x-4 mb-6">
                <span className="text-[10px] uppercase tracking-[0.4em] opacity-40 font-bold">PROTOCOL : WASHI_v2</span>
                <div className="h-[1px] w-12 bg-lab-ui/40" />
              </div>
              <h1 className="text-6xl md:text-8xl font-bold tracking-tight leading-none text-lab-text">
                Idea <br />
                <span className="text-lab-ui italic">Collection</span> <br />
                Matrix
              </h1>
              <p className="max-w-xl text-xl text-lab-text/70 leading-relaxed mt-8">
                An organic repository for collective intelligence.
                Synchronize your cognitive outputs with a tactile implementational pipeline.
              </p>
            </header>

            <div className="flex flex-wrap gap-6 pt-4">
              <button
                onClick={handleStart}
                className="px-10 py-5 bg-lab-text text-lab-bg rounded-full font-bold uppercase tracking-widest hover:bg-lab-ui hover:text-lab-text transition-all active:scale-95 flex items-center gap-3 shadow-xl shadow-paper-shadow"
              >
                <span>{status === "authenticated" ? "Access Dashboard" : "Initiate Protocol"}</span>
                <ArrowRight size={20} />
              </button>

              <button
                onClick={handleJoin}
                className="px-10 py-5 rounded-full border-2 border-lab-ui/40 text-lab-ui font-bold uppercase tracking-widest hover:border-lab-ui hover:bg-lab-ui/10 transition-all active:scale-95 flex items-center gap-3 shadow-sm"
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

            {/* Terminal Output Area - Styled as a Washi Sheet */}
            <div className="mt-20 p-8 glass-panel rounded-[2rem] border-none space-y-3 shadow-2xl shadow-paper-shadow overflow-hidden relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-lab-ui/20 to-transparent" />
              <div className="flex gap-4 text-lab-ui font-bold text-xs tracking-widest opacity-60">
                <span>[LOG]</span>
                <span>Initializing environment...</span>
              </div>
              <div className="flex gap-4 text-lab-text font-bold text-sm">
                <span>[SUCC]</span>
                <span>Core Theme Loaded: {theme.title}</span>
              </div>
              <div className="flex gap-4 text-lab-ui/60 font-medium text-xs">
                <span>[INFO]</span>
                <span>Active Submodules: {subTopics.length} detected</span>
              </div>
              <div className="flex gap-4 text-lab-text/40 italic text-sm pt-2">
                <span>[WAIT]</span>
                <span>Awaiting user input for implementation phase...</span>
              </div>
            </div>
          </div>

          {/* Sidebar Status Column - 4/12 */}
          <div className="hidden lg:col-span-4 lg:flex flex-col gap-8 pt-8">
            <div className="p-8 space-y-6 glass-panel rounded-[2rem] border-none shadow-xl shadow-paper-shadow">
              <div className="flex items-center justify-between border-b border-lab-ui/20 pb-4">
                <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-lab-text/40">Module Stats</span>
                <div className="w-2 h-2 bg-lab-ui rounded-full" />
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-bold tracking-widest text-lab-text/40">SIMILARITY_CHECK</span>
                    <span className="text-lab-ui font-bold text-xs">ACTIVE</span>
                  </div>
                  <div className="w-full bg-lab-ui/10 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-lab-ui w-3/4 h-full" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-[10px] font-bold tracking-widest text-lab-text/40">AI_SUMMARIZATION</span>
                    <span className="text-lab-ui font-bold text-xs">READY</span>
                  </div>
                  <div className="w-full bg-lab-ui/10 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-lab-ui w-full h-full" />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 glass-panel rounded-[2rem] border-none shadow-xl shadow-paper-shadow relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
              <div className="absolute top-0 right-0 w-24 h-24 bg-lab-ui/10 -rotate-45 translate-x-12 -translate-y-12 transition-colors" />
              <ShieldCheck className="text-lab-ui mb-4" size={32} />
              <h3 className="font-bold uppercase tracking-widest text-lab-text mb-2">Secure Auth</h3>
              <p className="text-sm text-lab-text/60 leading-relaxed">
                Multi-layered credential verification and session persistence management.
              </p>
            </div>

            <div className="flex-1 flex flex-col justify-end">
              <div className="text-[9px] text-lab-text/20 leading-loose uppercase tracking-[0.2em]">
                * system_alert: unauthorized access attempts will be logged. protocol 42 remains in effect.
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-6 border-t border-lab-ui/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-[10px] text-lab-text/40 tracking-[0.3em] font-bold uppercase">
            © 2026 {theme.title} // Washi Edition
          </div>
          <div className="flex gap-8">
            <div className="text-[10px] text-lab-text/40 font-bold flex items-center gap-2 tracking-widest uppercase">
              <div className="w-1.5 h-1.5 bg-green-500/50 rounded-full" />
              Grid Status: Nominal
            </div>
            <div className="text-[10px] text-lab-text/40 font-bold flex items-center gap-2 tracking-widest uppercase">
              <div className="w-1.5 h-1.5 bg-lab-ui/50 rounded-full" />
              Latency: 24ms
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
