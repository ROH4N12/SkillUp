import React from "react";

export function DashboardCard({
  title,
  subtitle,
  children,
  className = "",
  action,
  interactive = false,
  onClick
}) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700/80 p-6
        transition-all duration-200
        ${interactive || onClick ? "card-interactive cursor-pointer hover:border-indigo-200 dark:hover:border-slate-600 active:scale-[0.985] active:shadow-xs select-none" : "shadow-sm"}
        ${className}
      `}

    >
      {(title || action) && (
        <div className="flex items-center justify-between mb-4">
          <div>
            {title && <h3 className="font-semibold text-gray-900 dark:text-gray-100">{title}</h3>}
            {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

