import React, { useState, useEffect, useRef, useCallback } from "react";
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
  Sparkles,
  CheckCheck,
} from "lucide-react";

/**
 * VideoPlayerWindow — A rich, frosted glass modal panel that embeds a YouTube player,
 * displays parsed video metadata, detects when video playback ends to automatically mark
 * the lesson complete, and includes the manual toggle button alongside it.
 *
 * Props:
 *  - video            : { videoId, title, thumbnail, channel, completed }
 *  - isOpen           : boolean
 *  - onClose          : () => void
 *  - onToggleComplete : (videoId, currentlyCompleted) => void
 *  - onNavigate       : (direction: 'prev' | 'next') => void   (optional)
 *  - hasPrev / hasNext: booleans for navigation arrows        (optional)
 *  - courseTitle      : string (the parent course title for context)
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
  const [autoCompletedNotice, setAutoCompletedNotice] = useState(false);

  const iframeRef = useRef(null);
  const playerInstanceRef = useRef(null);
  const hasAutoCompletedRef = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Ensure YouTube IFrame API script is available
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.YT && window.YT.Player) return;

    if (!document.getElementById("yt-iframe-api-script")) {
      const script = document.createElement("script");
      script.id = "yt-iframe-api-script";
      script.src = "https://www.youtube.com/iframe_api";
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  // Reset video player states when switching to a different video
  useEffect(() => {
    setIframeLoaded(false);
    setAutoCompletedNotice(false);
    hasAutoCompletedRef.current = false;
  }, [video?.videoId]);

  // Handler invoked when the video reaches the end
  const handleVideoEnded = useCallback(() => {
    if (!video) return;

    if (!video.completed && !hasAutoCompletedRef.current) {
      hasAutoCompletedRef.current = true;
      setAutoCompletedNotice(true);
      if (typeof onToggleComplete === "function") {
        // onToggleComplete expects (videoId, currentlyCompleted)
        // passing false toggles it to true (completed)
        onToggleComplete(video.videoId, false);
      }
    }
  }, [video, onToggleComplete]);

  // Set up official YouTube Player API listener
  useEffect(() => {
    if (!isOpen || !video?.videoId) return;

    let isSubscribed = true;

    const setupPlayer = () => {
      if (!isSubscribed || !iframeRef.current || !window.YT || !window.YT.Player) return;

      try {
        if (playerInstanceRef.current && typeof playerInstanceRef.current.destroy === "function") {
          try {
            playerInstanceRef.current.destroy();
          } catch (_) {}
        }

        playerInstanceRef.current = new window.YT.Player(iframeRef.current, {
          events: {
            onStateChange: (event) => {
              // 0 represents YT.PlayerState.ENDED
              if (event.data === 0) {
                handleVideoEnded();
              }
            },
          },
        });
      } catch (err) {
        console.debug("YouTube player API initialization notice:", err);
      }
    };

    if (window.YT && window.YT.Player) {
      setupPlayer();
    } else {
      const intervalId = setInterval(() => {
        if (window.YT && window.YT.Player) {
          clearInterval(intervalId);
          setupPlayer();
        }
      }, 400);

      return () => {
        isSubscribed = false;
        clearInterval(intervalId);
        if (playerInstanceRef.current && typeof playerInstanceRef.current.destroy === "function") {
          try {
            playerInstanceRef.current.destroy();
          } catch (_) {}
        }
      };
    }

    return () => {
      isSubscribed = false;
      if (playerInstanceRef.current && typeof playerInstanceRef.current.destroy === "function") {
        try {
          playerInstanceRef.current.destroy();
        } catch (_) {}
      }
    };
  }, [isOpen, video?.videoId, iframeLoaded, handleVideoEnded]);

  // Secondary layer: window message listener for YouTube postMessage events
  useEffect(() => {
    if (!isOpen || !video?.videoId) return;

    const handleMessage = (event) => {
      try {
        const payload =
          typeof event.data === "string" ? JSON.parse(event.data) : event.data;
        if (!payload) return;

        // Both direct onStateChange and infoDelivery emit player state 0 when ended
        if (
          (payload.event === "onStateChange" && payload.info === 0) ||
          (payload.event === "infoDelivery" &&
            payload.info &&
            payload.info.playerState === 0)
        ) {
          handleVideoEnded();
        }
      } catch (_) {
        // Ignore non-JSON postMessage payloads from third-party scripts or extensions
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [isOpen, video?.videoId, handleVideoEnded]);

  // When iframe loads, notify it to start listening for postMessage events
  const handleIframeLoaded = () => {
    setIframeLoaded(true);
    try {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({
            event: "listening",
            id: `yt-player-${video.videoId}`,
          }),
          "*"
        );
      }
    } catch (_) {}
  };

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
  const currentOrigin =
    typeof window !== "undefined" && window.location.origin
      ? window.location.origin
      : "";

  return createPortal(
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Frosted Glass Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/60 dark:bg-black/75 backdrop-blur-md modal-backdrop-enter transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Glassmorphic Window Panel */}
      <div
        className="relative w-full max-w-4xl glass-elevated rounded-[24px] sm:rounded-[28px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.2)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.1)] border border-white/60 dark:border-white/10 z-10 modal-panel-enter overflow-hidden backdrop-blur-2xl"
        role="dialog"
        aria-modal="true"
      >
        {/* ── Top Bar with Frosted Glass ── */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 sm:py-4 border-b border-black/5 dark:border-white/10 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500/20 to-red-600/30 dark:from-rose-500/25 dark:to-red-600/35 border border-rose-500/30 dark:border-rose-400/20 flex items-center justify-center flex-shrink-0 shadow-xs backdrop-blur-sm">
              <Youtube className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-gray-900 dark:text-white truncate tracking-tight">
                {video.title}
              </h3>
              {courseTitle && (
                <p className="text-xs font-medium text-gray-500 dark:text-slate-400 truncate mt-0.5">
                  {courseTitle}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Navigation Arrows with Glass Hover */}
            {onNavigate && (
              <div className="flex items-center gap-1 mr-1">
                <button
                  onClick={() => hasPrev && onNavigate("prev")}
                  disabled={!hasPrev}
                  className="p-2 rounded-xl text-gray-600 dark:text-gray-300 bg-white/40 dark:bg-white/5 hover:bg-white/70 dark:hover:bg-white/10 border border-white/50 dark:border-white/10 backdrop-blur-md transition-all active:scale-90 disabled:opacity-30 disabled:pointer-events-none shadow-xs"
                  title="Previous video (←)"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => hasNext && onNavigate("next")}
                  disabled={!hasNext}
                  className="p-2 rounded-xl text-gray-600 dark:text-gray-300 bg-white/40 dark:bg-white/5 hover:bg-white/70 dark:hover:bg-white/10 border border-white/50 dark:border-white/10 backdrop-blur-md transition-all active:scale-90 disabled:opacity-30 disabled:pointer-events-none shadow-xs"
                  title="Next video (→)"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white bg-white/40 dark:bg-white/5 hover:bg-white/70 dark:hover:bg-white/10 border border-white/50 dark:border-white/10 rounded-xl transition-all backdrop-blur-md active:scale-90 shadow-xs"
              aria-label="Close video player"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── YouTube Embed ── */}
        <div className="relative w-full bg-black/90 shadow-inner" style={{ aspectRatio: "16/9" }}>
          {/* Loading skeleton */}
          {!iframeLoaded && (
            <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md flex items-center justify-center z-10">
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shadow-lg backdrop-blur-lg">
                  <Play className="w-8 h-8 text-white/70 fill-white/70" />
                </div>
                <div className="flex items-center gap-2 text-white/60 text-sm font-medium">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-indigo-400 rounded-full animate-spin" />
                  Loading video...
                </div>
              </div>
            </div>
          )}
          <iframe
            key={video.videoId}
            id={`yt-player-${video.videoId}`}
            ref={iframeRef}
            src={`https://www.youtube.com/embed/${video.videoId}?enablejsapi=1&origin=${encodeURIComponent(
              currentOrigin
            )}&rel=0&modestbranding=1`}
            title={video.title}
            className="absolute inset-0 w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            onLoad={handleIframeLoaded}
          />
        </div>

        {/* ── Video Info & Actions Panel with Frosted Glass ── */}
        <div className="px-5 sm:px-6 py-4 sm:py-5 space-y-4 bg-white/30 dark:bg-slate-900/30 backdrop-blur-xl">
          {/* Title & Meta Row */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="min-w-0 flex-1 space-y-2.5">
              <h4 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white leading-snug tracking-tight">
                {video.title}
              </h4>
              <div className="flex flex-wrap items-center gap-2">
                {video.channel && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-700 dark:text-gray-200 bg-white/60 dark:bg-white/10 border border-white/80 dark:border-white/15 px-3 py-1 rounded-full shadow-xs backdrop-blur-md">
                    <User className="w-3 h-3 text-indigo-500" />
                    {video.channel}
                  </span>
                )}
                {titleParts.topic && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-500/15 border border-indigo-500/30 px-3 py-1 rounded-full shadow-xs backdrop-blur-md">
                    {titleParts.topic}
                  </span>
                )}
                {titleParts.level && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-700 dark:text-purple-300 bg-purple-500/15 border border-purple-500/30 px-3 py-1 rounded-full shadow-xs backdrop-blur-md">
                    {titleParts.level}
                  </span>
                )}
                {titleParts.year && (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300 bg-white/60 dark:bg-white/10 border border-white/80 dark:border-white/15 px-3 py-1 rounded-full shadow-xs backdrop-blur-md">
                    <Clock className="w-3 h-3 text-purple-500" />
                    {titleParts.year}
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons: Open on YouTube + Manual Mark Complete Button alongside */}
            <div className="flex items-center gap-2.5 flex-shrink-0 sm:pt-0.5">
              <a
                href={`https://www.youtube.com/watch?v=${video.videoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold text-gray-700 dark:text-gray-200 bg-white/60 dark:bg-white/10 border border-white/80 dark:border-white/15 rounded-xl hover:bg-white/90 dark:hover:bg-white/20 hover:-translate-y-0.5 shadow-xs backdrop-blur-md transition-all active:scale-95"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Open on YouTube
              </a>
              <button
                onClick={() =>
                  onToggleComplete(video.videoId, video.completed)
                }
                className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-xl transition-all active:scale-95 border backdrop-blur-md hover:-translate-y-0.5 ${
                  video.completed
                    ? "text-white bg-gradient-to-r from-emerald-600 to-green-600 border-white/30 hover:from-emerald-500 hover:to-green-500 shadow-md shadow-emerald-500/25"
                    : "text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 border-emerald-500/30 hover:bg-emerald-500/25 shadow-xs"
                }`}
                title={
                  video.completed
                    ? "Click to mark as incomplete"
                    : "Click to mark as complete"
                }
              >
                <CheckCircle2 className="w-4 h-4" />
                {video.completed ? "Completed ✓" : "Mark Complete"}
              </button>
            </div>
          </div>

          {/* Celebratory Auto-Completed Banner (Fires automatically when video reaches end) */}
          {autoCompletedNotice && (
            <div className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500/20 via-teal-500/15 to-emerald-500/10 border border-emerald-500/40 text-emerald-900 dark:text-emerald-200 shadow-sm backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 animate-pulse" />
                </div>
                <div className="text-xs">
                  <span className="font-bold">Lesson Finished!</span>
                  <span className="hidden sm:inline"> Automatically marked as completed.</span>
                </div>
              </div>
              {hasNext && onNavigate && (
                <button
                  onClick={() => onNavigate("next")}
                  className="inline-flex items-center gap-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 rounded-lg shadow-xs transition-all active:scale-95 flex-shrink-0"
                >
                  <span>Next Lesson</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          {/* Frosted Status Bar */}
          <div
            className={`flex items-center justify-between gap-2.5 px-4 py-3 rounded-xl text-xs font-medium border backdrop-blur-md transition-all ${
              video.completed
                ? "bg-emerald-500/15 dark:bg-emerald-950/30 border-emerald-500/30 text-emerald-800 dark:text-emerald-300 shadow-xs"
                : "bg-indigo-500/15 dark:bg-indigo-950/30 border-indigo-500/30 text-indigo-800 dark:text-indigo-300 shadow-xs"
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {video.completed ? (
                <>
                  <CheckCheck className="w-4 h-4 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span className="truncate">
                    You've completed this video lesson! Great progress on your learning path.
                  </span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 flex-shrink-0 text-indigo-600 dark:text-indigo-400" />
                  <span className="truncate">
                    Watch the video above. It will automatically mark complete when finished, or click "Mark Complete" anytime.
                  </span>
                </>
              )}
            </div>

            {video.completed && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 flex-shrink-0 border border-emerald-500/20">
                Watched
              </span>
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

