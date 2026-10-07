import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  CheckCircle2,
  Youtube,
  ExternalLink,
  Clock,
  User,
  ChevronLeft,
  ChevronRight,
  Play,
} from "lucide-react";

/**
 * VideoPlayerWindow — A rich, modal-style panel that embeds a YouTube player,
 * shows extracted video metadata, and includes a mark-complete toggle.
 *
 * Props:
 *  - video          : { videoId, title, thumbnail, channel, completed }
 *  - isOpen         : boolean
 *  - onClose        : () => void
 *  - onToggleComplete : (videoId, currentlyCompleted) => void
 *  - onNavigate     : (direction: 'prev' | 'next') => void   (optional)
 *  - hasPrev / hasNext : booleans for navigation arrows        (optional)
 *  - courseTitle     : string (the parent course title for context)
 */
export function VideoPlayerWindow({
  video,
  isOpen,
  onClose,
  onToggleComplete,
  onNavigate,
  hasPrev = false,
  hasNext = false,
  courseTitle = "",
}) {
  const [mounted, setMounted] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset iframe loaded state when video changes
  useEffect(() => {
    setIframeLoaded(false);
  }, [video?.videoId]);

  // ESC key & scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && hasPrev && onNavigate) onNavigate("prev");
      if (e.key === "ArrowRight" && hasNext && onNavigate) onNavigate("next");
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose, hasPrev, hasNext, onNavigate]);

  if (!isOpen || !mounted || !video) return null;

  // Extract useful info from the video title
  const titleParts = parseVideoTitle(video.title);

  return createPortal(
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 dark:bg-black/80 modal-backdrop-enter transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Window Panel */}
      <div
        className="relative w-full max-w-4xl bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 z-10 modal-panel-enter overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* ── Top Bar ── */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 dark:border-slate-700 bg-gray-50/80 dark:bg-slate-800/90">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-900/40 flex items-center justify-center flex-shrink-0">
              <Youtube className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                {video.title}
              </h3>
              {courseTitle && (
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {courseTitle}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Navigation Arrows */}
            {onNavigate && (
              <div className="flex items-center gap-1 mr-1">
                <button
                  onClick={() => hasPrev && onNavigate("prev")}
                  disabled={!hasPrev}
                  className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Previous video (←)"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => hasNext && onNavigate("next")}
                  disabled={!hasNext}
                  className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Next video (→)"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              aria-label="Close video player"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── YouTube Embed ── */}
        <div className="relative w-full bg-black" style={{ aspectRatio: "16/9" }}>
          {/* Loading skeleton */}
          {!iframeLoaded && (
            <div className="absolute inset-0 bg-gray-900 flex items-center justify-center z-10">
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                  <Play className="w-8 h-8 text-white/60 fill-white/60" />
                </div>
                <div className="flex items-center gap-2 text-white/50 text-sm">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white/70 rounded-full animate-spin" />
                  Loading video...
                </div>
              </div>
            </div>
          )}
          <iframe
            src={`https://www.youtube.com/embed/${video.videoId}?rel=0&modestbranding=1`}
            title={video.title}
            className="absolute inset-0 w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            onLoad={() => setIframeLoaded(true)}
          />
        </div>

        {/* ── Video Info & Actions Panel ── */}
        <div className="px-5 py-4 space-y-4">
          {/* Title & Meta Row */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="min-w-0 flex-1 space-y-2">
              <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 leading-snug">
                {video.title}
              </h4>
              <div className="flex flex-wrap items-center gap-3">
                {video.channel && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 px-2.5 py-1 rounded-full">
                    <User className="w-3 h-3" />
                    {video.channel}
                  </span>
                )}
                {titleParts.topic && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/30 px-2.5 py-1 rounded-full">
                    {titleParts.topic}
                  </span>
                )}
                {titleParts.level && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-900/30 px-2.5 py-1 rounded-full">
                    {titleParts.level}
                  </span>
                )}
                {titleParts.year && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-700 px-2.5 py-1 rounded-full">
                    <Clock className="w-3 h-3" />
                    {titleParts.year}
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 flex-shrink-0 sm:pt-0.5">
              <a
                href={`https://www.youtube.com/watch?v=${video.videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition-all active:scale-95"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open on YouTube
              </a>
              <button
                onClick={() =>
                  onToggleComplete(video.videoId, video.completed)
                }
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all active:scale-95 border ${
                  video.completed
                    ? "text-white bg-green-600 border-green-700 hover:bg-green-700 shadow-sm shadow-green-500/20"
                    : "text-green-700 dark:text-green-300 bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/50"
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                {video.completed ? "Completed ✓" : "Mark Complete"}
              </button>
            </div>
          </div>

          {/* Status Bar */}
          <div
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-medium border transition-colors ${
              video.completed
                ? "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300"
                : "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
            }`}
          >
            {video.completed ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  You've marked this video as completed. Great progress!
                </span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>
                  Watch the video and mark it complete to track your progress.
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

/**
 * Extract structured info from a YouTube video title.
 * e.g. "React Tutorial for Beginners - Full Course (2024)" →
 *   { topic: "React", level: "Beginners", year: "2024" }
 */
function parseVideoTitle(title = "") {
  const result = { topic: null, level: null, year: null };

  // Extract year like (2024) or 2024
  const yearMatch = title.match(/\b(20[2-3]\d)\b/);
  if (yearMatch) result.year = yearMatch[1];

  // Extract level keywords
  const levelMatch = title.match(
    /\b(beginner|beginners|intermediate|advanced|full course|crash course|tutorial)\b/i
  );
  if (levelMatch) {
    const raw = levelMatch[1].toLowerCase();
    if (raw.includes("beginner")) result.level = "Beginner";
    else if (raw === "intermediate") result.level = "Intermediate";
    else if (raw === "advanced") result.level = "Advanced";
    else if (raw === "full course") result.level = "Full Course";
    else if (raw === "crash course") result.level = "Crash Course";
    else if (raw === "tutorial") result.level = "Tutorial";
  }

  // Extract main topic — take text before common separators
  const topicMatch = title.match(
    /^(.+?)(?:\s*[-–—:|]\s*|\s+(?:for|full|crash|tutorial|course|beginner|in\s+\d))/i
  );
  if (topicMatch) {
    result.topic = topicMatch[1].trim().replace(/\s+/g, " ");
    // Cap length
    if (result.topic.length > 40) result.topic = result.topic.slice(0, 37) + "...";
  }

  return result;
}

export default VideoPlayerWindow;
