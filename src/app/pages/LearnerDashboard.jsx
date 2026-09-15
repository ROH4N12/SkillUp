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
import {
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

import { useFetch } from "../hooks/useFetch";
import { Link } from "react-router";
import { Skeleton, SkeletonMetrics, SkeletonChart } from "../components/ui/Skeleton";
import { ProgressBar } from "../components/ProgressBar";
import { GlassCard } from "../components/ui/GlassCard";
import { GlassIcon } from "../components/ui/GlassIcon";
import { GlassButton } from "../components/ui/GlassButton";

// Custom Tooltip for Line Chart with frosted styling
function CustomLineTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="glass-pill px-3.5 py-2 rounded-xl shadow-xl border border-white/60 dark:border-white/15 backdrop-blur-md">
        <p className="text-xs font-semibold text-gray-500 dark:text-slate-400">{label}</p>
        <p className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400 mt-0.5">
          {payload[0].value}% <span className="text-xs font-medium text-gray-500 dark:text-slate-400">Progress</span>
        </p>
      </div>
    );
  }
  return null;
}

// Custom Tooltip for Radar Chart with frosted styling
function CustomRadarTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="glass-pill px-3.5 py-2.5 rounded-xl shadow-xl border border-white/60 dark:border-white/15 backdrop-blur-md">
        <p className="text-xs font-bold text-gray-900 dark:text-white">{data.skill}</p>
        <div className="mt-1.5 space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-xs" />
            <span className="text-gray-700 dark:text-slate-200 font-medium">Current: {data.current}%</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-xs" />
            <span className="text-gray-700 dark:text-slate-200 font-medium">Required: {data.required}%</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
}

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

        {/* Learning Progress (Line Chart) */}
        <GlassCard variant="default" className="flex flex-col justify-between p-6 sm:p-7">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Learning Progress</h3>
            <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-slate-400 mt-0.5">Last 6 months</p>
          </div>

          <div className="w-full h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={skillProgressData}
                margin={{ top: 15, right: 15, left: -20, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="progressLineGlow" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="50%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="4 4"
                  stroke="rgba(148, 163, 184, 0.25)"
                  vertical={true}
                  horizontal={true}
                />
                <XAxis
                  dataKey="month"
                  stroke="rgba(100, 116, 139, 0.85)"
                  fontSize={12}
                  fontWeight={500}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="rgba(100, 116, 139, 0.85)"
                  fontSize={12}
                  fontWeight={500}
                  domain={[0, (dataMax) => Math.max(32, dataMax + 5)]}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomLineTooltip />} />
                <Line
                  type="monotone"
                  dataKey="progress"
                  stroke="url(#progressLineGlow)"
                  strokeWidth={3.5}
                  dot={{ fill: "#6366f1", r: 4, strokeWidth: 2, stroke: "#ffffff" }}
                  activeDot={{ r: 7, fill: "#6366f1", stroke: "#ffffff", strokeWidth: 2.5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Skill Gap Analysis (Radar Chart) */}
        <GlassCard variant="default" className="flex flex-col justify-between p-6 sm:p-7">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Skill Gap Analysis</h3>
              <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-slate-400 mt-0.5">Current vs Required</p>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-xs" />
                <span className="text-gray-700 dark:text-slate-300 font-semibold">Current</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500 shadow-xs" />
                <span className="text-gray-700 dark:text-slate-300 font-semibold">Required</span>
              </div>
            </div>
          </div>

          <div className="w-full h-64 sm:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={skillRadarData} margin={{ top: 10, right: 25, bottom: 10, left: 25 }}>
                <PolarGrid stroke="rgba(148, 163, 184, 0.3)" />
                <PolarAngleAxis
                  dataKey="skill"
                  stroke="rgba(71, 85, 105, 0.9)"
                  fontSize={11.5}
                  fontWeight={600}
                  tick={{ fill: 'currentColor', opacity: 0.9 }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  stroke="rgba(148, 163, 184, 0.5)"
                  fontSize={10}
                />
                <Radar
                  name="Current"
                  dataKey="current"
                  stroke="#6366f1"
                  fill="#6366f1"
                  fillOpacity={0.45}
                  strokeWidth={2}
                />
                <Radar
                  name="Required"
                  dataKey="required"
                  stroke="#a855f7"
                  fill="#a855f7"
                  fillOpacity={0.15}
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                />
                <Tooltip content={<CustomRadarTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
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


