"use client";

import React, { useEffect, useState } from "react";
import { useSession, signOut, signIn } from "next-auth/react";
import { usePathname } from "next/navigation";
import { LogOut, LayoutDashboard, ShieldCheck, User } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

interface LabUser {
  isAdmin?: boolean;
}

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [theme, setTheme] = useState({ title: "Idea Collection" });

  useEffect(() => {
    fetch("/api/admin/theme")
      .then((res) => res.json())
      .then((data) => {
        if (data.title) setTheme(data);
      })
      .catch((err) => console.error("Error fetching theme:", err));
  }, []);

  const user = session?.user as LabUser;
  const isAdmin = user?.isAdmin;

  return (
    <nav className="sticky top-0 z-50 w-full bg-lab-bg/80 backdrop-blur-md border-b border-lab-ui/20 h-16 transition-all font-mono">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        {/* Left: Branding */}
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="border border-lab-ui p-1 text-lab-ui group-hover:bg-lab-ui group-hover:text-lab-bg transition-colors">
            <LayoutDashboard size={18} />
          </div>
          <span className="text-sm font-black tracking-tighter uppercase text-lab-text group-hover:text-lab-ui transition-colors">
            LAB // {theme.title.toUpperCase()}
          </span>
        </Link>

        {/* Right: Actions */}
        <div className="flex items-center space-x-4">
          {status === "authenticated" ? (
            <>
              {isAdmin && (
                <Link
                  href="/admin"
                  className={clsx(
                    "hidden sm:flex items-center space-x-2 px-4 py-1 border border-lab-ui/30 text-[10px] uppercase font-bold tracking-widest transition-all",
                    pathname === "/admin"
                      ? "bg-lab-ui text-lab-bg"
                      : "text-lab-ui hover:bg-lab-ui/10"
                  )}
                >
                  <ShieldCheck size={14} />
                  <span>Admin_Panel</span>
                </Link>
              )}

              <div className="flex items-center space-x-3 pl-3 pr-1 py-1 border border-lab-ui/20 bg-lab-bg/40">
                <span className="hidden md:inline text-[10px] uppercase font-bold text-lab-text/60">
                  USR: {session.user?.name?.split(' ')[0]}
                </span>
                <div className="h-6 w-6 border border-lab-ui text-lab-ui flex items-center justify-center text-[10px] font-black">
                  {session.user?.name?.charAt(0).toUpperCase() || <User size={10} />}
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="p-1.5 text-lab-ui/40 hover:text-red-500 transition-all"
                  title="TERMINATE_SESSION"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </>
          ) : (
            <button
              onClick={() => signIn()}
              className="text-xs font-black uppercase tracking-tighter text-lab-ui hover:text-lab-text transition-colors border border-lab-ui/40 px-4 py-1 hover:bg-lab-ui/10"
            >
              Initialize_Auth
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
