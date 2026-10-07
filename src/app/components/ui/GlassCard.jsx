import React from "react";

/**
 * Reusable GlassCard component implementing a multi-depth frosted glass design system.
 * 
 * Variants:
 * - "subtle": Low opacity, softer blur for secondary surfaces & headers.
 * - "default": Standard translucent surface with soft inner highlights and borders.
 * - "elevated": Enhanced glass depth, subtle accent border glow, and increased shadow for primary focal points.
 */
export function GlassCard({
  variant = "default",
  hover = false,
  className = "",
  children,
  onClick,
  title,
  subtitle,
  action,
  ...props
}) {
  const variantClasses = {
    subtle: "glass-subtle",
    default: "glass-default",
    elevated: "glass-elevated",
  };

  const selectedVariantClass = variantClasses[variant] || variantClasses.default;
  const hoverClass = hover || onClick ? "glass-card-hover" : "";

  return (
    <div
      onClick={onClick}
      className={`
        ${selectedVariantClass}
        ${hoverClass}
        rounded-[22px] sm:rounded-[26px] p-5 sm:p-6.5
        relative overflow-hidden
        ${onClick ? "cursor-pointer select-none" : ""}
        ${className}
      `}
      {...props}
    >
      {(title || action) && (
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            {title && (
              <h3 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs sm:text-sm font-medium text-gray-500 dark:text-slate-400 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
