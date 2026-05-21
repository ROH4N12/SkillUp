import { DashboardCard } from "../components/DashboardCard";
import { ProgressBar } from "../components/ProgressBar";
import { 
  TrendingUp, 
  Target, 
  BookOpen, 
  Award, 
  ArrowRight,
  Zap,
  CheckCircle2
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

import { useFetch, apiCall } from "../hooks/useFetch";
import { Link } from "react-router";

export default function LearnerDashboard() {
  const { data: dashboardData, loading: dashboardLoading } = useFetch('/api/learner/dashboard');
  const { data: pathData, loading: pathLoading } = useFetch('/api/learner/path');

  if (dashboardLoading || pathLoading) return <div className="p-6 text-center text-gray-500 dark:text-gray-400">Loading...</div>;

  const metrics = dashboardData?.metrics || {};
  const currentCourse = dashboardData?.currentCourse;

  // Build a flat list of courses for the path preview
  const pathCourses = pathData?.stages
    ? pathData.stages.flatMap(s => s.courses || [])
    : (pathData?.courses || []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Welcome back! 👋</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Here's your learning progress and recommendations</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Career Readiness</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-2">{metrics.readiness || 0}%</p>
              <p className="text-xs text-green-700 dark:text-green-300 dark:text-green-300 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Live Data
              </p>
            </div>
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
        </DashboardCard>

        <DashboardCard>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Courses Completed</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-2">{metrics.completed || 0}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{metrics.inProgress || 0} in progress</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </DashboardCard>

        <DashboardCard>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Skills Mastered</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-2">{metrics.skillsMastered || 0}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">From completed courses</p>
            </div>
            <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-teal-600" />
            </div>
          </div>
        </DashboardCard>

        <DashboardCard>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Remaining Courses</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-2">{metrics.remainingCourses || 0}</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">of {metrics.totalPathCourses || 0} total</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </DashboardCard>
      </div>

      {/* Current Course Highlight */}
      {currentCourse && (
        <DashboardCard title="Currently Working On">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">{currentCourse.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Progress: {currentCourse.progress}%</p>
              <ProgressBar 
                value={currentCourse.progress} 
                showPercentage={false}
                variant="default"
                size="sm"
              />
            </div>
            <Link
              to="/dashboard/learning-path"
              className="ml-4 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 dark:text-indigo-300 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium flex items-center gap-1"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </DashboardCard>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skill Progress Chart */}
        <DashboardCard title="Learning Progress" subtitle="Last 6 months">
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={dashboardData?.skillProgressData || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="progress" 
                stroke="#6366f1" 
                strokeWidth={3}
                dot={{ fill: "#6366f1", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </DashboardCard>

        {/* Skill Radar Chart */}
        <DashboardCard title="Skill Gap Analysis" subtitle="Current vs Required">
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={dashboardData?.skillRadarData || []}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="skill" stroke="#6b7280" fontSize={11} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="#9ca3af" fontSize={10} />
              <Radar name="Current" dataKey="current" stroke="#6366f1" fill="#6366f1" fillOpacity={0.5} />
              <Radar name="Required" dataKey="required" stroke="#a855f7" fill="#a855f7" fillOpacity={0.3} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </DashboardCard>
      </div>

      {/* Current Learning Path */}
      <div className="grid grid-cols-1 gap-6">
        <DashboardCard 
          title={pathData?.title || "No Active Path"} 
          subtitle={pathData?.subtitle || "Enroll in a path to see courses"}
          action={
            <Link to="/dashboard/learning-path" className="text-sm text-indigo-700 dark:text-indigo-300 dark:text-indigo-300 hover:text-indigo-700 dark:text-indigo-300 font-medium flex items-center gap-1">
              View Full Path <ArrowRight className="w-4 h-4" />
            </Link>
          }
        >
          <div className="space-y-4">
            {pathCourses.slice(0, 5).map((course) => (
              <div key={course._id}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{course.title}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    course.status === "Completed" ? "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 dark:text-green-400" :
                    course.status === "In Progress" ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 dark:text-blue-400" :
                    "bg-gray-50 dark:bg-slate-800 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                  }`}>
                    {course.status}
                  </span>
                </div>
                <ProgressBar 
                  value={course.progress} 
                  showPercentage={false}
                  variant={course.progress === 100 ? "success" : "default"}
                  size="sm"
                />
              </div>
            ))}
            {pathCourses.length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                No courses yet. <Link to="/dashboard/learning-path" className="text-indigo-700 dark:text-indigo-300 dark:text-indigo-300 hover:underline">Generate a learning path</Link> to get started.
              </p>
            )}
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}
