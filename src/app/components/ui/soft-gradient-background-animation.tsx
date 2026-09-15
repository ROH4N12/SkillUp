import React from "react";

export interface SoftGradientBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  animationDuration?: number;
  intensity?: "subtle" | "medium" | "vibrant";
  className?: string;
}

/**
 * SoftGradientBackground (OKLCH Animated Hue Gradient)
 * 
 * Reusable production-ready global background component for SkillUp.
 * Creates an ambient, hardware-accelerated animated gradient using OKLCH color-space
 * transitions across Violet, Indigo, Soft Blue, Lavender, and Cyan.
 * 
 * Sits strictly at z-index 0 with pointer-events-none so it never blocks
 * clicks, scrolling, modals, or dropdowns.
 */
export function SoftGradientBackground({
  animationDuration = 30,
  intensity = "subtle",
  className = "",
  ...props
}: SoftGradientBackgroundProps) {
  const intensityOpacity: Record<string, string> = {
    subtle: "opacity-40 dark:opacity-30",
    medium: "opacity-60 dark:opacity-50",
    vibrant: "opacity-80 dark:opacity-70",
  };

  const selectedOpacity = intensityOpacity[intensity] || intensityOpacity.subtle;

  return (
    <div
      className={`fixed inset-0 pointer-events-none overflow-hidden z-0 select-none [contain:strict] ${className}`}
      aria-hidden="true"
      {...props}
    >
      {/* Background Base Tint */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#f8faff] via-[#f3f5fc] to-[#eef2fb] dark:from-[#080c14] dark:via-[#0c101c] dark:to-[#080c14] transition-colors duration-500" />

      {/* Animated Soft OKLCH Ambient Orbs */}
      <div 
        className={`absolute inset-0 ${selectedOpacity} transition-opacity duration-700 transform-gpu [transform:translate3d(0,0,0)]`}
        style={{
          "--bg-duration": `${animationDuration}s`,
        } as React.CSSProperties}
      >
        {/* Top-Left Ambient Orb (Violet / Indigo) */}
        <div 
          className="absolute -top-[15%] -left-[10%] w-[55vw] h-[55vw] max-w-[750px] max-h-[750px] rounded-full blur-[80px] sm:blur-[110px] transform-gpu will-change-transform animate-soft-gradient-orb-1"
          style={{
            background: "radial-gradient(circle, oklch(0.72 0.18 280 / 0.45), oklch(0.68 0.2 260 / 0.25), transparent 70%)",
            animationDuration: `${animationDuration}s`,
          }}
        />

        {/* Top-Right Ambient Orb (Soft Blue / Sky / Cyan) */}
        <div 
          className="absolute -top-[10%] -right-[8%] w-[50vw] h-[50vw] max-w-[700px] max-h-[700px] rounded-full blur-[75px] sm:blur-[105px] transform-gpu will-change-transform animate-soft-gradient-orb-2"
          style={{
            background: "radial-gradient(circle, oklch(0.78 0.14 220 / 0.4), oklch(0.82 0.12 195 / 0.2), transparent 70%)",
            animationDuration: `${animationDuration * 1.2}s`,
          }}
        />

        {/* Center-Left Accent Orb (Lavender / Orchid) */}
        <div 
          className="absolute top-[35%] -left-[8%] w-[45vw] h-[45vw] max-w-[600px] max-h-[600px] rounded-full blur-[85px] sm:blur-[115px] transform-gpu will-change-transform animate-soft-gradient-orb-3"
          style={{
            background: "radial-gradient(circle, oklch(0.75 0.16 310 / 0.35), oklch(0.7 0.18 290 / 0.18), transparent 70%)",
            animationDuration: `${animationDuration * 0.9}s`,
          }}
        />

        {/* Bottom-Right Ambient Orb (Indigo / Cyan Bloom) */}
        <div 
          className="absolute -bottom-[15%] right-[2%] w-[55vw] h-[55vw] max-w-[750px] max-h-[750px] rounded-full blur-[90px] sm:blur-[120px] transform-gpu will-change-transform animate-soft-gradient-orb-4"
          style={{
            background: "radial-gradient(circle, oklch(0.7 0.18 265 / 0.4), oklch(0.76 0.14 235 / 0.22), transparent 70%)",
            animationDuration: `${animationDuration * 1.1}s`,
          }}
        />
      </div>

      {/* Ultra-subtle noise / texture overlay for premium depth (optional/hardware safe) */}
      <div 
        className="absolute inset-0 opacity-[0.015] dark:opacity-[0.025] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle at 50% 50%, #000 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
    </div>
  );
}

export default SoftGradientBackground;
