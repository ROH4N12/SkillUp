import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";

/**
 * Animated, attractive ThemeToggle component.
 * Supports both "icon" mode (for navbars/headers) and "switch" mode (for sidebars/settings).
 * Triggers silky-smooth circular ripple View Transition from the click origin.
 */
export function ThemeToggle({ variant = "icon", className = "", showLabel = false }) {
  const { theme, toggleTheme } = useTheme();
  const isDark =
    theme === "dark" ||
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  if (variant === "switch") {
    return (
      <button
        onClick={toggleTheme}
        type="button"
        className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100/70 dark:hover:bg-slate-700/50 active:scale-[0.98] transition-all select-none group ${className}`}
        aria-label="Toggle dark mode"
      >
        <div className="flex items-center gap-2.5">
          <div className="relative w-5 h-5 flex items-center justify-center">
            <Sun 
              className={`w-4.5 h-4.5 text-amber-500 transition-all duration-300 absolute ${
                isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
              }`} 
            />
            <Moon 
              className={`w-4.5 h-4.5 text-indigo-400 transition-all duration-300 absolute ${
                isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
              }`} 
            />
          </div>
          <span className="text-sm font-medium">Dark Mode</span>
        </div>

        {/* Animated switch track */}
        <div 
          className={`w-11 h-6 rounded-full relative p-0.5 transition-all duration-300 ease-out border ${
            isDark 
              ? "bg-gradient-to-r from-indigo-600 to-purple-600 border-indigo-500/40 shadow-inner shadow-indigo-950/40" 
              : "bg-gradient-to-r from-amber-200 to-orange-200 border-amber-300/50 shadow-inner"
          }`}
        >
          {/* Subtle star/cloud decorations inside track */}
          <div className="absolute inset-0 flex items-center justify-between px-1.5 text-[9px] pointer-events-none opacity-60">
            <span className={`transition-opacity duration-200 ${isDark ? "opacity-100 text-indigo-200" : "opacity-0"}`}>✦</span>
            <span className={`transition-opacity duration-200 ${isDark ? "opacity-0" : "opacity-100 text-amber-600"}`}>☼</span>
          </div>

          {/* Sliding knob */}
          <div 
            className={`w-5 h-5 rounded-full bg-white shadow-md flex items-center justify-center transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
              isDark ? "translate-x-5 shadow-indigo-950/30" : "translate-x-0 shadow-orange-950/20"
            }`}
          >
            {isDark ? (
              <Moon className="w-3 h-3 text-indigo-600" />
            ) : (
              <Sun className="w-3 h-3 text-amber-500" />
            )}
          </div>
        </div>
      </button>
    );
  }

  // "icon" variant for top headers & navbars
  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`
        relative p-2 rounded-xl border border-transparent hover:border-gray-200/80 dark:hover:border-slate-700/80
        hover:bg-gray-100/80 dark:hover:bg-slate-700/60 active:scale-90
        transition-all duration-200 group overflow-hidden focus:outline-none select-none
        ${isDark ? "text-indigo-400 hover:text-indigo-300" : "text-amber-500 hover:text-amber-600"}
        ${className}
      `}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
    >
      {/* Ambient background glow ring on hover */}
      <span 
        className={`absolute inset-0 rounded-xl transition-opacity duration-300 opacity-0 group-hover:opacity-100 ${
          isDark 
            ? "bg-indigo-500/10 shadow-[0_0_15px_rgba(99,102,241,0.25)]" 
            : "bg-amber-400/10 shadow-[0_0_15px_rgba(245,158,11,0.25)]"
        }`} 
      />

      {/* Rotating Sun / Moon icon container */}
      <div className="relative w-5 h-5 flex items-center justify-center">
        <Sun 
          className={`w-4.5 h-4.5 text-amber-500 transition-all duration-300 absolute ${
            isDark 
              ? "rotate-90 scale-0 opacity-0" 
              : "rotate-0 scale-100 opacity-100 group-hover:rotate-45"
          }`} 
        />
        <Moon 
          className={`w-4.5 h-4.5 text-indigo-400 transition-all duration-300 absolute ${
            isDark 
              ? "rotate-0 scale-100 opacity-100 group-hover:-rotate-12" 
              : "-rotate-90 scale-0 opacity-0"
          }`} 
        />
      </div>

      {showLabel && (
        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
          {isDark ? "Dark" : "Light"}
        </span>
      )}
    </button>
  );
}
