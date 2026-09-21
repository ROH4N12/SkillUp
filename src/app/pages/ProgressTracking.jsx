import { DashboardCard } from "../components/DashboardCard";
import { ProgressBar } from "../components/ProgressBar";
import {
  TrendingUp,
  Award,
  Clock,
  CheckCircle2,
  Zap,
  Calendar,
  Target
} from "lucide-react";
import { useFetch } from "../hooks/useFetch";
import { Skeleton, SkeletonMetrics, SkeletonChart } from "../components/ui/Skeleton";
import { MiniChart } from "../components/ui/MiniChart";
import { GlowingLineChart } from "../components/ui/GlowingLineChart";
import { GitHubCalendar } from "../components/ui/GitHubCalendar";

export default function ProgressTracking() {
  const { data, loading } = useFetch('/api/learner/progress-stats');
  const { data: streakData } = useFetch('/api/activity/streak');

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-7 w-52" />
          <Skeleton className="h-4 w-72" />
        </div>
        <SkeletonMetrics count={4} />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonChart height="h-72" />
          <SkeletonChart height="h-72" />
        </div>
      </div>
    );
  }

  const stats = data || {};
  const courseProgress = stats.courseProgress || [];
  const recentActivity = stats.recentActivity || [];
  const weeklyProgress = stats.weeklyProgress || [];
  const activityData = stats.activityData || [];

  const activeDays = new Set(streakData || []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Progress Tracking</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Monitor your learning activity and performance</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <DashboardCard>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Learning Hours</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-2">{stats.totalHours || 0}</p>
              <p className="text-xs text-green-700 dark:text-green-300 dark:text-green-300 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +{stats.hoursThisWeek || 0} hrs this week
              </p>
            </div>
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-indigo-700 dark:text-indigo-300 dark:text-indigo-300 dark:text-indigo-400" />
            </div>
          </div>
        </DashboardCard>

        <DashboardCard>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Completion Rate</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-2">{stats.completionRate || 0}%</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stats.completed || 0}/{stats.totalCourses || 0} courses</p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/40 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-green-700 dark:text-green-300 dark:text-green-300 dark:text-green-400" />
            </div>
          </div>
        </DashboardCard>

        <DashboardCard>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Days Active</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-2">{activeDays.size}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">in the last 30 days</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/40 rounded-lg flex items-center justify-center">
              <Zap className="w-6 h-6 text-yellow-700 dark:text-yellow-300 dark:text-yellow-300 dark:text-yellow-400" />
            </div>
          </div>
        </DashboardCard>

        <DashboardCard>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Achievements</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-2">{stats.achievements || 0}</p>
              <p className="text-xs text-green-700 dark:text-green-300 dark:text-green-300 mt-1">Earned so far</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/40 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-purple-700 dark:text-purple-300 dark:text-purple-300 dark:text-purple-400" />
            </div>
          </div>
        </DashboardCard>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Learning Progress (Glowing Line Chart) */}
        <DashboardCard
          title="Learning Progress"
          subtitle="Recent weeks completion rate"
        >
          <GlowingLineChart
            data={weeklyProgress}
            dataKey="completion"
            xKey="date"
            type="bump"
            height={200}
            stroke="#6366f1"
            unit="%"
            showDots={true}
          />
        </DashboardCard>

        {/* Activity Breakdown */}
        <DashboardCard
          title="Activity Breakdown"
          subtitle="Last 6 months frequency"
        >
          <MiniChart
            data={activityData}
            xKey="month"
            bars={[
              { key: "courses", name: "Courses", color: "#6366f1" },
              { key: "assessments", name: "Assessments", color: "#a855f7" },
              { key: "projects", name: "Projects", color: "#14b8a6" },
            ]}
            height={200}
            unit="items"
            showGrid={true}
            showXAxis={true}
            showYAxis={true}
            showStats={true}
            showLegend={true}
          />
        </DashboardCard>
      </div>

      {/* Study Hours */}
      <DashboardCard
        title="Study Hours"
        subtitle="Weekly study frequency and dedication"
      >
        <MiniChart
          data={weeklyProgress}
          xKey="date"
          dataKey="hours"
          unit="hrs"
          height={180}
          barColor="#6366f1"
          accentColor="#a855f7"
          showGrid={true}
          showXAxis={true}
          showYAxis={true}
          showStats={true}
        />
      </DashboardCard>

      {/* Progress Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Course Completion */}
        <DashboardCard title="Course Completion Status">
          <div className="space-y-4">
            {courseProgress.length > 0 ? courseProgress.map((item, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{item.course}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${item.status === "Completed" ? "bg-green-100 text-green-700 dark:text-green-300 dark:bg-green-900/40 dark:text-green-400" :
                      item.status === "In Progress" ? "bg-blue-100 text-blue-700 dark:text-blue-300 dark:bg-blue-900/40 dark:text-blue-400" :
                        "bg-gray-50 dark:bg-slate-800 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                    }`}>
                    {item.status}
                  </span>
                </div>
                <ProgressBar
                  value={item.progress}
                  showPercentage={true}
                  variant={item.progress === 100 ? "success" : item.progress > 0 ? "default" : "warning"}
                  size="sm"
                />
              </div>
            )) : (
              <p className="text-sm text-gray-400 text-center py-6">No course enrollments yet. Generate a learning path to get started!</p>
            )}
          </div>
        </DashboardCard>

        {/* Recent Activity Timeline */}
        <DashboardCard title="Recent Activity" subtitle="Based on your enrollments">
          <div className="space-y-3">
            {recentActivity.length > 0 ? recentActivity.map((activity, idx) => (
              <div key={idx} className="flex items-start gap-3 pb-3 border-b border-gray-200 dark:border-slate-700 last:border-0 last:pb-0">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${activity.type === "course" ? "bg-indigo-100 dark:bg-indigo-900/40" :
                    activity.type === "assessment" ? "bg-purple-100 dark:bg-purple-900/40" :
                      activity.type === "project" ? "bg-teal-100 dark:bg-teal-900/40" :
                        "bg-yellow-100 dark:bg-yellow-900/40"
                  }`}>
                  {activity.type === "course" && <CheckCircle2 className="w-4 h-4 text-indigo-700 dark:text-indigo-300 dark:text-indigo-300 dark:text-indigo-400" />}
                  {activity.type === "assessment" && <Target className="w-4 h-4 text-purple-700 dark:text-purple-300 dark:text-purple-300 dark:text-purple-400" />}
                  {activity.type === "project" && <Calendar className="w-4 h-4 text-teal-700 dark:text-teal-300 dark:text-teal-300 dark:text-teal-400" />}
                  {activity.type === "achievement" && <Award className="w-4 h-4 text-yellow-700 dark:text-yellow-300 dark:text-yellow-300 dark:text-yellow-400" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900 dark:text-gray-100">{activity.action}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{activity.time}</p>
                </div>
              </div>
            )) : (
              <p className="text-sm text-gray-400 text-center py-6">No recent activity yet.</p>
            )}
          </div>
        </DashboardCard>
      </div>

      {/* Daily Activity Calendar */}
      <DashboardCard
        title="Daily Activity"
        subtitle="learning activity history"
      >
        <GitHubCalendar
          data={streakData || []}
          weeksToShow={24}
          colorTheme="emerald"
          showStats={true}
          showLegend={true}
          showMonthLabels={true}
          showDayLabels={true}
        />
      </DashboardCard>
    </div>
  );
}
