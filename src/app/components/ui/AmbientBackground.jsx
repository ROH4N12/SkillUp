import React from "react";

/**
 * AmbientBackground provides soft, blurred lighting orbs behind the dashboard.
 * Designed for 120 FPS hardware-accelerated rendering without scroll overhead.
 */
export function AmbientBackground({ className = "" }) {
  return (
    <div 
      className={`fixed inset-0 pointer-events-none overflow-hidden z-0 ${className}`}
      aria-hidden="true"
    >
      {/* Top Left - Soft Indigo / Purple Ambient Glow */}
      <div 
        className="absolute -top-[12%] -left-[8%] w-[520px] h-[520px] sm:w-[680px] sm:h-[680px] rounded-full bg-gradient-to-br from-indigo-400/35 via-purple-400/25 to-transparent dark:from-indigo-600/20 dark:via-purple-700/15 dark:to-transparent blur-[90px] sm:blur-[120px] transform-gpu translate-3d will-change-transform"
      />

      {/* Top Right - Soft Sky / Cyan Ambient Glow */}
      <div 
        className="absolute -top-[10%] right-[5%] w-[480px] h-[480px] sm:w-[600px] sm:h-[600px] rounded-full bg-gradient-to-bl from-cyan-300/30 via-blue-400/20 to-transparent dark:from-cyan-600/15 dark:via-blue-600/15 dark:to-transparent blur-[85px] sm:blur-[115px] transform-gpu translate-3d will-change-transform"
      />

      {/* Center Left - Soft Violet Accent Glow */}
      <div 
        className="absolute top-[35%] -left-[10%] w-[420px] h-[420px] sm:w-[540px] sm:h-[540px] rounded-full bg-gradient-to-tr from-violet-300/25 via-fuchsia-300/20 to-transparent dark:from-violet-800/15 dark:via-fuchsia-900/10 dark:to-transparent blur-[90px] sm:blur-[120px] transform-gpu translate-3d will-change-transform"
      />

      {/* Bottom Right - Subtle Indigo / Lavender Ambient Glow */}
      <div 
        className="absolute -bottom-[15%] right-[2%] w-[550px] h-[550px] sm:w-[700px] sm:h-[700px] rounded-full bg-gradient-to-tl from-indigo-300/30 via-purple-300/20 to-transparent dark:from-indigo-700/20 dark:via-purple-900/15 dark:to-transparent blur-[95px] sm:blur-[130px] transform-gpu translate-3d will-change-transform"
      />
    </div>
  );
}
