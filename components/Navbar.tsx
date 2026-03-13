"use client";

import React, { useEffect, useState } from "react";
import { useSession, signOut, signIn } from "next-auth/react";
import { usePathname } from "next/navigation";
import { LogOut, LayoutDashboard, ShieldCheck, User, Columns } from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";
import { FEATURE_FLAGS } from "@/lib/feature-flags";

interface LabUser {
  isAdmin?: boolean;
}

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [theme, setTheme] = useState({ title: "Idea Collection" });
  const [firstSubTopicId, setFirstSubTopicId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Prevent flash of wrong styles by waiting for client-side mount
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // Fetch theme
    fetch("/api/admin/theme")
      .then((res) => res.json())
      .then((data) => {
        if (data.title) setTheme(data);
      })
      .catch((err) => console.error("Error fetching theme:", err));

    // Fetch subtopics to find the first one for the Dashboard link
    fetch("/api/admin/subtopics")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setFirstSubTopicId(data[0].id);
        }
      })
      .catch((err) => console.error("Error fetching subtopics:", err));
  }, []);

  const user = session?.user as LabUser;
  const isAdmin = user?.isAdmin; // Admin status from session

  // Determine dashboard href - go to admin panel if no subtopics exist for admin
  const dashboardHref = firstSubTopicId
    ? `/dashboard/${firstSubTopicId}`
    : isAdmin
      ? "/admin"
      : "/";

  // Show loading skeleton during hydration to prevent flash
  if (!mounted) {
    return (
      <nav className={clsx(
        "sticky top-0 z-50 w-full h-20 font-sans",
        FEATURE_FLAGS.ENABLE_LIQUID_GLASS
          ? "bg-transparent"
          : "bg-lab-bg/60 backdrop-blur-lg border-b border-lab-ui/10"
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={clsx(
              "w-10 h-10 rounded-full animate-pulse",
              FEATURE_FLAGS.ENABLE_LIQUID_GLASS ? "bg-white/20" : "bg-lab-ui/40"
            )} />
            <div className={clsx(
              "h-4 w-24 rounded animate-pulse",
              FEATURE_FLAGS.ENABLE_LIQUID_GLASS ? "bg-white/20" : "bg-lab-ui/40"
            )} />
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className={clsx(
      "sticky top-0 z-50 w-full h-20 transition-all font-sans",
      FEATURE_FLAGS.ENABLE_LIQUID_GLASS
        ? "bg-transparent text-white"
        : "bg-lab-bg/60 backdrop-blur-lg border-b border-lab-ui/10 text-lab-text"
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        {/* Left: Branding */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className={clsx(
            "p-2 rounded-full transition-all",
            FEATURE_FLAGS.ENABLE_LIQUID_GLASS
              ? "bg-white/20 text-white group-hover:bg-white/30"
              : "bg-lab-ui/40 text-lab-text group-hover:bg-lab-ui"
          )}>
            <LayoutDashboard size={20} />
          </div>
          <span className={clsx(
            "text-lg font-semibold tracking-normal transition-colors",
            FEATURE_FLAGS.ENABLE_LIQUID_GLASS
              ? "text-white group-hover:text-white/80"
              : "text-lab-text group-hover:text-lab-ui"
          )}>
            {theme.title}
          </span>
        </Link>

        {/* Right: Actions */}
        <div className="flex items-center space-x-4">
          {status === "authenticated" ? (
            <>
              {isAdmin && (
                <>
                  <Link
                    href={dashboardHref}
                    className={clsx(
                      "hidden sm:flex items-center space-x-2 px-5 py-2 rounded-full shadow-sm text-[10px] uppercase font-bold tracking-widest transition-all",
                      pathname.startsWith("/dashboard")
                        ? FEATURE_FLAGS.ENABLE_LIQUID_GLASS
                          ? "glass-button text-white shadow-md"
                          : "bg-lab-ui text-lab-text shadow-md shadow-paper-shadow"
                        : FEATURE_FLAGS.ENABLE_LIQUID_GLASS
                          ? "bg-white/10 text-white hover:bg-white/20"
                          : "bg-lab-ui/20 text-lab-text hover:bg-lab-ui/30 shadow-paper-shadow"
                    )}
                  >
                    <LayoutDashboard size={14} />
                    <span>Dashboard</span>
                  </Link>

                  {FEATURE_FLAGS.ENABLE_KANBAN_BOARD && (
                    <Link
                      href="/kanban"
                      className={clsx(
                        "hidden sm:flex items-center space-x-2 px-5 py-2 rounded-full shadow-sm text-[10px] uppercase font-bold tracking-widest transition-all",
                        pathname === "/kanban"
                          ? FEATURE_FLAGS.ENABLE_LIQUID_GLASS
                            ? "glass-button text-white shadow-md"
                            : "bg-lab-ui text-lab-text shadow-md shadow-paper-shadow"
                          : FEATURE_FLAGS.ENABLE_LIQUID_GLASS
                            ? "bg-white/10 text-white hover:bg-white/20"
                            : "bg-lab-ui/20 text-lab-text hover:bg-lab-ui/30 shadow-paper-shadow"
                      )}
                    >
                      <Columns size={14} />
                      <span>Kanban</span>
                    </Link>
                  )}

                  <Link
                    href="/admin"
                    className={clsx(
                      "hidden sm:flex items-center space-x-2 px-5 py-2 rounded-full shadow-sm text-[10px] uppercase font-bold tracking-widest transition-all",
                      pathname === "/admin"
                        ? FEATURE_FLAGS.ENABLE_LIQUID_GLASS
                          ? "glass-button text-white shadow-md"
                          : "bg-lab-ui text-lab-text shadow-md shadow-paper-shadow"
                        : FEATURE_FLAGS.ENABLE_LIQUID_GLASS
                          ? "bg-white/10 text-white hover:bg-white/20"
                          : "bg-lab-ui/20 text-lab-text hover:bg-lab-ui/30 shadow-paper-shadow"
                    )}
                  >
                    <ShieldCheck size={14} />
                    <span>Admin Panel</span>
                  </Link>
                </>
              )}

              <div className={clsx(
                "flex items-center space-x-3 pl-4 pr-1 py-1 rounded-full shadow-sm",
                FEATURE_FLAGS.ENABLE_LIQUID_GLASS
                  ? "bg-white/10 text-white"
                  : "bg-lab-ui/20 shadow-paper-shadow"
              )}>
                <span className={clsx(
                  "hidden md:inline text-[10px] uppercase font-bold",
                  FEATURE_FLAGS.ENABLE_LIQUID_GLASS
                    ? "text-white/60"
                    : "text-lab-text/60"
                )}>
                  USR: {session.user?.name?.split(' ')[0]}
                </span>
                <div className={clsx(
                  "h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold",
                  FEATURE_FLAGS.ENABLE_LIQUID_GLASS
                    ? "bg-white/20 text-white"
                    : "bg-lab-ui/40 text-lab-text"
                )}>
                  {session.user?.name?.charAt(0).toUpperCase() || <User size={14} />}
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className={clsx(
                    "p-1.5 transition-all",
                    FEATURE_FLAGS.ENABLE_LIQUID_GLASS
                      ? "text-white/30 hover:text-red-400"
                      : "text-lab-text/30 hover:text-red-500"
                  )}
                  title="Terminate Session"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </>
          ) : (
            <Link
              href="/login"
              className={clsx(
                "text-xs font-black uppercase tracking-widest px-6 py-2 rounded-full shadow-sm transition-all active:scale-95",
                FEATURE_FLAGS.ENABLE_LIQUID_GLASS
                  ? "glass-button text-white"
                  : "bg-lab-ui text-lab-bg shadow-paper-shadow hover:bg-lab-text"
              )}
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
