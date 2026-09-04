import { useState, useRef } from "react";
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
  Check
} from "lucide-react";

import { useFetch, apiCall } from "../hooks/useFetch";
import { useToast } from "../contexts/ToastContext";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { Skeleton, SkeletonMetrics, SkeletonChart, SkeletonCourse } from "../components/ui/Skeleton";
import { AccordionContent } from "../components/ui/AccordionContent";


export default function LearningPath() {
  const { data: pathData, loading, refetch, mutate: mutatePath } = useFetch('/api/learner/path');
  const { data: dashboardData, refetch: refetchDashboard } = useFetch('/api/learner/dashboard');
  const toast = useToast();

  const [showModal, setShowModal] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [genError, setGenError] = useState('');
  const [formData, setFormData] = useState({ goal: '', level: 'Beginner', knownSkills: '' });
  const [actionLoadingCourse, setActionLoadingCourse] = useState(null);

  // Video expansion state
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [courseVideos, setCourseVideos] = useState({});
  const [loadingVideos, setLoadingVideos] = useState(null);

  const generationStages = [
    "Analyzing learning goal...",
    "Identifying required skills...",
    "Building learning path...",
    "Finding relevant courses & resources...",
    "Learning path ready!"
  ];

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
    if (!window.confirm('Are you sure you want to reset ALL your progress? This cannot be undone.')) return;
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
    setGenerating(true);
    setGenError('');
    setGenerationStep(0);

    // Intentional step transitions reflecting the generation pipeline
    const stepInterval = setInterval(() => {
      setGenerationStep(prev => (prev < generationStages.length - 2 ? prev + 1 : prev));
    }, 900);

    try {
      const result = await apiCall('/api/learner/generate-path', 'POST', {
        goal: formData.goal,
        level: formData.level,
        knownSkills: formData.knownSkills.split(',').map(s => s.trim()).filter(Boolean)
      });

      clearInterval(stepInterval);

      if (result.path === null) {
        setGenError(result.message);
      } else {
        setGenerationStep(generationStages.length - 1);
        setTimeout(() => {
          setShowModal(false);
          setFormData({ goal: '', level: 'Beginner', knownSkills: '' });
          toast.success("Learning path generated successfully!");
          refetch({ silent: true });
          refetchDashboard({ silent: true });
        }, 400);
      }
    } catch (err) {
      clearInterval(stepInterval);
      setGenError('Failed to generate path. Please try again.');
    } finally {
      setGenerating(false);
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

  // Build stages from API data
  const stages = pathData?.stages || [];
  const allCourses = stages.flatMap(s => s.courses || []);
  const totalCourses = allCourses.length;
  const completedCourses = allCourses.filter(c => c.status === "Completed").length;
  const overallProgress = totalCourses ? Math.round((completedCourses / totalCourses) * 100) : 0;

  // Build the roadmap from stages
  const dynamicRoadmap = stages.map(stage => {
    const stageCompleted = stage.courses.every(c => c.status === "Completed");
    const stageInProgress = stage.courses.some(c => c.status === "In Progress" || c.status === "Completed");
    return {
      phase: stage.stageName,
      status: stageCompleted ? "completed" : stageInProgress ? "in-progress" : "upcoming",
      courses: stage.courses.map(c => ({
        _id: c._id,
        title: c.title,
        domain: c.domain,
        duration: c.duration || "Self-Paced",
        progress: c.progress,
        status: c.status === "Completed" ? "completed" : c.status === "In Progress" ? "in-progress" : "locked"
      }))
    };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{pathData?.title || 'No Path Assigned'}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{pathData?.subtitle || 'Click "Customize Path" to generate your personalized roadmap!'}</p>
        </div>
        <Button 
          variant="primary"
          icon={Sparkles}
          onClick={() => setShowModal(true)}
        >
          Customize Path
        </Button>
      </div>

      {/* Customize Path Modal with Intentional Backend Stages */}
      <Modal
        isOpen={showModal}
        onClose={() => { if (!generating) { setShowModal(false); setGenError(''); } }}
        title="Generate Learning Path"
        subtitle="Enter your target engineering goal and we'll build a tailored curriculum"
      >
        {generating ? (
          <div className="py-6 space-y-5">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-base">Creating Your Roadmap</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">Please wait while the AI curriculum engine crafts your path</p>
            </div>

            <div className="bg-gray-50 dark:bg-slate-700/40 rounded-xl p-4 space-y-3 border border-gray-100 dark:border-slate-700">
              {generationStages.map((stage, idx) => {
                const isPassed = idx < generationStep;
                const isCurrent = idx === generationStep;
                return (
                  <div key={idx} className="flex items-center gap-3 text-xs transition-colors duration-200">
                    {isPassed ? (
                      <div className="w-5 h-5 rounded-full bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 flex items-center justify-center flex-shrink-0">
                        <Check className="w-3 h-3" />
                      </div>
                    ) : isCurrent ? (
                      <div className="w-5 h-5 rounded-full bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0">
                        <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border border-gray-300 dark:border-slate-600 flex-shrink-0" />
                    )}
                    <span className={`
                      ${isCurrent ? "font-semibold text-purple-700 dark:text-purple-300" : isPassed ? "text-gray-700 dark:text-gray-300" : "text-gray-400 dark:text-gray-500"}
                    `}>
                      {stage}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <form onSubmit={handleGeneratePath} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                Target Goal *
              </label>
              <input
                type="text"
                required
                value={formData.goal}
                onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                placeholder="e.g. Frontend Development, Data Science, Cloud Engineering..."
                className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
              />
              <p className="text-[11px] text-gray-400 mt-1">Recommended: Frontend, Backend, Data Science, ML, Cloud, Cybersecurity</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                Current Level
              </label>
              <select
                value={formData.level}
                onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
              >
                <option value="Beginner">Beginner (Foundational principles)</option>
                <option value="Intermediate">Intermediate (Real-world applications)</option>
                <option value="Advanced">Advanced (Architecture & optimization)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                Known Skills (Optional)
              </label>
              <input
                type="text"
                value={formData.knownSkills}
                onChange={(e) => setFormData({ ...formData, knownSkills: e.target.value })}
                placeholder="e.g. Python, JavaScript, HTML (comma separated)"
                className="w-full px-3.5 py-2.5 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
              />
            </div>

            {genError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-xl flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{genError}</span>
              </div>
            )}

            <div className="pt-2 flex justify-end gap-2">
              <Button
                variant="secondary"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                icon={Sparkles}
              >
                Generate Path
              </Button>
            </div>
          </form>
        )}
      </Modal>


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
                              {courseVideos[course._id].map((video) => (
                                <div
                                  key={video.videoId}
                                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                                    video.completed
                                      ? 'bg-green-100 dark:bg-green-900/30 dark:bg-green-900/20 border-green-200 dark:border-green-800 dark:border-green-800'
                                      : 'bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700'
                                  }`}
                                >
                                  {/* Thumbnail */}
                                  <a
                                    href={`https://www.youtube.com/watch?v=${video.videoId}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-shrink-0 relative group"
                                  >
                                    <img
                                      src={video.thumbnail}
                                      alt={video.title}
                                      className="w-28 h-16 object-cover rounded-md"
                                    />
                                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 rounded-md flex items-center justify-center transition-colors">
                                      <Play className="w-6 h-6 text-white fill-white" />
                                    </div>
                                  </a>

                                  {/* Info */}
                                  <div className="flex-1 min-w-0">
                                    <h5 className={`text-sm font-medium truncate ${video.completed ? 'text-green-700 dark:text-green-300 dark:text-green-400 line-through' : 'text-gray-900 dark:text-gray-100'}`}>
                                      {video.title}
                                    </h5>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{video.channel}</p>
                                  </div>

                                  {/* Actions */}
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    <a
                                      href={`https://www.youtube.com/watch?v=${video.videoId}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="p-1.5 rounded-md text-indigo-700 dark:text-indigo-300 dark:text-indigo-300 dark:text-indigo-400 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/30 transition-colors active:scale-90"
                                      title="Watch on YouTube"
                                    >
                                      <ExternalLink className="w-4 h-4" />
                                    </a>
                                    <button
                                      onClick={() => toggleVideoComplete(course._id, video.videoId, video.completed)}
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

      {/* Reset Progress */}
      {allCourses.length > 0 && (
        <DashboardCard title="Danger Zone">
          <div className="p-4 bg-red-100 dark:bg-red-900/30 dark:bg-red-900/20 border border-red-200 dark:border-red-800 dark:border-red-800 rounded-lg">
            <h4 className="font-semibold text-red-900 dark:text-red-400 mb-2">Reset All Progress</h4>
            <p className="text-sm text-red-700 dark:text-red-300 dark:text-red-300 mb-3">
              This will reset progress for all courses in your learning path. Your path will remain but all courses will go back to "Not Started".
            </p>
            <Button
              variant="danger"
              size="sm"
              onClick={handleResetProgress}
            >
              Reset All Progress
            </Button>
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
    </div>
  );
}
