import React, { useMemo } from "react";
import {
  TrendingUp,
  Target,
  BookOpen,
  Award,
  ArrowRight,
  Zap,
  Sparkles
} from "lucide-react";
import { useFetch } from "../hooks/useFetch";
import { Link } from "react-router";
import { Skeleton, SkeletonMetrics, SkeletonChart } from "../components/ui/Skeleton";
import { ProgressBar } from "../components/ProgressBar";
import { GlassCard } from "../components/ui/GlassCard";
import { GlassIcon } from "../components/ui/GlassIcon";
import { GlassButton } from "../components/ui/GlassButton";
import { GlowingLineChart } from "../components/ui/GlowingLineChart";
import { GlowingRadarChart } from "../components/ui/GlowingRadarChart";

export default function LearnerDashboard() {
  const { data: dashboardData, loading: dashboardLoading } = useFetch('/api/learner/dashboard');
  const { data: pathData, loading: pathLoading } = useFetch('/api/learner/path');

  // Authenticated user extraction (never hardcoded)
  const user = useMemo(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }, []);

  const displayName = user?.name || user?.username || (user?.email ? user.email.split('@')[0] : '');

  // Build course list for path preview
  const pathCourses = useMemo(() => {
    if (!pathData) return [];
    return pathData.stages
      ? pathData.stages.flatMap(s => s.courses || [])
      : (pathData.courses || []);
  }, [pathData]);

  // Dynamic skill radar computation (expands course skills if fewer than 3 domains exist)
  const skillRadarData = useMemo(() => {
    if (dashboardData?.skillRadarData && dashboardData.skillRadarData.length >= 3) {
      return dashboardData.skillRadarData;
    }
    if (pathCourses && pathCourses.length > 0) {
      const skills = [];
      pathCourses.forEach(c => {
        const cleanName = c.title
          ?.replace(/ Fundamentals| Essentials| Basics| & Concepts/gi, '')
          ?.trim() || c.title;
        if (cleanName && !skills.some(s => s.skill === cleanName)) {
          skills.push({
            skill: cleanName,
            current: c.status === 'Completed' ? 100 : (c.progress || 0),
            required: 100,
          });
        }
      });
      if (skills.length >= 3) {
        return skills.slice(0, 6);
      }
    }
    return dashboardData?.skillRadarData || [{ skill: 'Core Track', current: 20, required: 100 }];
  }, [dashboardData, pathCourses]);

  if (dashboardLoading || pathLoading) {
    return (
      <div className="space-y-6 w-full">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64 rounded-xl" />
          <Skeleton className="h-4 w-96 rounded-lg" />
        </div>
        <SkeletonMetrics count={4} />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonChart height="h-80" />
          <SkeletonChart height="h-80" />
        </div>
      </div>
    );
  }

  const metrics = dashboardData?.metrics || {};
  const currentCourse = dashboardData?.currentCourse;

  const totalPathCourses = metrics.totalPathCourses || pathCourses.length || 0;
  const remainingCourses = metrics.remainingCourses !== undefined
    ? metrics.remainingCourses
    : Math.max(0, totalPathCourses - (metrics.completed || 0));

  const skillProgressData = dashboardData?.skillProgressData || [];

  return (
    <div className="space-y-6 sm:space-y-8 w-full">
      {/* ── 1. Welcome Section ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
            Welcome back{displayName ? `, ${displayName}` : ''}! <span>👋</span>
          </h1>
          <p className="text-sm sm:text-base font-medium text-gray-600 dark:text-slate-300 mt-1">
            Here's your learning progress and recommendations
          </p>
        </div>

        {pathData?.title && (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-subtle self-start sm:self-auto text-xs font-semibold text-indigo-700 dark:text-indigo-300 shadow-xs border border-indigo-200/50 dark:border-indigo-500/20">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span className="truncate max-w-[220px]">{pathData.title}</span>
          </div>
        )}
      </div>

      {/* ── 2. Statistics Grid (4 Key Metric Cards with Multi-Depth Glass) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">

        {/* Career Readiness */}
        <GlassCard variant="default" hover className="flex items-start justify-between group">
          <div className="space-y-1">
            <p className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-slate-300">Career Readiness</p>
            <p className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 dark:text-white pt-1">
              {metrics.readiness || 0}%
            </p>
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 pt-1">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>↑ Live Data</span>
            </div>
          </div>
          <GlassIcon icon={Target} variant="indigo" />
        </GlassCard>

        {/* Courses Completed */}
        <GlassCard variant="default" hover className="flex items-start justify-between group">
          <div className="space-y-1">
            <p className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-slate-300">Courses Completed</p>
            <p className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 dark:text-white pt-1">
              {metrics.completed || 0}
            </p>
            <p className="text-xs font-semibold text-gray-600 dark:text-slate-400 pt-1">
              {metrics.inProgress || 0} in progress
            </p>
          </div>
          <GlassIcon icon={BookOpen} variant="purple" />
        </GlassCard>

        {/* Skills Mastered */}
        <GlassCard variant="default" hover className="flex items-start justify-between group">
          <div className="space-y-1">
            <p className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-slate-300">Skills Mastered</p>
            <p className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 dark:text-white pt-1">
              {metrics.skillsMastered || 0}
            </p>
            <p className="text-xs font-semibold text-gray-600 dark:text-slate-400 pt-1">
              From completed courses
            </p>
          </div>
          <GlassIcon icon={Award} variant="emerald" />
        </GlassCard>

        {/* Remaining Courses */}
        <GlassCard variant="default" hover className="flex items-start justify-between group">
          <div className="space-y-1">
            <p className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-slate-300">Remaining Courses</p>
            <p className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 dark:text-white pt-1">
              {remainingCourses}
            </p>
            <p className="text-xs font-semibold text-gray-600 dark:text-slate-400 pt-1">
              of {totalPathCourses} total
            </p>
          </div>
          <GlassIcon icon={Zap} variant="amber" />
        </GlassCard>

      </div>

      {/* ── 3. Currently Working On Card (Elevated Focal Point) ── */}
      <GlassCard variant="elevated" className="rounded-[28px] p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Currently Working On
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mt-1">
              {currentCourse?.title || (pathCourses.length > 0 ? "Ready to start next course" : "No active course")}
            </h2>
            <p className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-slate-300 mt-0.5">
              {currentCourse ? `Progress: ${currentCourse.progress}%` : "Continue your learning path to get started."}
            </p>
          </div>

          <Link to="/dashboard/learning-path">
            <GlassButton variant="primary" icon={ArrowRight}>
              Continue
            </GlassButton>
          </Link>
        </div>

        {/* Glow Progress Bar */}
        <div className="w-full bg-slate-200/80 dark:bg-slate-700/60 rounded-full h-3 overflow-hidden p-0.5 shadow-inner">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-400 transition-all duration-700 ease-out shadow-[0_0_14px_rgba(99,102,241,0.6)]"
            style={{ width: `${currentCourse ? Math.max(4, currentCourse.progress) : 0}%` }}
          />
        </div>
      </GlassCard>

      {/* ── 4. Charts Row (Learning Progress & Skill Gap Analysis with Guaranteed Readability) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Learning Progress (Glowing Line Chart) */}
        <GlassCard variant="default" className="flex flex-col justify-between p-6 sm:p-7">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Learning Progress</h3>
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-slate-400 mt-0.5">Last 6 months</p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+18.4%</span>
            </span>
          </div>

          <GlowingLineChart
            data={skillProgressData}
            dataKey="progress"
            xKey="month"
            type="bump"
            height={240}
            stroke="#6366f1"
            unit="%"
            showDots={true}
          />
        </GlassCard>

        {/* Skill Gap Analysis (Glowing Stroke Radar Chart) */}
        <GlassCard variant="default" className="flex flex-col justify-between p-6 sm:p-7">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Skill Gap Analysis</h3>
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-slate-400 mt-0.5">Current vs Required Level</p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Target className="w-3.5 h-3.5" />
              <span>Competency</span>
            </span>
          </div>

          <GlowingRadarChart
            data={skillRadarData}
            angleKey="skill"
            series={[
              { dataKey: "current", name: "Current Level", stroke: "#6366f1", fill: "rgba(99, 102, 241, 0.15)" },
              { dataKey: "required", name: "Required Level", stroke: "#a855f7", fill: "none", strokeDasharray: "4 4" },
            ]}
            height={240}
            unit="%"
            showLegend={true}
          />
        </GlassCard>

      </div>

      {/* ── 5. Active Learning Path Breakdown ── */}
      <GlassCard variant="default" className="p-6 sm:p-7">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {pathData?.title || "Enrolled Learning Path"}
            </h3>
            <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-slate-400 mt-0.5">
              {pathData?.subtitle || "Track your courses across all stages"}
            </p>
          </div>

          <Link to="/dashboard/learning-path">
            <GlassButton variant="subtle" size="sm" icon={ArrowRight}>
              View Full Path
            </GlassButton>
          </Link>
        </div>

        <div className="space-y-3.5">
          {pathCourses.slice(0, 5).map((course) => (
            <div
              key={course._id || course.title}
              className="p-3.5 rounded-2xl glass-subtle hover:border-indigo-300 dark:hover:border-indigo-500/30 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${course.status === "Completed"
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    : course.status === "In Progress"
                      ? "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400"
                      : "bg-gray-500/15 text-gray-600 dark:text-gray-400"
                    }`}>
                    {course.status === "Completed" ? "✓" : "•"}
                  </div>
                  <span className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-xs sm:max-w-md">
                    {course.title}
                  </span>
                </div>

                <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${course.status === "Completed"
                  ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20" :
                  course.status === "In Progress"
                    ? "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20" :
                    "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400"
                  }`}>
                  {course.status}
                </span>
              </div>

              <ProgressBar
                value={course.progress || 0}
                showPercentage={false}
                variant={course.progress === 100 ? "success" : "default"}
                size="sm"
              />
            </div>
          ))}

          {pathCourses.length === 0 && (
            <div className="py-8 text-center text-sm text-gray-500 dark:text-gray-400 font-medium">
              No courses enrolled yet.{" "}
              <Link to="/dashboard/learning-path" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline">
                Generate a learning path
              </Link>{" "}
              to get started.
            </div>
          )}
        </div>
      </GlassCard>

    </div>
  );
}


