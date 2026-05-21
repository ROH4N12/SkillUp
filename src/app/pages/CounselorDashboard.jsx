import { useState, useMemo } from "react";
import { DashboardCard } from "../components/DashboardCard";
import { ProgressBar } from "../components/ProgressBar";
import {
  Users, TrendingUp, AlertTriangle, Award, Search, X, Send,
  Mail, MapPin, Phone, BookOpen, Target, Clock
} from "lucide-react";
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

import { useFetch, apiCall } from "../hooks/useFetch";

export default function CounselorDashboard() {
  const { data, loading, refetch } = useFetch('/api/counselor/dashboard');
  const [sendingTo, setSendingTo] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLearnerId, setSelectedLearnerId] = useState(null);
  const [learnerDetail, setLearnerDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const learnerData = data?.learners || [];
  const activeLearners = data?.activeLearners || 0;
  const avgEngagement = data?.avgEngagement || 0;
  const placementReady = learnerData.filter(l => l.readiness > 70).length;
  const atRiskLearners = learnerData.filter(l => l.risk === "High" || l.risk === "Medium");

  // Real skill gap distribution from server
  const skillGapData = data?.skillGapDistribution || [
    { name: "Excellent", value: 0, color: "#10b981" },
    { name: "Good", value: 0, color: "#6366f1" },
    { name: "Needs Work", value: 0, color: "#f59e0b" },
    { name: "Critical", value: 0, color: "#ef4444" },
  ];

  // ── Search filter (must be called before any early return) ─────────
  const filteredLearners = useMemo(() => {
    if (!searchQuery.trim()) return learnerData;
    const q = searchQuery.toLowerCase();
    return learnerData.filter(l =>
      l.name.toLowerCase().includes(q) ||
      l.learningPath?.toLowerCase().includes(q) ||
      l.risk.toLowerCase().includes(q) ||
      l.status.toLowerCase().includes(q)
    );
  }, [learnerData, searchQuery]);

  if (loading) return <div className="p-6 text-center text-gray-500 dark:text-gray-400">Loading counselor dashboard...</div>;

  // ── Readiness distribution (from filtered data) ────────────────────
  const readinessDistribution = [
    { range: "90-100%", count: learnerData.filter(l => l.readiness >= 90).length },
    { range: "75-89%", count: learnerData.filter(l => l.readiness >= 75 && l.readiness < 90).length },
    { range: "60-74%", count: learnerData.filter(l => l.readiness >= 60 && l.readiness < 75).length },
    { range: "Below 60%", count: learnerData.filter(l => l.readiness < 60).length },
  ];

  // ── Notification sending ───────────────────────────────────────────
  const handleSendNotification = async (learnerId, learnerName) => {
    const message = window.prompt(`Send a message to ${learnerName}:`);
    if (!message) return;
    setSendingTo(learnerId);
    try {
      await apiCall('/api/notifications/send', 'POST', {
        userId: learnerId,
        title: `Counselor Recommendation`,
        message,
        type: 'counselor',
      });
      alert(`Notification sent to ${learnerName}!`);
    } catch (err) {
      alert('Failed to send notification');
    } finally {
      setSendingTo(null);
    }
  };

  // ── View Details ───────────────────────────────────────────────────
  const handleViewDetails = async (learnerId) => {
    setSelectedLearnerId(learnerId);
    setDetailLoading(true);
    try {
      const detail = await apiCall(`/api/counselor/learner/${learnerId}`);
      setLearnerDetail(detail);
    } catch (err) {
      setLearnerDetail(null);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetailModal = () => {
    setSelectedLearnerId(null);
    setLearnerDetail(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Counselor Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Monitor and support multiple learners</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <DashboardCard>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Learners</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-2">{activeLearners}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Assigned to you</p>
            </div>
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-indigo-700 dark:text-indigo-300 dark:text-indigo-300 dark:text-indigo-400" />
            </div>
          </div>
        </DashboardCard>

        <DashboardCard>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Avg. Readiness</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-2">{avgEngagement}%</p>
              <p className="text-xs text-green-700 dark:text-green-300 dark:text-green-300 mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Live Data
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/40 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-700 dark:text-green-300 dark:text-green-300 dark:text-green-400" />
            </div>
          </div>
        </DashboardCard>

        <DashboardCard>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">At Risk</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-2">{atRiskLearners.length}</p>
              <p className="text-xs text-red-700 dark:text-red-300 dark:text-red-300 mt-1">Need attention</p>
            </div>
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/40 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-red-700 dark:text-red-300 dark:text-red-300 dark:text-red-400" />
            </div>
          </div>
        </DashboardCard>

        <DashboardCard>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Placement Ready</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-2">{placementReady}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">&gt;70% readiness</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/40 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-purple-700 dark:text-purple-300 dark:text-purple-300 dark:text-purple-400" />
            </div>
          </div>
        </DashboardCard>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardCard title="Readiness Score Distribution">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={readinessDistribution}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="range" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip />
              <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </DashboardCard>

        <DashboardCard title="Skill Gap Analytics">
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={skillGapData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {skillGapData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </DashboardCard>
      </div>

      {/* Learner List Table */}
      <DashboardCard
        title="Learner Overview"
        subtitle="All assigned learners"
        action={
          <div className="flex items-center gap-2 bg-gray-50 dark:bg-slate-800 dark:bg-gray-700 rounded-lg px-3 py-2">
            <Search className="w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search learners..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-sm w-48 dark:text-white"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery("")}>
                <X className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:text-gray-400" />
              </button>
            )}
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-slate-700">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Learner Name</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Learning Path</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Readiness</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Courses</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Skill Gap</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Risk</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLearners.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-sm text-gray-400">
                    {searchQuery ? `No learners matching "${searchQuery}"` : "No learners found"}
                  </td>
                </tr>
              ) : (
                filteredLearners.map((learner, idx) => (
                  <tr key={learner._id || idx} className="border-b border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-medium">
                            {learner.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{learner.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">
                      {learner.learningPath || '—'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="w-32">
                        <ProgressBar
                          value={learner.readiness}
                          showPercentage={true}
                          variant={
                            learner.readiness > 70 ? "success" :
                            learner.readiness >= 40 ? "default" :
                            "danger"
                          }
                          size="sm"
                        />
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{learner.courses}</td>
                    <td className="py-3 px-4">
                      <span className={`text-sm font-medium ${
                        learner.skillGap <= 3 ? "text-green-600" :
                        learner.skillGap <= 6 ? "text-yellow-600" :
                        "text-red-600"
                      }`}>
                        {learner.skillGap} skills
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        learner.risk === "Low" ? "bg-green-100 text-green-700 dark:text-green-300 dark:bg-green-900/40 dark:text-green-400" :
                        learner.risk === "Medium" ? "bg-yellow-100 text-yellow-700 dark:text-yellow-300 dark:bg-yellow-900/40 dark:text-yellow-400" :
                        "bg-red-100 text-red-700 dark:text-red-300 dark:bg-red-900/40 dark:text-red-400"
                      }`}>
                        {learner.risk}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700 dark:text-gray-300">{learner.status}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDetails(learner._id)}
                          className="text-sm text-indigo-700 dark:text-indigo-300 dark:text-indigo-300 dark:text-indigo-400 hover:text-indigo-700 dark:text-indigo-300 font-medium"
                        >
                          View Details
                        </button>
                        <button
                          onClick={() => handleSendNotification(learner._id, learner.name)}
                          disabled={sendingTo === learner._id}
                          className="p-1.5 text-gray-400 hover:text-indigo-700 dark:text-indigo-300 dark:text-indigo-300 dark:hover:text-indigo-400 disabled:opacity-50"
                          title="Send message"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </DashboardCard>

      {/* Risk Alerts Panel */}
      <DashboardCard title="Priority Alerts" subtitle="Learners needing immediate attention">
        <div className="space-y-3">
          {atRiskLearners.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">🎉 No at-risk learners — everyone is making good progress!</p>
          ) : (
            atRiskLearners.map((learner, idx) => (
              <div key={learner._id || idx} className={`p-4 rounded-lg border ${
                learner.risk === "High" ? "bg-red-100 dark:bg-red-900/30 dark:bg-red-900/20 border-red-200 dark:border-red-800 dark:border-red-800" : "bg-yellow-100 dark:bg-yellow-900/30 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 dark:border-yellow-800"
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <AlertTriangle className={`w-5 h-5 ${
                        learner.risk === "High" ? "text-red-600" : "text-yellow-600"
                      }`} />
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">{learner.name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        learner.risk === "High" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {learner.risk} Risk
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                      {learner.risk === "High"
                        ? `Readiness score at ${learner.readiness}%, ${learner.skillGap} critical skill gaps identified.`
                        : `Progress at ${learner.readiness}%, ${learner.skillGap} skills need attention.`
                      }
                    </p>
                    {learner.missingSkills?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {learner.missingSkills.slice(0, 5).map((skill, i) => (
                          <span key={i} className="px-2 py-0.5 text-xs bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-gray-600 rounded text-gray-500 dark:text-gray-400">
                            {skill}
                          </span>
                        ))}
                        {learner.missingSkills.length > 5 && (
                          <span className="px-2 py-0.5 text-xs text-gray-500 dark:text-gray-400">+{learner.missingSkills.length - 5} more</span>
                        )}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewDetails(learner._id)}
                        className="px-3 py-1.5 text-sm font-medium bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100"
                      >
                        View Profile
                      </button>
                      <button
                        onClick={() => handleSendNotification(learner._id, learner.name)}
                        disabled={sendingTo === learner._id}
                        className="px-3 py-1.5 text-sm font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
                      >
                        {sendingTo === learner._id ? 'Sending...' : 'Send Recommendation'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </DashboardCard>

      {/* ── Learner Detail Modal ──────────────────────────────────────── */}
      {selectedLearnerId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={closeDetailModal}>
          <div
            className="bg-gray-50 dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {detailLoading ? (
              <div className="p-12 text-center text-gray-500 dark:text-gray-400">Loading learner details...</div>
            ) : learnerDetail ? (
              <div>
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-lg font-semibold">
                        {learnerDetail.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{learnerDetail.name}</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{learnerDetail.email}</p>
                    </div>
                  </div>
                  <button onClick={closeDetailModal} className="p-2 hover:bg-gray-50 dark:bg-slate-800 dark:hover:bg-gray-700 rounded-lg">
                    <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>

                {/* Profile Info */}
                <div className="p-6 space-y-6">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
                      <p className="text-xl font-semibold text-indigo-700 dark:text-indigo-300 dark:text-indigo-300 dark:text-indigo-400">{learnerDetail.readiness}%</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Readiness</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
                      <p className="text-xl font-semibold text-green-600">{learnerDetail.completed}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Completed</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
                      <p className="text-xl font-semibold text-yellow-600">{learnerDetail.inProgress}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">In Progress</p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-center">
                      <p className="text-xl font-semibold text-red-600">{learnerDetail.missingSkills?.length || 0}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Skill Gaps</p>
                    </div>
                  </div>

                  {/* Personal Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {learnerDetail.careerGoal && (
                      <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <Target className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">Goal:</span> {learnerDetail.careerGoal}
                      </div>
                    )}
                    {learnerDetail.location && (
                      <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">Location:</span> {learnerDetail.location}
                      </div>
                    )}
                    {learnerDetail.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">Phone:</span> {learnerDetail.phone}
                      </div>
                    )}
                    {learnerDetail.joinedAt && (
                      <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="font-medium">Joined:</span> {new Date(learnerDetail.joinedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  {/* Learning Path */}
                  {learnerDetail.learningPath && (
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        {learnerDetail.learningPath.title}
                      </h3>
                      {learnerDetail.learningPath.stages?.map((stage, si) => (
                        <div key={si} className="mb-4">
                          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">{stage.stageName}</p>
                          <div className="space-y-2">
                            {stage.courses.map((course, ci) => (
                              <div key={ci} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                                <div className="flex-1 mr-4">
                                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{course.title}</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">{course.status}</p>
                                </div>
                                <div className="w-32">
                                  <ProgressBar
                                    value={course.progress}
                                    showPercentage={true}
                                    variant={course.progress === 100 ? "success" : course.progress > 0 ? "default" : "danger"}
                                    size="sm"
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Skills */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">✅ Acquired Skills</h4>
                      <div className="flex flex-wrap gap-1">
                        {learnerDetail.acquiredSkills?.length > 0 ? learnerDetail.acquiredSkills.map((s, i) => (
                          <span key={i} className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 dark:text-green-400 rounded">{s}</span>
                        )) : (
                          <span className="text-xs text-gray-400">No skills acquired yet</span>
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">⚠️ Missing Skills</h4>
                      <div className="flex flex-wrap gap-1">
                        {learnerDetail.missingSkills?.length > 0 ? learnerDetail.missingSkills.map((s, i) => (
                          <span key={i} className="px-2 py-1 text-xs bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 dark:text-red-400 rounded">{s}</span>
                        )) : (
                          <span className="text-xs text-gray-400">All skills acquired!</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Send Notification from modal */}
                  <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
                    <button
                      onClick={() => handleSendNotification(learnerDetail._id, learnerDetail.name)}
                      disabled={sendingTo === learnerDetail._id}
                      className="w-full px-4 py-2.5 text-sm font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Mail className="w-4 h-4" />
                      {sendingTo === learnerDetail._id ? 'Sending...' : 'Send Notification to Learner'}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-12 text-center text-gray-500 dark:text-gray-400">Failed to load learner details.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
