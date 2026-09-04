import React from "react";
import { Loader2 } from "lucide-react";

export function Button({
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
    inline-flex items-center justify-center font-medium rounded-lg
    transition-all duration-150 ease-out select-none
    focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:ring-offset-1
    active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100
  `;

  const variantStyles = {
    primary: "bg-purple-600 text-white hover:bg-purple-700 shadow-sm hover:shadow-purple-500/20 hover:-translate-y-0.5",
    secondary: "bg-gray-100 dark:bg-slate-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-700 border border-gray-200 dark:border-slate-700 hover:-translate-y-0.5",
    outline: "border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800 hover:-translate-y-0.5",
    ghost: "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800",
    success: "bg-green-600 text-white hover:bg-green-700 shadow-sm hover:shadow-green-500/20 hover:-translate-y-0.5",
    danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm hover:shadow-red-500/20 hover:-translate-y-0.5",
  };

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-5 py-2.5 text-base gap-2.5",
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
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-current" />
          <span>{loadingText || children}</span>
        </>
      ) : (
        <>
          {Icon && <Icon className="w-4 h-4 flex-shrink-0" />}
          {children}
        </>
      )}
    </button>
  );
}
