"use client";

import React, { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { LayoutDashboard, ShieldCheck, UserPlus, ArrowRight } from "lucide-react";
import HeroAnimation from "@/components/HeroAnimation";
import { FEATURE_FLAGS } from "@/lib/feature-flags";
import { clsx } from "clsx";

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
      router.push("/login");
    }
  };

  // Show loading state during hydration to prevent flash of wrong background
  if (!mounted) {
    return (
      <div className={clsx(
        "min-h-screen font-sans",
        FEATURE_FLAGS.ENABLE_LIQUID_GLASS
          ? "bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f0f23]"
          : "bg-lab-bg"
      )}>
        <div className="flex items-center justify-center min-h-screen">
          <div className={clsx(
            "w-48 animate-pulse",
            FEATURE_FLAGS.ENABLE_LIQUID_GLASS ? "text-white/40" : "text-lab-text/40"
          )}>
            <div className="h-2 rounded bg-current/20 mb-4" />
            <div className="h-2 w-3/4 rounded bg-current/20" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={clsx(
      "min-h-screen font-sans relative overflow-hidden",
      FEATURE_FLAGS.ENABLE_LIQUID_GLASS
        ? "bg-gradient-to-br from-[#1a1a2e] via-[#16213e] to-[#0f0f23] text-white"
        : "bg-lab-bg text-lab-text"
    )}>
      {/* Background Layer */}
      {FEATURE_FLAGS.ENABLE_LIQUID_GLASS ? (
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

      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-16">
            <header className="space-y-6">
              <div className={clsx(
                "flex items-center space-x-4 mb-8 ink-reveal [animation-delay:100ms]",
                FEATURE_FLAGS.ENABLE_LIQUID_GLASS ? "glass-reveal" : ""
              )}>
                <span className={clsx(
                  "text-[10px] uppercase tracking-[0.5em] font-black",
                  FEATURE_FLAGS.ENABLE_LIQUID_GLASS
                    ? "text-white/40"
                    : "opacity-40"
                )}>
                  PROTOCOL : {FEATURE_FLAGS.ENABLE_LIQUID_GLASS ? 'GLASS_v1.0' : 'WASHI_v2.1'}
                </span>
                <div className={clsx(
                  "h-[1px] w-16",
                  FEATURE_FLAGS.ENABLE_LIQUID_GLASS
                    ? "bg-white/40"
                    : "bg-lab-ui/40"
                )} />
              </div>
              <div className="relative inline-block">
                <h1 className={clsx(
                  "text-7xl md:text-9xl font-bold tracking-tighter leading-[0.85] ink-reveal [animation-delay:200ms]",
                  FEATURE_FLAGS.ENABLE_LIQUID_GLASS ? "text-white glass-reveal" : "text-lab-text"
                )}>
                  Idea <br />
                  <span className={clsx(
                    "italic pr-4",
                    FEATURE_FLAGS.ENABLE_LIQUID_GLASS
                      ? "text-glass-secondary"
                      : "text-lab-ui"
                  )}>Collaboration</span> <br />
                  Platform
                </h1>
              </div>
              <p className={clsx(
                "max-w-xl text-2xl leading-relaxed mt-12 ink-reveal [animation-delay:400ms] font-light italic",
                FEATURE_FLAGS.ENABLE_LIQUID_GLASS
                  ? "text-white/70 glass-reveal"
                  : "text-lab-text/70"
              )}>
                A sanctuary for collective intelligence.
                Synchronize cognitive artifacts with high-fidelity implementation.
              </p>
            </header>

            <div className={clsx(
              "flex flex-wrap gap-8 pt-4 ink-reveal [animation-delay:600ms]",
              FEATURE_FLAGS.ENABLE_LIQUID_GLASS ? "glass-reveal" : ""
            )}>
              <button
                onClick={handleStart}
                className={clsx(
                  "px-12 py-6 rounded-full font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-4 shadow-2xl group",
                  FEATURE_FLAGS.ENABLE_LIQUID_GLASS
                    ? "glass-button text-white"
                    : "bg-lab-text text-lab-bg hover:bg-lab-ui hover:text-lab-text shadow-paper-shadow"
                )}
              >
                <span className="text-lg">{status === "authenticated" ? "Access Matrix" : "Get Started"}</span>
                <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
              </button>

              <button
                onClick={handleJoin}
                className={clsx(
                  "px-12 py-6 rounded-full font-black uppercase tracking-widest transition-all active:scale-95 flex items-center gap-4 shadow-xl group",
                  FEATURE_FLAGS.ENABLE_LIQUID_GLASS
                    ? "glass-button-secondary text-white"
                    : "bg-lab-ui text-lab-bg hover:bg-lab-text hover:text-lab-bg shadow-paper-shadow"
                )}
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
              <div className={clsx(
                "mt-8 p-6 rounded-3xl max-w-lg ink-reveal [animation-delay:800ms]",
                FEATURE_FLAGS.ENABLE_LIQUID_GLASS
                  ? "glass-card text-white/80"
                  : "bg-lab-ui/10 border border-lab-ui/20 text-lab-text/60"
              )}>
                <p className="text-sm font-bold uppercase tracking-widest">
                  System_Notice: No active sectors detected. Please contact a Matrix Administrator to initialize implementation nodes.
                </p>
              </div>
            )}
          </div>

          <div className={clsx(
            "hidden lg:block self-end pb-12",
            FEATURE_FLAGS.ENABLE_LIQUID_GLASS ? "glass-reveal [animation-delay:800ms]" : "ink-reveal [animation-delay:800ms]"
          )}>
            <HeroAnimation />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-12 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className={clsx(
            "text-[10px] tracking-[0.3em] font-bold uppercase",
            FEATURE_FLAGS.ENABLE_LIQUID_GLASS
              ? "text-white/40"
              : "text-lab-text/40"
          )}>
            © 2026 {theme.title} // {FEATURE_FLAGS.ENABLE_LIQUID_GLASS ? 'Glass Edition' : 'Washi Edition'}
          </div>
          <div className="flex gap-8">
            <div className={clsx(
              "text-[10px] font-bold flex items-center gap-2 tracking-widest uppercase",
              FEATURE_FLAGS.ENABLE_LIQUID_GLASS
                ? "text-white/40"
                : "text-lab-text/40"
            )}>
              <div className="w-1.5 h-1.5 bg-green-500/50 rounded-full" />
              Grid Status: Nominal
            </div>
            <div className={clsx(
              "text-[10px] font-bold flex items-center gap-2 tracking-widest uppercase",
              FEATURE_FLAGS.ENABLE_LIQUID_GLASS
                ? "text-white/40"
                : "text-lab-text/40"
            )}>
              <div className={clsx(
                "w-1.5 h-1.5 rounded-full",
                FEATURE_FLAGS.ENABLE_LIQUID_GLASS
                  ? "bg-glass-secondary/50"
                  : "bg-lab-ui/50"
              )} />
              Latency: 24ms
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
