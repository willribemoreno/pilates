"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme(); // respects system
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    // Lightweight placeholder (keeps layout stable during SSR → CSR hydration)
    return (
      <div className="relative w-14 h-8 rounded-full border border-blue-200/50 dark:border-blue-700/50" />
    );
  }

  const isDark =
    theme === "dark" || (theme === "system" && resolvedTheme === "dark");

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative w-14 h-8 rounded-full border border-blue-200/50 dark:border-blue-700/50
                 bg-gradient-to-r from-indigo-200/80 to-blue-200/80
                 dark:from-indigo-900/80 dark:to-blue-900/80
                 hover:from-indigo-300/80 hover:to-blue-300/80
                 dark:hover:from-indigo-800/80 dark:hover:to-blue-800/80
                 backdrop-blur-sm shadow-lg hover:shadow-xl
                 transition-all duration-300 group"
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      {/* Background glow layer */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-50/30 to-blue-50/30 dark:from-indigo-950/30 dark:to-blue-950/30" />

      {/* Knob */}
      <div
        className={`absolute top-0.5 flex h-7 w-7 items-center justify-center rounded-full shadow-md
                    transition-all duration-300 transform group-hover:scale-110
                    ${
                      isDark
                        ? "left-6 bg-gray-800 text-blue-400"
                        : "left-0.5 bg-white text-yellow-600"
                    }`}
      >
        <span className="text-sm">{isDark ? "🌙" : "☀️"}</span>
      </div>
    </button>
  );
}
