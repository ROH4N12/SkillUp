import React, { useState } from "react";
import { VideoPlayerWindow } from "../components/ui/VideoPlayerWindow";
import { DashboardCard } from "../components/DashboardCard";
import { Youtube, Play, CheckCircle2 } from "lucide-react";

/**
 * Standalone test page for VideoPlayerWindow.
 * No backend / auth / env vars needed — uses hardcoded mock data.
 * Access at: http://localhost:5173/test-video-player
 */

const MOCK_VIDEOS = [
  {
    videoId: "bMknfKXIFA8",
    title: "React Course - Beginner's Tutorial (2024)",
    thumbnail: "https://img.youtube.com/vi/bMknfKXIFA8/mqdefault.jpg",
    channel: "freeCodeCamp",
    completed: false,
  },
  {
    videoId: "SqcY0GlETPk",
    title: "React Tutorial for Beginners",
    thumbnail: "https://img.youtube.com/vi/SqcY0GlETPk/mqdefault.jpg",
    channel: "Programming with Mosh",
    completed: true,
  },
  {
    videoId: "CgkZ7MvWUAA",
    title: "React JS Full Course 2024",
    thumbnail: "https://img.youtube.com/vi/CgkZ7MvWUAA/mqdefault.jpg",
    channel: "Dave Gray",
    completed: false,
  },
  {
    videoId: "PkZNo7MFNFg",
    title: "Learn JavaScript - Full Course for Beginners",
    thumbnail: "https://img.youtube.com/vi/PkZNo7MFNFg/mqdefault.jpg",
    channel: "freeCodeCamp",
    completed: false,
  },
];

export default function TestVideoPlayer() {
  const [videos, setVideos] = useState(MOCK_VIDEOS);
  const [playerOpen, setPlayerOpen] = useState(false);
  const [playerIdx, setPlayerIdx] = useState(0);

  const toggleComplete = (videoId, currentlyCompleted) => {
    setVideos((prev) =>
      prev.map((v) =>
        v.videoId === videoId ? { ...v, completed: !currentlyCompleted } : v
      )
    );
  };

  const navigateVideo = (direction) => {
    setPlayerIdx((prev) => {
      if (direction === "prev") return Math.max(0, prev - 1);
      if (direction === "next") return Math.min(videos.length - 1, prev + 1);
      return prev;
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-6 sm:p-10">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            🎬 VideoPlayerWindow — Test Page
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Click any video card below to open the player window. No backend
            required.
          </p>
        </div>

        {/* Video List */}
        <DashboardCard
          title="Mock Course: React Fundamentals"
          subtitle="4 videos — click any to test the player"
        >
          <div className="space-y-3">
            {videos.map((video, idx) => (
              <div
                key={video.videoId}
                onClick={() => {
                  setPlayerIdx(idx);
                  setPlayerOpen(true);
                }}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer hover:shadow-md hover:-translate-y-0.5 ${
                  video.completed
                    ? "bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                    : "bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700"
                }`}
              >
                {/* Thumbnail */}
                <div className="flex-shrink-0 relative group">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-28 h-16 object-cover rounded-md"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 rounded-md flex items-center justify-center transition-colors">
                    <div className="w-9 h-9 rounded-full bg-white/90 dark:bg-white/80 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-4 h-4 text-gray-900 fill-gray-900 ml-0.5" />
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h5
                    className={`text-sm font-medium truncate ${
                      video.completed
                        ? "text-green-700 dark:text-green-400 line-through"
                        : "text-gray-900 dark:text-gray-100"
                    }`}
                  >
                    {video.title}
                  </h5>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {video.channel}
                  </p>
                </div>

                {/* Status */}
                <div className="flex-shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleComplete(video.videoId, video.completed);
                    }}
                    className={`p-1.5 rounded-md transition-all active:scale-90 ${
                      video.completed
                        ? "text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/40 hover:bg-green-200"
                        : "text-gray-400 hover:text-green-700 hover:bg-green-100 dark:hover:bg-green-900/20"
                    }`}
                    title={
                      video.completed
                        ? "Mark as incomplete"
                        : "Mark as completed"
                    }
                  >
                    <CheckCircle2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>

        <p className="text-xs text-center text-gray-400 dark:text-gray-500">
          Keyboard: <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-slate-700 rounded text-[10px] font-mono">ESC</kbd> close · 
          <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-slate-700 rounded text-[10px] font-mono ml-1">←</kbd>
          <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-slate-700 rounded text-[10px] font-mono ml-0.5">→</kbd> navigate
        </p>
      </div>

      {/* The component under test */}
      <VideoPlayerWindow
        video={videos[playerIdx]}
        isOpen={playerOpen}
        onClose={() => setPlayerOpen(false)}
        onToggleComplete={toggleComplete}
        onNavigate={navigateVideo}
        hasPrev={playerIdx > 0}
        hasNext={playerIdx < videos.length - 1}
        courseTitle="React Fundamentals (Mock Course)"
      />
    </div>
  );
}
