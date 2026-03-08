"use client";

import React, { useEffect, useState } from "react";
import { useSession, signOut, signIn } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { LogOut, LayoutDashboard, ShieldCheck, User } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

export default function Navbar() {
  const { data: session, status } = useSession();
  const router = useRouter();
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

  const isAdmin = (session?.user as any)?.isAdmin;

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 h-16 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        {/* Left: Branding */}
        <Link href="/" className="flex items-center space-x-2 group">
          <div className="bg-blue-600 p-1.5 rounded-lg text-white shadow-md shadow-blue-100 group-hover:bg-blue-700 transition-colors">
            <LayoutDashboard size={20} />
          </div>
          <span className="text-lg font-bold tracking-tight text-gray-900 group-hover:text-blue-600 transition-colors">
            {theme.title}
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
                    "hidden sm:flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
                    pathname === "/admin"
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <ShieldCheck size={16} />
                  <span>Admin</span>
                </Link>
              )}

              <div className="flex items-center space-x-3 bg-gray-50 pl-3 pr-1 py-1 rounded-full border border-gray-100">
                <span className="hidden md:inline text-sm font-medium text-gray-700">
                  {session.user?.name}
                </span>
                <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-inner">
                  {session.user?.name?.charAt(0).toUpperCase() || <User size={14} />}
                </div>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all group"
                  title="Log Out"
                >
                  <LogOut size={18} className="group-hover:scale-110" />
                </button>
              </div>
            </>
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
  );
}
