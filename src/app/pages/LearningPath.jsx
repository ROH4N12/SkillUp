import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import { DashboardCard } from "../components/DashboardCard";
import { ProgressBar } from "../components/ProgressBar";
import { 
  Target, 
  Clock, 
  CheckCircle2, 
  Circle, 
  Play,
  BookOpen, 
  Award, 
  Sparkles, 
  AlertCircle, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink, 
  Youtube,
  Check,
  X,
  RotateCcw,
  Trash2,
  Loader2,
  Cpu,
  Layers
} from "lucide-react";

import { useFetch, apiCall } from "../hooks/useFetch";
import { useToast } from "../contexts/ToastContext";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { CertificateModal } from "../components/ui/CertificateModal";
import { Skeleton, SkeletonMetrics, SkeletonChart, SkeletonCourse } from "../components/ui/Skeleton";
import { AccordionContent } from "../components/ui/AccordionContent";
import { AlertDialog } from "../components/ui/HeroUIAlertDialog";
import { VideoPlayerWindow } from "../components/ui/VideoPlayerWindow";


export default function LearningPath() {
  const { data: pathData, loading, refetch, mutate: mutatePath } = useFetch('/api/learner/path');
  const { data: dashboardData, refetch: refetchDashboard } = useFetch('/api/learner/dashboard');
  const toast = useToast();

  const [showCertificate, setShowCertificate] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [synthesizingGoal, setSynthesizingGoal] = useState('');
  const [synthProgress, setSynthProgress] = useState(12);
  const [synthStepIndex, setSynthStepIndex] = useState(0);
  const synthIntervalRef = useRef(null);

  const [genError, setGenError] = useState('');
  const [formData, setFormData] = useState({ goal: '' });
  const [actionLoadingCourse, setActionLoadingCourse] = useState(null);

  // Video expansion state
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [courseVideos, setCourseVideos] = useState({});
  const [loadingVideos, setLoadingVideos] = useState(null);

  // Video Player Window state
  const [playerOpen, setPlayerOpen] = useState(false);
  const [playerCourseId, setPlayerCourseId] = useState(null);
  const [playerVideoIdx, setPlayerVideoIdx] = useState(0);

  const synthesisSteps = [
    {
      shortTitle: "Analyzing Goal",
      title: "Analyzing Target Goal & Technical Prerequisites",
      detail: "Deconstructing career trajectory, foundational dependencies, and core skill requirements..."
    },
    {
      shortTitle: "Semantic Search",
      title: "Querying Semantic Knowledge Embeddings",
      detail: "Scoring comprehensive course catalog with cosine vector similarity across technical domains..."
    },
    {
      shortTitle: "Structuring Roadmap",
      title: "Sequencing Multi-Stage Curriculum",
      detail: "Organizing tailored modules into Foundation, Core Skills, and Advanced Topics stages..."
    },
    {
      shortTitle: "Curating Videos",
      title: "Curating Verified Video Masterclasses",
      detail: "Linking active YouTube lessons, structured playlists, and hands-on technical labs..."
    },
    {
      shortTitle: "Finalizing Path",
      title: "Synthesizing Custom Learning Path",
      detail: "Connecting milestones and deploying your personalized interactive roadmap..."
    }
  ];

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (synthIntervalRef.current) clearInterval(synthIntervalRef.current);
    };
  }, []);

  const handleMarkComplete = async (courseId) => {
    setActionLoadingCourse(courseId);

    // 1. Optimistic local update so UI immediately updates without page jumping or scrolling
    mutatePath(prev => {
      if (!prev || !prev.stages) return prev;
      return {
        ...prev,
        stages: prev.stages.map(stage => ({
          ...stage,
          courses: (stage.courses || []).map(c =>
            c._id === courseId ? { ...c, status: "Completed", progress: 100 } : c
          )
        }))
      };
    });

    toast.success("Course marked as complete!");

    try {
      await apiCall(`/api/learner/complete/${courseId}`, 'PUT');
      await apiCall('/api/activity/log', 'POST', { activity: 'course_completed' });
      // 2. Silent refetch - keeps exact scroll position, never triggers loading unmount!
      await refetch({ silent: true });
      refetchDashboard({ silent: true });
    } catch (err) {
      console.error(err);
      toast.error("Failed to update course status. Reverting changes.");
      refetch({ silent: true });
    } finally {
      setActionLoadingCourse(null);
    }
  };

  const handleResetProgress = async () => {
    try {
      await apiCall('/api/learner/progress/reset', 'DELETE');
      toast.info("Progress has been reset");
      refetch({ silent: true });
      refetchDashboard({ silent: true });
    } catch (err) {
      console.error(err);
      toast.error("Failed to reset progress");
    }
  };

  const handleGeneratePath = async (e) => {
    e.preventDefault();
    const targetGoal = formData.goal.trim();
    if (!targetGoal) return;

    // 1. Immediately close modal so user is brought back to the page
    setShowModal(false);
    setFormData({ goal: '' });
    setGenError('');

    // 2. Activate on-page animated synthesis state
    setIsSynthesizing(true);
    setSynthesizingGoal(targetGoal);
    setSynthProgress(14);
    setSynthStepIndex(0);

    // 3. Clear any existing timer
    if (synthIntervalRef.current) clearInterval(synthIntervalRef.current);

    // 4. Smoothly advance progress and stages over the ~10-14 seconds generation interval
    const startTime = Date.now();
    synthIntervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      
      const calculatedStep = Math.min(
        synthesisSteps.length - 1,
        Math.floor(elapsed / 2500)
      );
      setSynthStepIndex(calculatedStep);

      setSynthProgress(prev => {
        if (prev >= 92) return 92;
        const increment = Math.max(0.4, (92 - prev) * 0.08);
        return Math.min(92, prev + increment);
      });
    }, 400);

    try {
      const result = await apiCall('/api/learner/generate-path', 'POST', {
        goal: targetGoal,
        level: 'Beginner',
        knownSkills: []
      });

      if (synthIntervalRef.current) clearInterval(synthIntervalRef.current);

      if (result && result.path) {
        setSynthProgress(100);
        setSynthStepIndex(synthesisSteps.length - 1);

        const formattedPath = {
          ...result.path,
          stages: (result.path.stages || []).map(stage => ({
            ...stage,
            courses: (stage.courses || []).map(c => ({
              ...c,
              status: c.status || 'Not Started',
              progress: c.progress || 0
            }))
          }))
        };

        // Brief smooth transition to 100% completion before revealing the new path
        setTimeout(() => {
          mutatePath(formattedPath);
          setIsSynthesizing(false);
          setSynthesizingGoal('');
          toast.success(`Personalized roadmap for "${targetGoal}" ready!`);
          refetch({ silent: true });
          refetchDashboard({ silent: true });
        }, 550);
      } else {
        setIsSynthesizing(false);
        setSynthesizingGoal('');
        toast.error(result?.message || 'Unable to generate learning path for this goal.');
      }
    } catch (err) {
      if (synthIntervalRef.current) clearInterval(synthIntervalRef.current);
      setIsSynthesizing(false);
      setSynthesizingGoal('');
      toast.error('Failed to generate path. Please try again.');
    }
  };

  // ── Video helpers ───────────────────────────────────────────────────
  const toggleVideos = async (courseId) => {
    if (expandedCourse === courseId) {
      setExpandedCourse(null);
      return;
    }
    setExpandedCourse(courseId);

    // Fetch videos if not already cached locally
    if (!courseVideos[courseId]) {
      setLoadingVideos(courseId);
      try {
        const data = await apiCall(`/api/learner/videos/${courseId}`);
        setCourseVideos(prev => ({ ...prev, [courseId]: data.videos }));
      } catch (err) {
        console.error('Failed to load videos:', err);
      } finally {
        setLoadingVideos(null);
      }
    }
  };

  const toggleVideoComplete = async (courseId, videoId, currentlyCompleted) => {
    const nextCompleted = !currentlyCompleted;

    // Optimistic video update
    setCourseVideos(prev => ({
      ...prev,
      [courseId]: (prev[courseId] || []).map(v =>
        v.videoId === videoId ? { ...v, completed: nextCompleted } : v
      ),
    }));

    toast.info(nextCompleted ? "Video marked as watched" : "Video marked as unwatched");

    try {
      await apiCall('/api/learner/videos/complete', 'PUT', {
        courseId,
        videoId,
        completed: nextCompleted,
      });

      if (nextCompleted) {
        await apiCall('/api/activity/log', 'POST', { activity: 'video_completed' });
      }

      // Silent refetch to update progress bars without scrolling or flashing
      refetch({ silent: true });
      refetchDashboard({ silent: true });
    } catch (err) {
      console.error('Failed to toggle video:', err);
      toast.error("Failed to update video status");
      refetch({ silent: true });
    }
  };

  // ── Video Player helpers ─────────────────────────────────────────────
  const openVideoPlayer = useCallback((courseId, videoIdx) => {
    setPlayerCourseId(courseId);
    setPlayerVideoIdx(videoIdx);
    setPlayerOpen(true);
  }, []);

  const closeVideoPlayer = useCallback(() => {
    setPlayerOpen(false);
  }, []);

  const navigateVideo = useCallback((direction) => {
    if (!playerCourseId || !courseVideos[playerCourseId]) return;
    const videos = courseVideos[playerCourseId];
    setPlayerVideoIdx(prev => {
      if (direction === 'prev') return Math.max(0, prev - 1);
      if (direction === 'next') return Math.min(videos.length - 1, prev + 1);
      return prev;
    });
  }, [playerCourseId, courseVideos]);

  // Derive current player video from state
  const playerVideos = playerCourseId ? (courseVideos[playerCourseId] || []) : [];
  const currentPlayerVideo = playerVideos[playerVideoIdx] || null;

  // Memoized user for certificate and greeting
  const user = useMemo(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }, []);

  const recipientName = user?.name || user?.username || (user?.email ? user.email.split('@')[0] : 'Rohan');

  // Build stages from API data
  const stages = useMemo(() => pathData?.stages || [], [pathData]);
  const allCourses = useMemo(() => stages.flatMap(s => s.courses || []), [stages]);
  const totalCourses = allCourses.length;
  const completedCourses = allCourses.filter(c => c.status === "Completed").length;
  const overallProgress = totalCourses ? Math.round((completedCourses / totalCourses) * 100) : 0;

  // Find the course title for the player header
  const playerCourseTitle = playerCourseId
    ? allCourses.find(c => c._id === playerCourseId)?.title || ''
    : '';

  // Memoized skills and credential ID for Phase 1 Certificate
  const pathSkills = useMemo(() => {
    if (!pathData) return ['Full-Stack Engineering', 'Architecture Design', 'System Integration'];
    const skills = [];
    if (Array.isArray(pathData.targetSkills) && pathData.targetSkills.length > 0) {
      skills.push(...pathData.targetSkills);
    }
    stages.forEach(s => {
      s.courses?.forEach(c => {
        if (c.domain && !skills.includes(c.domain)) skills.push(c.domain);
      });
    });
    return skills.length > 0 ? skills.slice(0, 6) : ['Full-Stack Engineering', 'Architecture Design', 'System Integration'];
  }, [pathData, stages]);

  const credentialId = useMemo(() => {
    const rawId = pathData?._id ? String(pathData._id).slice(-4).toUpperCase() : '8492';
    const tag = (pathData?.title || 'ENG').split(' ')[0].toUpperCase().slice(0, 4);
    return `SKILL-2026-${tag}-${rawId}`;
  }, [pathData]);

  // Build the roadmap from stages
  const dynamicRoadmap = useMemo(() => {
    return stages.map(stage => {
      const stageCompleted = stage.courses?.every(c => c.status === "Completed");
      const stageInProgress = stage.courses?.some(c => c.status === "In Progress" || c.status === "Completed");
      return {
        phase: stage.stageName,
        status: stageCompleted ? "completed" : stageInProgress ? "in-progress" : "upcoming",
        courses: (stage.courses || []).map(c => ({
          _id: c._id,
          title: c.title,
          domain: c.domain,
          duration: c.duration || "Self-Paced",
          progress: c.progress,
          status: c.status === "Completed" ? "completed" : c.status === "In Progress" ? "in-progress" : "locked"
        }))
      };
    });
  }, [stages]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-7 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-36 rounded-xl" />
        </div>
        <SkeletonMetrics count={4} />
        <SkeletonChart height="h-28" />
        <SkeletonCourse count={3} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
              {isSynthesizing 
                ? `Synthesizing ${synthesizingGoal} Roadmap` 
                : (pathData?.title || 'No Path Assigned')}
            </h1>
            {isSynthesizing && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 animate-pulse">
                <Sparkles className="w-3 h-3" />
                AI Pipeline Active
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {isSynthesizing
              ? "SkillUp's semantic AI is assembling your custom curriculum..."
              : (pathData?.subtitle || 'Click "Customize Path" to generate your personalized roadmap!')}
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          {pathData?._id && !isSynthesizing && (
            <AlertDialog>
              <AlertDialog.Trigger className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-900/40 rounded-xl hover:bg-rose-100/70 dark:hover:bg-rose-950/60 transition-all active:scale-95 shadow-xs select-none">
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Path</span>
              </AlertDialog.Trigger>
              <AlertDialog.Backdrop>
                <AlertDialog.Container>
                  <AlertDialog.Dialog className="sm:max-w-[420px]">
                    <AlertDialog.CloseTrigger />
                    <AlertDialog.Header>
                      <AlertDialog.Icon status="danger">
                        <RotateCcw className="size-5" />
                      </AlertDialog.Icon>
                      <AlertDialog.Heading>Reset Learning Progress?</AlertDialog.Heading>
                    </AlertDialog.Header>
                    <AlertDialog.Body>
                      <p className="text-sm text-gray-600 dark:text-slate-300">
                        Are you sure you want to reset all your completed courses and stages for this path? This will reset your progress to 0% and cannot be undone.
                      </p>
                    </AlertDialog.Body>
                    <AlertDialog.Footer>
                      <button
                        type="button"
                        slot="close"
                        className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        slot="close"
                        onClick={handleResetProgress}
                        className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 transition-all shadow-md active:scale-95 flex items-center gap-1.5"
                      >
                        Reset Progress
                      </button>
                    </AlertDialog.Footer>
                  </AlertDialog.Dialog>
                </AlertDialog.Container>
              </AlertDialog.Backdrop>
            </AlertDialog>
          )}
          {/* Phase 1 Downloadable Certificate Button - only visible when path is 100% completed */}
          {overallProgress === 100 && totalCourses > 0 && !isSynthesizing && (
            <Button
              variant="primary"
              icon={Award}
              onClick={() => setShowCertificate(true)}
              className="bg-gradient-to-r from-amber-500 via-amber-600 to-indigo-600 text-white shadow-lg shadow-amber-500/20 border-transparent hover:brightness-110 active:scale-95"
            >
              Claim Certificate
            </Button>
          )}

          <Button 
            variant="primary"
            icon={isSynthesizing ? Loader2 : Sparkles}
            disabled={isSynthesizing}
            onClick={() => setShowModal(true)}
            className={isSynthesizing ? "opacity-75 cursor-not-allowed" : ""}
          >
            {isSynthesizing ? "Synthesizing..." : "Customize Path"}
          </Button>
        </div>
      </div>

      {/* Customize Path Modal with Glassmorphism & Adaptive AI Engine */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setGenError(''); }}
        title="Generate AI Learning Path"
        subtitle="Specify your target career goal or technical discipline to build an adaptive curriculum"
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleGeneratePath} className="space-y-4.5 pt-1">
            {/* Target Goal Input with Glowing Glass Container */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Target Career Goal or Discipline *
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-purple-500/20 to-indigo-500/20 border border-purple-500/30 flex items-center justify-center text-purple-600 dark:text-purple-400 shadow-xs">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                </div>
                <input
                  type="text"
                  required
                  value={formData.goal}
                  onChange={(e) => {
                    setFormData({ goal: e.target.value });
                    if (genError) setGenError('');
                  }}
                  placeholder="e.g. Generative AI Engineer, Full Stack Developer, Rust Systems..."
                  className="w-full pl-12 pr-10 py-3 border border-gray-200/90 dark:border-white/10 rounded-xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-xl text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 text-sm font-medium focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 outline-none transition-all shadow-xs"
                />
                {formData.goal && (
                  <button
                    type="button"
                    onClick={() => setFormData({ goal: '' })}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Quick Track Suggestions (Glass Pills / Trending Chips) */}
            <div className="space-y-2 pt-0.5">
              <div className="flex items-center justify-between text-xs">
                <span className="uppercase tracking-wider text-[11px] font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-purple-500" />
                  Popular & Trending Tracks
                </span>
                <span className="text-[11px] text-purple-600 dark:text-purple-400 font-medium">Click to select</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: "⚡ Generative AI & LLMOps", value: "Generative AI & LLMOps" },
                  { label: "🌐 Full Stack Web", value: "Full Stack Development" },
                  { label: "🦀 Rust Systems", value: "Systems Programming with Rust" },
                  { label: "🤖 Robotics & ROS 2", value: "Robotics & Autonomous Systems" },
                  { label: "🛡️ Cybersecurity", value: "Cybersecurity" },
                  { label: "☁️ Cloud & SRE", value: "Site Reliability Engineering" },
                  { label: "🎯 DSA & Placement", value: "Career & Placement Readiness" },
                  { label: "🧠 Machine Learning", value: "Machine Learning" },
                  { label: "🎨 UI/UX Design", value: "UI/UX Design" },
                  { label: "📊 Data Engineering", value: "Data Engineering" },
                ].map((track) => {
                  const isSelected = formData.goal.toLowerCase() === track.value.toLowerCase();
                  return (
                    <button
                      key={track.value}
                      type="button"
                      onClick={() => {
                        setFormData({ goal: track.value });
                        if (genError) setGenError('');
                      }}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer backdrop-blur-md active:scale-95 border ${
                        isSelected
                          ? "bg-purple-600 text-white border-purple-500 shadow-sm shadow-purple-500/30"
                          : "bg-white/60 dark:bg-white/5 hover:bg-white/90 dark:hover:bg-white/10 text-gray-700 dark:text-gray-200 border-gray-200/80 dark:border-white/10 hover:border-purple-300 dark:hover:border-purple-500/40"
                      }`}
                    >
                      {track.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Adaptive 3-Stage Curriculum Info Badge */}
            <div className="p-3.5 rounded-xl bg-gradient-to-br from-purple-500/10 via-indigo-500/5 to-transparent border border-purple-500/20 dark:border-purple-500/20 backdrop-blur-md space-y-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                <span className="text-xs font-semibold text-purple-900 dark:text-purple-200">
                  Adaptive Multi-Stage Architecture
                </span>
              </div>
              <p className="text-[11px] text-gray-600 dark:text-slate-300 leading-relaxed">
                SkillUp's semantic AI automatically sequences your roadmap into <b>Foundation</b>, <b>Core Skills</b>, and <b>Advanced Topics</b> with verified video tutorials.
              </p>
            </div>

            {genError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-xl flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300 backdrop-blur-md">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{genError}</span>
              </div>
            )}

            <div className="pt-2 flex justify-end items-center gap-2.5">
              <Button
                variant="secondary"
                onClick={() => { setShowModal(false); setGenError(''); }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                icon={Sparkles}
                disabled={!formData.goal.trim()}
              >
                Generate Path
              </Button>
            </div>
          </form>
      </Modal>

      {/* ── Active AI Synthesis State (When generating path) ── */}
      {isSynthesizing ? (
        <div className="space-y-6 animate-fadeIn">
          {/* 1. Futuristic AI Roadmap Synthesizer Hero Card */}
          <div className="relative overflow-hidden rounded-2xl border border-purple-500/30 dark:border-purple-500/30 bg-gradient-to-br from-purple-900/10 via-indigo-900/10 to-blue-900/10 dark:from-purple-950/40 dark:via-indigo-950/30 dark:to-slate-900/50 backdrop-blur-xl p-6 sm:p-8 shadow-xl shadow-purple-500/5 transition-all">
            {/* Ambient glowing radial orbs */}
            <div className="absolute -top-24 -left-24 w-64 h-64 bg-purple-500/15 dark:bg-purple-600/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
            <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-indigo-500/15 dark:bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-6">
              {/* Top row: AI Core Icon + Target Goal Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative flex-shrink-0">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
                      <Sparkles className="w-7 h-7 animate-pulse text-white" />
                    </div>
                    <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-purple-500 to-cyan-400 opacity-40 blur-sm animate-pulse -z-10" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                        Neural Curriculum Compiler
                      </span>
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
                      Generating Curriculum for <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 dark:from-purple-300 dark:via-indigo-300 dark:to-cyan-300">{synthesizingGoal}</span>
                    </h3>
                  </div>
                </div>

                {/* Percentage indicator */}
                <div className="flex items-baseline gap-2 self-start sm:self-center bg-white/60 dark:bg-slate-900/60 px-4 py-2 rounded-xl border border-purple-500/20 backdrop-blur-md">
                  <span className="text-2xl font-black text-purple-600 dark:text-purple-400 tabular-nums">
                    {Math.min(99, Math.round(synthProgress))}%
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Ready</span>
                </div>
              </div>

              {/* Shimmering Progress Bar with sweeping light beam */}
              <div className="space-y-2">
                <div className="relative h-2.5 w-full bg-gray-200/80 dark:bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-purple-500/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 transition-all duration-500 ease-out relative overflow-hidden"
                    style={{ width: `${Math.min(100, Math.max(10, synthProgress))}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-sweep" />
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 font-medium">
                  <span className="flex items-center gap-1.5 text-purple-700 dark:text-purple-300">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    {synthesisSteps[synthStepIndex]?.title}
                  </span>
                  <span className="tabular-nums">
                    Phase {synthStepIndex + 1} of {synthesisSteps.length}
                  </span>
                </div>
              </div>

              {/* Active Step Ticker Callout */}
              <div className="p-4 rounded-xl bg-white/50 dark:bg-slate-900/50 border border-purple-500/20 backdrop-blur-md flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Cpu className="w-4 h-4 animate-pulse" />
                </div>
                <div className="space-y-0.5 min-w-0 flex-1">
                  <div className="text-xs font-bold text-gray-900 dark:text-gray-200">
                    {synthesisSteps[synthStepIndex]?.title}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                    {synthesisSteps[synthStepIndex]?.detail}
                  </p>
                </div>
              </div>

              {/* 5-Step Pipeline Breadcrumbs */}
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-1">
                {synthesisSteps.map((step, idx) => {
                  const isDone = idx < synthStepIndex;
                  const isCurrent = idx === synthStepIndex;
                  return (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-xl border text-xs transition-all duration-300 flex items-center gap-2 ${
                        isDone
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 font-medium"
                          : isCurrent
                          ? "bg-purple-500/15 border-purple-500/40 text-purple-800 dark:text-purple-200 font-semibold shadow-sm shadow-purple-500/10"
                          : "bg-white/30 dark:bg-white/5 border-gray-200/50 dark:border-white/5 text-gray-400 dark:text-gray-500 opacity-60"
                      }`}
                    >
                      {isDone ? (
                        <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                      ) : isCurrent ? (
                        <div className="w-3.5 h-3.5 rounded-full border-2 border-purple-500 border-t-transparent animate-spin flex-shrink-0" />
                      ) : (
                        <div className="w-2 h-2 rounded-full bg-gray-300 dark:bg-slate-600 flex-shrink-0 mx-0.5" />
                      )}
                      <span className="truncate">{step.shortTitle || step.title}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 2. Multi-Stage Roadmap Blueprint Construction */}
          <DashboardCard
            title="Curriculum Blueprint Construction"
            subtitle="AI is organizing modules into progressive mastery tiers..."
          >
            <div className="space-y-8 py-2">
              {[
                { phase: "Stage 1: Foundation & Prerequisites", desc: "Core fundamentals & essential toolchain", count: 2, icon: BookOpen, accent: "from-blue-500 to-cyan-500" },
                { phase: "Stage 2: Core Engineering & Applied Skills", desc: "Hands-on implementation & deep technical concepts", count: 3, icon: Target, accent: "from-purple-500 to-indigo-500" },
                { phase: "Stage 3: Advanced Topics & Production Mastery", desc: "Specialized architectures & deployment workflows", count: 2, icon: Award, accent: "from-amber-500 to-rose-500" }
              ].map((stage, idx) => (
                <div key={idx} className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${stage.accent} text-white flex items-center justify-center shadow-sm`}>
                        <stage.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm">{stage.phase}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{stage.desc}</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
                      <Loader2 className="w-3 h-3 animate-spin text-purple-500" />
                      Compiling Modules
                    </span>
                  </div>

                  {idx < 2 && (
                    <div className="absolute left-4.5 top-11 w-0.5 h-full bg-gradient-to-b from-purple-500/40 via-indigo-500/20 to-transparent -z-10" />
                  )}

                  <div className="ml-0 sm:ml-12 space-y-3">
                    {Array.from({ length: stage.count }).map((_, cIdx) => (
                      <div
                        key={cIdx}
                        className="p-4 rounded-xl border border-gray-200/70 dark:border-white/10 bg-white/60 dark:bg-slate-900/40 backdrop-blur-md shadow-xs space-y-3"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="space-y-2 flex-1">
                            <div className="h-4 w-48 sm:w-72 bg-gradient-to-r from-gray-200 to-gray-300/60 dark:from-slate-700 dark:to-slate-800 rounded-md skeleton-shimmer" />
                            <div className="flex items-center gap-3">
                              <div className="h-3 w-20 bg-gray-200/80 dark:bg-slate-700/80 rounded skeleton-shimmer" />
                              <div className="h-3 w-28 bg-gray-200/80 dark:bg-slate-700/80 rounded skeleton-shimmer" />
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-20 bg-rose-500/10 rounded-lg skeleton-shimmer" />
                            <div className="h-7 w-24 bg-gray-200 dark:bg-slate-700 rounded-lg skeleton-shimmer" />
                          </div>
                        </div>
                        <div className="h-1.5 w-full bg-gray-200/60 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full w-1/3 bg-purple-500/40 rounded-full skeleton-shimmer" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </DashboardCard>
        </div>
      ) : (
        <>
          {/* Celebratory Completion Banner (Phase 1 Certificate Reward) */}
      {overallProgress === 100 && totalCourses > 0 && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-500/15 via-purple-500/15 to-indigo-500/15 border border-amber-500/30 dark:border-amber-400/30 p-5 sm:p-6 shadow-lg backdrop-blur-sm">
          <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 text-slate-950 flex items-center justify-center flex-shrink-0 shadow-md shadow-amber-500/30">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                    Track Complete
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">100% Mastery</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                  Congratulations, {recipientName}! Your Official Credential is Ready
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-300 mt-0.5">
                  You have completed all milestones for <strong className="font-semibold text-gray-900 dark:text-white">{pathData?.title}</strong>. You can now download your high-resolution certificate or print as PDF.
                </p>
              </div>
            </div>
            <Button
              variant="primary"
              icon={Award}
              onClick={() => setShowCertificate(true)}
              className="bg-gradient-to-r from-amber-500 via-amber-600 to-indigo-600 text-white font-bold shadow-md shadow-amber-500/20 flex-shrink-0 hover:brightness-110"
            >
              Claim Certificate
            </Button>
          </div>
        </div>
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <DashboardCard>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Target Goal</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">{pathData?.goal || pathData?.title || 'Not set'}</p>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/40 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Completed</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">{completedCourses} / {totalCourses} Courses</p>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Daily Activity</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">{dashboardData?.metrics?.learningStreak || 0} Days Active</p>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/40 rounded-lg flex items-center justify-center">
              <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Skills Gained</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">{dashboardData?.metrics?.skillsMastered || 0} Skills</p>
            </div>
          </div>
        </DashboardCard>
      </div>

      {/* Overall Progress */}
      <DashboardCard title="Overall Path Progress">
        <ProgressBar value={overallProgress} label="Overall Completion" variant="default" size="lg" />
      </DashboardCard>

      {/* Learning Roadmap Timeline */}
      {dynamicRoadmap.length > 0 ? (
        <DashboardCard title="Learning Roadmap" subtitle="Your personalized journey">
          <div className="space-y-8">
            {dynamicRoadmap.map((phase, phaseIdx) => (
              <div key={phaseIdx} className="relative">
                {/* Phase Header */}
                <div className="flex items-center gap-4 mb-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    phase.status === "completed" ? "bg-green-100 dark:bg-green-900/40" :
                    phase.status === "in-progress" ? "bg-blue-100 dark:bg-blue-900/40" :
                    "bg-gray-50 dark:bg-slate-700"
                  }`}>
                    {phase.status === "completed" ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                    ) : phase.status === "in-progress" ? (
                      <Play className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">{phase.phase}</h3>
                    <p className={`text-sm ${
                      phase.status === "completed" ? "text-green-600" :
                      phase.status === "in-progress" ? "text-blue-600" :
                      "text-gray-600 dark:text-gray-400"
                    }`}>
                      {phase.status === "completed" ? "Completed" :
                       phase.status === "in-progress" ? "In Progress" :
                       "Upcoming"} — {phase.courses.length} courses
                    </p>
                  </div>
                </div>

                {/* Timeline Line */}
                {phaseIdx < dynamicRoadmap.length - 1 && (
                  <div className="absolute left-5 top-12 w-0.5 h-full bg-gray-200 dark:bg-gray-700" />
                )}

                {/* Courses */}
                <div className="ml-14 space-y-3">
                  {phase.courses.map((course, courseIdx) => (
                    <div 
                      key={course._id || courseIdx}
                      className={`rounded-lg border transition-all ${
                        course.status === "completed" ? "bg-green-100 dark:bg-green-900/30 dark:bg-green-900/20 border-green-200 dark:border-green-800 dark:border-green-800" :
                        course.status === "in-progress" ? "bg-blue-100 dark:bg-blue-900/30 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 dark:border-blue-800" :
                        "bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700"
                      }`}
                    >
                      <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <BookOpen className={`w-4 h-4 ${
                                course.status === "completed" ? "text-green-600" :
                                course.status === "in-progress" ? "text-blue-600" :
                                "text-gray-400"
                              }`} />
                              <h4 className={`font-medium ${
                                course.status === "locked" ? "text-gray-400" : "text-gray-900 dark:text-gray-100"
                              }`}>
                                {course.title}
                              </h4>
                            </div>
                            <div className="flex items-center gap-4 mt-2">
                              <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {course.duration}
                              </span>
                              {course.status === "completed" && (
                                <span className="text-xs text-green-700 dark:text-green-300 dark:text-green-300 font-medium">✓ Completed</span>
                              )}
                              {course.status === "in-progress" && (
                                <span className="text-xs text-blue-700 dark:text-blue-300 dark:text-blue-300 font-medium">In Progress</span>
                              )}
                              {course.status === "locked" && (
                                <span className="text-xs text-gray-400 font-medium">🔒 Not Started</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {/* Video expand button */}
                            <button
                              onClick={() => toggleVideos(course._id)}
                              className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-all flex items-center gap-1.5 active:scale-95"
                            >
                              <Youtube className="w-3.5 h-3.5" />
                              Videos
                              {expandedCourse === course._id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                            {course.status !== "completed" && (
                              <Button 
                                size="sm"
                                variant="success"
                                loading={actionLoadingCourse === course._id}
                                loadingText="Saving..."
                                onClick={() => handleMarkComplete(course._id)}
                                icon={CheckCircle2}
                              >
                                Mark Complete
                              </Button>
                            )}
                          </div>
                        </div>
                        {course.progress > 0 && (
                          <ProgressBar 
                            value={course.progress} 
                            showPercentage={false}
                            variant={course.progress === 100 ? "success" : "default"}
                            size="sm"
                          />
                        )}
                      </div>

                      {/* ── Expandable Video Section with smooth in/out animation ── */}
                      <AccordionContent isOpen={expandedCourse === course._id}>
                        <div className="border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 dark:bg-gray-900/30 p-4 rounded-b-lg">
                          {loadingVideos === course._id ? (
                            <div className="flex items-center justify-center py-6 gap-2 text-gray-400">
                              <div className="w-4 h-4 border-2 border-gray-300 dark:border-slate-600 border-t-indigo-500 rounded-full animate-spin" />
                              Loading videos...
                            </div>
                          ) : courseVideos[course._id]?.length > 0 ? (
                            <div className="space-y-3">
                              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                                📺 Recommended Videos — watch & mark complete to track progress
                              </p>
                              {courseVideos[course._id].map((video, videoIdx) => (
                                <div
                                  key={video.videoId}
                                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                                    video.completed
                                      ? 'bg-green-100 dark:bg-green-900/30 dark:bg-green-900/20 border-green-200 dark:border-green-800 dark:border-green-800'
                                      : 'bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700'
                                  } hover:shadow-md hover:-translate-y-0.5`}
                                  onClick={() => openVideoPlayer(course._id, videoIdx)}
                                  role="button"
                                  tabIndex={0}
                                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openVideoPlayer(course._id, videoIdx); } }}
                                >
                                  {/* Thumbnail */}
                                  <div className="flex-shrink-0 relative group">
                                    <img
                                      src={video.thumbnail || `https://i.ytimg.com/vi/${video.videoId}/mqdefault.jpg`}
                                      alt={video.title}
                                      className="w-28 h-16 object-cover rounded-md"
                                      onError={(e) => {
                                        if (!e.currentTarget.dataset.retried) {
                                          e.currentTarget.dataset.retried = "true";
                                          e.currentTarget.src = `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`;
                                        }
                                      }}
                                    />
                                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 rounded-md flex items-center justify-center transition-colors">
                                      <div className="w-9 h-9 rounded-full bg-white/90 dark:bg-white/80 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                        <Play className="w-4 h-4 text-gray-900 fill-gray-900 ml-0.5" />
                                      </div>
                                    </div>
                                  </div>

                                  {/* Info */}
                                  <div className="flex-1 min-w-0">
                                    <h5 className={`text-sm font-medium truncate ${video.completed ? 'text-green-700 dark:text-green-300 dark:text-green-400 line-through' : 'text-gray-900 dark:text-gray-100'}`}>
                                      {video.title}
                                    </h5>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{video.channel}</p>
                                  </div>

                                  {/* Actions */}
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    <button
                                      onClick={(e) => { e.stopPropagation(); toggleVideoComplete(course._id, video.videoId, video.completed); }}
                                      className={`p-1.5 rounded-md transition-all active:scale-90 ${
                                        video.completed
                                          ? 'text-green-700 dark:text-green-300 dark:text-green-300 bg-green-100 dark:bg-green-900/40 hover:bg-green-200'
                                          : 'text-gray-400 hover:text-green-700 dark:text-green-300 dark:text-green-300 hover:bg-green-100 dark:bg-green-900/30 dark:hover:bg-green-900/20'
                                      }`}
                                      title={video.completed ? 'Mark as incomplete' : 'Mark as completed'}
                                    >
                                      <CheckCircle2 className="w-5 h-5" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                              {/* completion summary */}
                              {(() => {
                                const vids = courseVideos[course._id];
                                const done = vids.filter(v => v.completed).length;
                                return (
                                  <div className="text-xs text-gray-500 dark:text-gray-400 text-right pt-1">
                                    {done}/{vids.length} videos completed
                                  </div>
                                );
                              })()}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-400 text-center py-4">No videos available for this course.</p>
                          )}
                        </div>
                      </AccordionContent>

                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </DashboardCard>
      ) : (
        <DashboardCard>
          <div className="text-center py-12">
            <Sparkles className="w-12 h-12 text-indigo-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">No Learning Path Yet</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Click "Customize Path" to generate a personalized roadmap for any engineering domain.</p>
            <button 
              onClick={() => setShowModal(true)}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors inline-flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Get Started
            </button>
          </div>
        </DashboardCard>
      )}

      {/* Reset Progress Danger Zone with AlertDialog */}
      {allCourses.length > 0 && (
        <DashboardCard title="Danger Zone" subtitle="Irreversible learning path actions">
          <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h4 className="font-semibold text-rose-900 dark:text-rose-300 text-sm">Reset All Path Progress</h4>
              <p className="text-xs text-rose-700/80 dark:text-rose-400/80">
                This will reset progress for all courses in your learning path back to 0%. Your assigned curriculum will remain intact.
              </p>
            </div>
            <AlertDialog>
              <AlertDialog.Trigger className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-all active:scale-95 shadow-xs shrink-0 select-none">
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Progress</span>
              </AlertDialog.Trigger>
              <AlertDialog.Backdrop>
                <AlertDialog.Container>
                  <AlertDialog.Dialog className="sm:max-w-[420px]">
                    <AlertDialog.CloseTrigger />
                    <AlertDialog.Header>
                      <AlertDialog.Icon status="danger">
                        <RotateCcw className="size-5" />
                      </AlertDialog.Icon>
                      <AlertDialog.Heading>Reset all course progress?</AlertDialog.Heading>
                    </AlertDialog.Header>
                    <AlertDialog.Body>
                      <p className="text-sm text-gray-600 dark:text-slate-300">
                        Are you sure you want to reset all your completed courses and stages for this learning path? All progress will reset to 0% and cannot be undone.
                      </p>
                    </AlertDialog.Body>
                    <AlertDialog.Footer>
                      <button
                        type="button"
                        slot="close"
                        className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        slot="close"
                        onClick={handleResetProgress}
                        className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 transition-all shadow-md active:scale-95 flex items-center gap-1.5"
                      >
                        Reset All Progress
                      </button>
                    </AlertDialog.Footer>
                  </AlertDialog.Dialog>
                </AlertDialog.Container>
              </AlertDialog.Backdrop>
            </AlertDialog>
          </div>
        </DashboardCard>
      )}

      {/* Recommended Next Steps */}
      <DashboardCard title="Recommended Next Steps">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-indigo-100 dark:bg-indigo-900/30 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 dark:border-indigo-800 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Complete Current Courses</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Focus on finishing your in-progress courses to unlock the next phase</p>
            <button className="text-sm text-indigo-700 dark:text-indigo-300 dark:text-indigo-300 font-medium hover:text-indigo-700">
              View Courses →
            </button>
          </div>
          
          <div className="p-4 bg-purple-100 dark:bg-purple-900/30 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 dark:border-purple-800 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Practice Projects</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Build projects to strengthen your practical skills</p>
            <button className="text-sm text-purple-700 dark:text-purple-300 dark:text-purple-300 font-medium hover:text-purple-700">
              View Projects →
            </button>
          </div>
          
          <div className="p-4 bg-teal-100 dark:bg-teal-900/30 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 dark:border-teal-800 rounded-lg">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Try a New Domain</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Generate a new path for a completely different engineering domain</p>
            <button 
              onClick={() => setShowModal(true)}
              className="text-sm text-teal-700 dark:text-teal-300 dark:text-teal-300 font-medium hover:text-teal-700"
            >
              Generate New Path →
            </button>
          </div>
        </div>
      </DashboardCard>
        </>
      )}

      {/* ── Video Player Window ── */}
      <VideoPlayerWindow
        video={currentPlayerVideo}
        isOpen={playerOpen}
        onClose={closeVideoPlayer}
        onToggleComplete={(videoId, currentlyCompleted) => {
          if (playerCourseId) {
            toggleVideoComplete(playerCourseId, videoId, currentlyCompleted);
          }
        }}
        onNavigate={navigateVideo}
        hasPrev={playerVideoIdx > 0}
        hasNext={playerVideoIdx < playerVideos.length - 1}
        courseTitle={playerCourseTitle}
      />

      {/* ── Phase 1 Downloadable Certificate Modal (Only accessible upon 100% path completion) ── */}
      {overallProgress === 100 && totalCourses > 0 && (
        <CertificateModal
          isOpen={showCertificate}
          onClose={() => setShowCertificate(false)}
          recipientName={recipientName}
          pathTitle={pathData?.title || "Full-Stack AI Engineer"}
          skills={pathSkills}
          overallProgress={overallProgress}
          credentialId={credentialId}
        />
      )}
    </div>
  );
}
