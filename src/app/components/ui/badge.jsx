import React from "react";

export function Badge({
  children,
  variant = "default",
  className = "",
  ...props
}) {
  const variants = {
    default: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50",
    outline: "border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300",
    success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/50",
    warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800/50",
    danger: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200/50 dark:border-rose-800/50",
  };

  const selectedVariant = variants[variant] || variants.default;

  return (
    <span
      className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full transition-colors ${selectedVariant} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
