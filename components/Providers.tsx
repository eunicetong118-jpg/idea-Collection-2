"use strict";
"use client";

import { SessionProvider } from "next-auth/react";
import { GlassThemeProvider } from "@/contexts/GlassThemeContext";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <GlassThemeProvider>{children}</GlassThemeProvider>
    </SessionProvider>
  );
}
