import React from "react";

export function ProgressBar({ 
  value = 0, 
  max = 100, 
  label, 
  showPercentage = true,
  variant = "default",
  size = "md"
}) {
  const safeValue = Number.isFinite(value) ? value : 0;
  const safeMax = max > 0 ? max : 100;
  const percentage = Math.max(0, Math.min((safeValue / safeMax) * 100, 100));
  
  const variantColors = {
    default: "bg-gradient-to-r from-indigo-500 to-purple-600 shadow-sm shadow-purple-500/20",
    success: "bg-gradient-to-r from-emerald-500 to-green-600 shadow-sm shadow-green-500/20",
    warning: "bg-gradient-to-r from-amber-500 to-yellow-500",
    danger: "bg-gradient-to-r from-rose-500 to-red-600",
  };

  const sizeClasses = {
    sm: "h-2",
    md: "h-2.5",
    lg: "h-3.5",
  };

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && (
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
              {label}
            </span>
          )}
          {showPercentage && (
            <span className="text-xs font-semibold text-gray-900 dark:text-gray-100 tabular-nums">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div className={`w-full bg-gray-200/80 dark:bg-slate-700/80 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        <div
          className={`${variantColors[variant] || variantColors.default} ${sizeClasses[size]} rounded-full transition-[width] duration-500 ease-out will-change-[width]`}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={Math.round(percentage)}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}

