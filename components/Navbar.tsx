"use client";

import React, { useEffect, useState } from "react";
import { useSession, signOut, signIn } from "next-auth/react";
import { usePathname } from "next/navigation";
import { LogOut, LayoutDashboard, ShieldCheck, User, Columns } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";
import { FEATURE_FLAGS } from "@/lib/feature-flags";

interface LabUser {
  isAdmin?: boolean;
}

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [theme, setTheme] = useState({ title: "Idea Collection" });
  const [firstSubTopicId, setFirstSubTopicId] = useState<string | null>(null);

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
  const isAdmin = user?.isAdmin;

  return (
    <nav className="sticky top-0 z-50 w-full bg-lab-bg/60 backdrop-blur-lg border-b border-lab-ui/10 h-20 transition-all font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        {/* Left: Branding */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="bg-lab-ui/40 p-2 rounded-full text-lab-text group-hover:bg-lab-ui transition-all">
            <LayoutDashboard size={20} />
          </div>
          <span className="text-lg font-semibold tracking-normal text-lab-text group-hover:text-lab-ui transition-colors">
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
                    href={firstSubTopicId ? `/dashboard/${firstSubTopicId}` : "/"}
                    className={clsx(
                      "hidden sm:flex items-center space-x-2 px-5 py-2 rounded-full shadow-sm shadow-paper-shadow text-[10px] uppercase font-bold tracking-widest transition-all",
                      pathname.startsWith("/dashboard")
                        ? "bg-lab-ui text-lab-text shadow-md"
                        : "bg-lab-ui/20 text-lab-text hover:bg-lab-ui/30"
                    )}
                  >
                    <LayoutDashboard size={14} />
                    <span>Dashboard</span>
                  </Link>

                  {FEATURE_FLAGS.ENABLE_KANBAN_BOARD && (
                    <Link
                      href="/kanban"
                      className={clsx(
                        "hidden sm:flex items-center space-x-2 px-5 py-2 rounded-full shadow-sm shadow-paper-shadow text-[10px] uppercase font-bold tracking-widest transition-all",
                        pathname === "/kanban"
                          ? "bg-lab-ui text-lab-text shadow-md"
                          : "bg-lab-ui/20 text-lab-text hover:bg-lab-ui/30"
                      )}
                    >
                      <Columns size={14} />
                      <span>Kanban</span>
                    </Link>
                  )}

                  <Link
                    href="/admin"
                    className={clsx(
                      "hidden sm:flex items-center space-x-2 px-5 py-2 rounded-full shadow-sm shadow-paper-shadow text-[10px] uppercase font-bold tracking-widest transition-all",
                      pathname === "/admin"
                        ? "bg-lab-ui text-lab-text shadow-md"
                        : "bg-lab-ui/20 text-lab-text hover:bg-lab-ui/30"
                    )}
                  >
                    <ShieldCheck size={14} />
                    <span>Admin Panel</span>
                  </Link>
                </>
              )}

              <div className="flex items-center space-x-3 pl-4 pr-1 py-1 rounded-full bg-lab-ui/20 shadow-sm shadow-paper-shadow">
                <span className="hidden md:inline text-[10px] uppercase font-bold text-lab-text/60">
                  USR: {session.user?.name?.split(' ')[0]}
                </span>
                <div className="h-8 w-8 rounded-full bg-lab-ui/40 text-lab-text flex items-center justify-center text-xs font-bold">
                  {session.user?.name?.charAt(0).toUpperCase() || <User size={14} />}
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="p-1.5 text-lab-text/30 hover:text-red-500 transition-all"
                  title="Terminate Session"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={() => signIn()}
              className="text-xs font-black uppercase tracking-widest bg-lab-ui text-lab-bg px-6 py-2 rounded-full shadow-sm shadow-paper-shadow hover:bg-lab-text transition-all active:scale-95"
            >
              Login
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
