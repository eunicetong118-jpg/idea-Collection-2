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

      // Admin should go to admin panel if no subtopics exist yet to create them
      if (user?.isAdmin && subTopics.length === 0) {
        router.push("/admin");
        return;
      }

      // If we have subtopics, go to the first one
      if (subTopics.length > 0) {
        router.push(`/dashboard/${subTopics[0].id}`);
      }
    }
  }, [status, subTopics, router, session]);

  const [mounted, setMounted] = useState(false);

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

  useEffect(() => {
    setMounted(true);
    fetchData();
  }, []);

  const handleStart = () => {
    const user = session?.user as LabUser;
    if (status === "authenticated") {
      if (subTopics.length > 0) {
        router.push(`/dashboard/${subTopics[0].id}`);
      } else if (user?.isAdmin) {
        router.push("/admin");
      } else {
        // Logged in but no sectors available and not admin
        // We stay here but maybe refresh or show a message
        fetchData();
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
      } else {
        fetchData();
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
        <div className="max-w-4xl">
          <div className="space-y-16">
            <header className="space-y-6">
              <div className="flex items-center space-x-4 mb-8 ink-reveal [animation-delay:100ms]">
                <span className="text-[10px] uppercase tracking-[0.5em] opacity-40 font-black">PROTOCOL : WASHI_v2.1</span>
                <div className="h-[1px] w-16 bg-lab-ui/40" />
              </div>
              <div className="relative inline-block">
                <h1 className="text-7xl md:text-9xl font-bold tracking-tighter leading-[0.85] text-lab-text ink-reveal [animation-delay:200ms]">
                  Idea <br />
                  <span className="text-lab-ui italic pr-4">Collaboration</span> <br />
                  Platform
                </h1>
              </div>
              <p className="max-w-xl text-2xl text-lab-text/70 leading-relaxed mt-12 ink-reveal [animation-delay:400ms] font-light italic">
                A sanctuary for collective intelligence.
                Synchronize cognitive artifacts with high-fidelity implementation.
              </p>
            </header>

            <div className="flex flex-wrap gap-8 pt-4 ink-reveal [animation-delay:600ms]">
              <button
                onClick={handleStart}
                className="px-12 py-6 bg-lab-text text-lab-bg rounded-full font-black uppercase tracking-widest hover:bg-lab-ui hover:text-lab-text transition-all active:scale-95 flex items-center gap-4 shadow-2xl shadow-paper-shadow group"
              >
                <span className="text-lg">{status === "authenticated" ? "Access Matrix" : "Get Started"}</span>
                <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
              </button>

              <button
                onClick={handleJoin}
                className="px-12 py-6 rounded-full bg-lab-ui text-lab-bg font-black uppercase tracking-widest hover:bg-lab-text hover:text-lab-bg transition-all active:scale-95 flex items-center gap-4 shadow-xl shadow-paper-shadow"
              >
                {status === "authenticated" ? (
                  <>
                    <LayoutDashboard size={24} />
                    <span>Interface</span>
                  </>
                ) : (
                  <>
                    <UserPlus size={24} />
                    <span>Collaborate</span>
                  </>
                )}
              </button>
            </div>

            {status === "authenticated" && subTopics.length === 0 && !(session?.user as LabUser)?.isAdmin && (
              <div className="mt-8 p-6 bg-lab-ui/10 border border-lab-ui/20 rounded-3xl max-w-lg ink-reveal [animation-delay:800ms]">
                <p className="text-sm font-bold text-lab-text/60 uppercase tracking-widest">
                  System_Notice: No active sectors detected. Please contact a Matrix Administrator to initialize implementation nodes.
                </p>
              </div>
            )}
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
