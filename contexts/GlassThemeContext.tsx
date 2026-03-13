"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { FEATURE_FLAGS } from "@/lib/feature-flags";

interface GlassThemeContextType {
  isGlassEnabled: boolean;
  isLG2Enabled: boolean;
}

const GlassThemeContext = createContext<GlassThemeContextType>({
  isGlassEnabled: false,
  isLG2Enabled: false,
});

export function GlassThemeProvider({ children }: { children: React.ReactNode }) {
  const [isGlassEnabled, setIsGlassEnabled] = useState(false);
  const [isLG2Enabled, setIsLG2Enabled] = useState(false);

  useEffect(() => {
    setIsGlassEnabled(FEATURE_FLAGS.ENABLE_LIQUID_GLASS);
    setIsLG2Enabled(FEATURE_FLAGS.ENABLE_LIQUID_GLASS_V2);

    // Apply theme classes to body to prevent background bleed
    if (FEATURE_FLAGS.ENABLE_LIQUID_GLASS_V2) {
      document.body.style.backgroundColor = "#F8F5F2"; // lg2-bg
    } else if (FEATURE_FLAGS.ENABLE_LIQUID_GLASS) {
      document.body.style.backgroundColor = "#1a1a2e"; // glass-bg start
    } else {
      document.body.style.backgroundColor = "#FFF1B5"; // washi-bg
    }
  }, []);

  return (
    <GlassThemeContext.Provider value={{ isGlassEnabled, isLG2Enabled }}>
      {children}
    </GlassThemeContext.Provider>
  );
}

export function useGlassTheme() {
  return useContext(GlassThemeContext);
}