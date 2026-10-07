import React from "react";
import { Loader2 } from "lucide-react";

/**
 * Liquid Glass Button component.
 * Features translucent layering, inner specular highlights, subtle drop shadow,
 * smooth hover elevation, and pressed active states.
 */
export function GlassButton({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  loading = false,
  loadingText,
  disabled = false,
  className = "",
  onClick,
  icon: Icon,
  ...props
}) {
  const baseStyles = `
    relative inline-flex items-center justify-center font-bold select-none
    backdrop-blur-md transition-all duration-200 ease-out
    focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:ring-offset-1
    active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100
    overflow-hidden
  `;

  const variantStyles = {
    // Liquid purple gradient with inner gloss highlight and glowing shadow
    primary: `
      bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white
      border border-white/30 dark:border-white/20
      shadow-[0_8px_20px_-4px_rgba(99,102,241,0.45),inset_0_1px_1px_0_rgba(255,255,255,0.4)]
      hover:from-indigo-500 hover:to-purple-500 hover:shadow-[0_12px_24px_-4px_rgba(99,102,241,0.55),inset_0_1px_1.5px_0_rgba(255,255,255,0.55)]
      hover:-translate-y-0.5
    `,
    // Subtle frosted glass pill button
    subtle: `
      glass-pill text-indigo-700 dark:text-indigo-300
      border border-indigo-300/40 dark:border-indigo-500/30
      shadow-xs hover:border-indigo-400/60 dark:hover:border-indigo-400/50
      hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 hover:-translate-y-0.5
    `,
    // Ghost glass
    ghost: `
      text-gray-700 dark:text-gray-200 hover:glass-pill
      hover:text-indigo-600 dark:hover:text-indigo-400
    `,
    // Secondary frosted glass
    secondary: `
      glass-default text-gray-900 dark:text-white
      border border-white/70 dark:border-white/10
      shadow-sm hover:shadow-md hover:-translate-y-0.5
    `,
  };

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs gap-1.5 rounded-xl",
    md: "px-5 py-2.5 text-sm gap-2 rounded-xl",
    lg: "px-6 py-3 text-base gap-2.5 rounded-2xl",
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`
        ${baseStyles}
        ${variantStyles[variant] || variantStyles.primary}
        ${sizeStyles[size] || sizeStyles.md}
        ${className}
      `}
      {...props}
    >
      {/* Subtle specular glass highlight reflection line on top edge */}
      <span 
        className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/50 to-transparent pointer-events-none" 
        aria-hidden="true" 
      />

      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-current" />
          <span>{loadingText || children}</span>
        </>
      ) : (
        <>
          {children}
          {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
        </>
      )}
    </button>
  );
}
