"use client";

import { useTheme } from "@/components/theme-provider";

/** Shared Recharts tick/tooltip colors that follow light/dark theme. */
export function useChartColors() {
  const { theme } = useTheme();
  const isLight = theme === "light";
  return {
    tick: isLight ? "#334155" : "#94a3b8",
    grid: isLight ? "rgba(15,23,42,0.12)" : "rgba(148,163,184,0.15)",
    tooltipBg: isLight ? "#ffffff" : "#0b1220",
    tooltipBorder: isLight ? "rgba(15,23,42,0.12)" : "rgba(255,255,255,0.1)",
    tooltipText: isLight ? "#0f172a" : "#e2e8f0",
  };
}
