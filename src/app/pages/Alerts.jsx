import { useState, useEffect } from "react";
import { DashboardCard } from "../components/DashboardCard";
import { AlertTriangle, Clock, TrendingDown, AlertCircle, Info, CheckCircle2 } from "lucide-react";

import { useFetch, apiCall } from "../hooks/useFetch";

const riskIndicators = [
  { metric: "Attendance", value: 85, status: "good", trend: "up" },
  { metric: "Completion Rate", value: 72, status: "warning", trend: "down" },
  { metric: "Assessment Scores", value: 88, status: "good", trend: "up" },
  { metric: "Engagement", value: 65, status: "warning", trend: "down" },
];

export default function Alerts() {
  const { data: fetchedNotifications, loading } = useFetch('/api/notifications');
  const [notifications, setNotifications] = useState(null);

  // Sync fetched data into local state once
  useEffect(() => {
    if (fetchedNotifications) setNotifications(fetchedNotifications);
  }, [fetchedNotifications]);

  const handleMarkAsRead = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await apiCall(`/api/notifications/${id}/read`, 'PUT');
      // Update locally — no refetch, no scroll jump
      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, read: true } : n)
      );
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-6 text-center text-gray-500 dark:text-gray-400">Loading alerts...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Alerts & Notifications</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Early warning system to keep you on track</p>
      </div>

      {/* Risk Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {riskIndicators.map((indicator, idx) => (
          <DashboardCard key={idx}>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{indicator.metric}</p>
              <div className="flex items-end gap-2 mt-2">
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">{indicator.value}%</p>
                <div className={`flex items-center gap-1 mb-1 ${
                  indicator.status === "good" ? "text-green-600" : "text-yellow-600"
                }`}>
                  {indicator.trend === "up" ? "↑" : "↓"}
                  <span className="text-xs font-medium">
                    {indicator.status === "good" ? "Good" : "Attention"}
                  </span>
                </div>
              </div>
            </div>
          </DashboardCard>
        ))}
      </div>

      {/* Alert List */}
      <DashboardCard title="All Alerts" subtitle="Recent notifications and warnings">
        <div className="space-y-4">
          {notifications?.map((alert, idx) => {
            const Icon = alert.type === 'reminder' ? Clock : alert.type === 'achievement' ? CheckCircle2 : Info;
            const colorClasses = {
              critical: { bg: "bg-red-50 dark:bg-red-900/30", border: "border-red-200 dark:border-red-900/50", icon: "text-red-600 dark:text-red-400", iconBg: "bg-red-100 dark:bg-red-900/50" },
              warning: { bg: "bg-yellow-50 dark:bg-yellow-900/30", border: "border-yellow-200 dark:border-yellow-900/50", icon: "text-yellow-600 dark:text-yellow-400", iconBg: "bg-yellow-100 dark:bg-yellow-900/50" },
              info: { bg: "bg-blue-50 dark:bg-indigo-900/30", border: "border-blue-200 dark:border-indigo-900/50", icon: "text-blue-600 dark:text-indigo-400", iconBg: "bg-blue-100 dark:bg-indigo-900/50" },
              success: { bg: "bg-green-50 dark:bg-green-900/30", border: "border-green-200 dark:border-green-900/50", icon: "text-green-600 dark:text-green-400", iconBg: "bg-green-100 dark:bg-green-900/50" },
              system: { bg: "bg-gray-50 dark:bg-slate-800", border: "border-gray-200 dark:border-slate-700", icon: "text-gray-600 dark:text-gray-400", iconBg: "bg-gray-200 dark:bg-slate-700" },
              reminder: { bg: "bg-yellow-50 dark:bg-yellow-900/30", border: "border-yellow-200 dark:border-yellow-900/50", icon: "text-yellow-600 dark:text-yellow-400", iconBg: "bg-yellow-100 dark:bg-yellow-900/50" },
              achievement: { bg: "bg-green-50 dark:bg-green-900/30", border: "border-green-200 dark:border-green-900/50", icon: "text-green-600 dark:text-green-400", iconBg: "bg-green-100 dark:bg-green-900/50" }
            }[alert.type] || { bg: "bg-blue-50 dark:bg-indigo-900/30", border: "border-blue-200 dark:border-indigo-900/50", icon: "text-blue-600 dark:text-indigo-400", iconBg: "bg-blue-100 dark:bg-indigo-900/50" };

            return (
              <div key={alert._id} className={`p-4 rounded-lg border ${colorClasses.bg} ${colorClasses.border} ${alert.read ? 'opacity-50' : ''}`}>
                <div className="flex gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${colorClasses.iconBg}`}>
                    <Icon className={`w-5 h-5 ${colorClasses.icon}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        {alert.title} 
                        {alert.read && <span className="text-xs font-normal text-gray-500 dark:text-gray-400">(Read)</span>}
                      </h4>
                      <span className="text-xs text-gray-600 dark:text-gray-400">{new Date(alert.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{alert.message}</p>
                    <div className="flex gap-2">
                      {!alert.read && (
                        <button
                          onClick={(e) => handleMarkAsRead(e, alert._id)}
                          className="px-3 py-1.5 text-sm font-medium bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          Mark as Read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </DashboardCard>

      {/* Suggested Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DashboardCard title="Immediate Actions">
          <div className="space-y-2">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg border border-red-200">
              <p className="text-sm font-medium text-gray-900 dark:text-white">Complete overdue assignment</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Due 2 days ago</p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg border border-yellow-200">
              <p className="text-sm font-medium text-gray-900 dark:text-white">Review TypeScript basics</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Assessment score below target</p>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard title="This Week">
          <div className="space-y-2">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg border border-blue-200">
              <p className="text-sm font-medium text-gray-900 dark:text-white">Complete 3 pending modules</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">To stay on track</p>
            </div>
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg border border-indigo-200">
              <p className="text-sm font-medium text-gray-900 dark:text-white">Take skill assessment</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Validate your progress</p>
            </div>
          </div>
        </DashboardCard>

        <DashboardCard title="Recommendations">
          <div className="space-y-2">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg border border-purple-200">
              <p className="text-sm font-medium text-gray-900 dark:text-white">Join study group</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Improve engagement</p>
            </div>
            <div className="p-3 bg-teal-100 dark:bg-teal-900/30 rounded-lg border border-teal-200">
              <p className="text-sm font-medium text-gray-900 dark:text-white">Schedule counselor session</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">Get personalized guidance</p>
            </div>
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}
