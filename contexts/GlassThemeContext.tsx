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