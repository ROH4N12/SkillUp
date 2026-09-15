import React from "react";

/**
 * Reusable GlassIcon component.
 * Renders icons inside a translucent frosted glass container with subtle inner highlights and accent borders.
 */
export function GlassIcon({
  icon: Icon,
  variant = "indigo",
  size = "md",
  className = "",
  children,
  ...props
}) {
  const variantStyles = {
    indigo: "bg-indigo-500/12 dark:bg-indigo-500/20 border-indigo-500/30 text-indigo-600 dark:text-indigo-400 shadow-indigo-500/10",
    purple: "bg-purple-500/12 dark:bg-purple-500/20 border-purple-500/30 text-purple-600 dark:text-purple-400 shadow-purple-500/10",
    emerald: "bg-emerald-500/12 dark:bg-emerald-500/20 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 shadow-emerald-500/10",
    amber: "bg-amber-500/12 dark:bg-amber-500/20 border-amber-500/30 text-amber-600 dark:text-amber-400 shadow-amber-500/10",
    cyan: "bg-cyan-500/12 dark:bg-cyan-500/20 border-cyan-500/30 text-cyan-600 dark:text-cyan-400 shadow-cyan-500/10",
    rose: "bg-rose-500/12 dark:bg-rose-500/20 border-rose-500/30 text-rose-600 dark:text-rose-400 shadow-rose-500/10",
  };

  const sizeStyles = {
    sm: "w-9 h-9 rounded-xl p-1.5",
    md: "w-12 h-12 rounded-2xl p-2.5",
    lg: "w-14 h-14 rounded-2xl p-3",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-7 h-7",
  };

  return (
    <div
      className={`
        backdrop-blur-md border shadow-xs flex items-center justify-center flex-shrink-0
        transition-transform duration-200 group-hover:scale-105
        ${variantStyles[variant] || variantStyles.indigo}
        ${sizeStyles[size] || sizeStyles.md}
        ${className}
      `}
      {...props}
    >
      {Icon ? <Icon className={`${iconSizes[size] || iconSizes.md}`} /> : children}
    </div>
  );
}
