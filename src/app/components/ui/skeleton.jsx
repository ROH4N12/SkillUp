import React from "react";

export function Skeleton({ className = "", rounded = "rounded-lg" }) {
  return (
    <div
      className={`skeleton-shimmer ${rounded} ${className}`}
      aria-hidden="true"
    />
  );
}

export function SkeletonMetrics({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-gray-100 dark:border-slate-700/60 shadow-sm space-y-3"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-10 rounded-lg" />
          </div>
          <Skeleton className="h-7 w-16" />
          <Skeleton className="h-3 w-28" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonCourse({ count = 3 }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-gray-100 dark:border-slate-700/60 shadow-sm space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="space-y-2 flex-1 max-w-md">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-3 w-32" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-20 rounded-lg" />
              <Skeleton className="h-8 w-28 rounded-lg" />
            </div>
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonList({ rows = 4 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="p-4 bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700/60 flex items-center justify-between"
        >
          <div className="flex items-center gap-3 flex-1">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-1.5 flex-1 max-w-xs">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonChart({ height = "h-64" }) {
  return (
    <div className={`bg-white dark:bg-slate-800 rounded-xl p-6 border border-gray-100 dark:border-slate-700/60 shadow-sm ${height} flex flex-col justify-between`}>
      <div className="flex justify-between items-center mb-4">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-4 w-20" />
      </div>
      <Skeleton className="flex-1 w-full rounded-lg" />
    </div>
  );
}
