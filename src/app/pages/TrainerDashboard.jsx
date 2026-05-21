import { useState, useEffect } from "react";
import { DashboardCard } from "../components/DashboardCard";
import { ProgressBar } from "../components/ProgressBar";
import { BookOpen, Users, TrendingDown, Award, Activity, CheckCircle, ChevronDown, ChevronUp, Search, X, Map, BarChart3 } from "lucide-react";
import {
  BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

import { useFetch, apiCall } from "../hooks/useFetch";

export default function TrainerDashboard() {
  const { data: dashboardData, loading } = useFetch('/api/trainer/dashboard');
  const [coursesData, setCoursesData] = useState([]);
  const [studentsData, setStudentsData] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [sendingTo, setSendingTo] = useState(null);
  const [expandedUser, setExpandedUser] = useState(null);
  const [search, setSearch] = useState("");
  const [courseSearch, setCourseSearch] = useState("");
  const [showAllUsers, setShowAllUsers] = useState(false);
  const [showAllCourses, setShowAllCourses] = useState(false);

  // Analytics modal state
  const [analyticsModal, setAnalyticsModal] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Learning path modal state
  const [pathModal, setPathModal] = useState(null);
  const [pathLoading, setPathLoading] = useState(false);

  useEffect(() => {
    const fetchTrainerData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };
        
        // Fetch courses
        const coursesRes = await fetch('http://localhost:5000/api/trainer/courses', { headers });
        if (coursesRes.ok) setCoursesData(await coursesRes.json());
        
        // Fetch students
        const studentsRes = await fetch('http://localhost:5000/api/trainer/students', { headers });
        if (studentsRes.ok) setStudentsData(await studentsRes.json());
        
      } catch (e) {
        console.error("Failed to fetch trainer data", e);
      } finally {
        setLoadingCourses(false);
        setLoadingStudents(false);
      }
    };
    fetchTrainerData();
  }, []);

  if (loading) return <div className="p-6 text-center text-gray-500 dark:text-gray-400">Loading trainer stats...</div>;

  const courseStats = dashboardData?.courseStats || [];
  const performanceData = dashboardData?.performanceData || [];

  // ── Direct notification sending using learner _id ──────────────────
  const handleSendAlert = async (learner, idx) => {
    const message = window.prompt(`Send an alert to ${learner.name}:`);
    if (!message) return;

    if (!learner._id) {
      alert('Cannot send notification: learner ID unavailable');
      return;
    }

    setSendingTo(idx);
    try {
      await apiCall('/api/notifications/send', 'POST', {
        userId: learner._id,
        title: 'Trainer Alert',
        message,
        type: 'trainer',
      });
      alert(`Alert sent to ${learner.name}!`);
    } catch (err) {
      alert('Failed to send alert');
    } finally {
      setSendingTo(null);
    }
  };

  // ── Fetch course analytics ──────────────────────────────────────────
  const handleViewAnalytics = async (courseId, courseName) => {
    setAnalyticsLoading(true);
    setAnalyticsModal({ courseName, loading: true });
    try {
      const data = await apiCall(`/api/trainer/course-analytics/${courseId}`);
      setAnalyticsModal({ ...data, loading: false });
    } catch {
      setAnalyticsModal({ courseName, error: true, loading: false });
    } finally {
      setAnalyticsLoading(false);
    }
  };

  // ── Fetch learner learning path ───────────────────────────────────
  const handleViewPath = async (userId, learnerName) => {
    setPathLoading(true);
    setPathModal({ learnerName, loading: true });
    try {
      const data = await apiCall(`/api/trainer/learning-path/${userId}`);
      setPathModal({ ...data, loading: false });
    } catch {
      setPathModal({ learnerName, error: true, loading: false });
    } finally {
      setPathLoading(false);
    }
  };

  const filteredUsers = studentsData
    .map(user => {
      const searchLower = search.toLowerCase();
      const filteredCourses = user.courses.filter(course =>
        course.title.toLowerCase().includes(searchLower)
      );

      if (
        user.name.toLowerCase().includes(searchLower) ||
        filteredCourses.length > 0
      ) {
        return {
          ...user,
          courses: filteredCourses.length > 0 ? filteredCourses : user.courses
        };
      }

      return null;
    })
    .filter(Boolean);
  const filteredCoursesList = coursesData?.filter(course =>
    course.courseName.toLowerCase().includes(courseSearch.toLowerCase())
  );

  const VISIBLE_LIMIT = 5;
  const visibleUsers = showAllUsers ? filteredUsers : filteredUsers.slice(0, VISIBLE_LIMIT);
  const visibleCourses = showAllCourses ? filteredCoursesList : filteredCoursesList?.slice(0, VISIBLE_LIMIT);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Trainer Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Track course effectiveness and learner performance</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <DashboardCard>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Active Courses</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-2">{dashboardData?.activeCourses || 0}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">In the system</p>
            </div>
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-indigo-700 dark:text-indigo-300 dark:text-indigo-300 dark:text-indigo-400" />
            </div>
          </div>
        </DashboardCard>

        <DashboardCard>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Students</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-2">{dashboardData?.activeStudents || 0}</p>
              <p className="text-xs text-green-700 dark:text-green-300 dark:text-green-300 mt-1 flex items-center gap-1">
                <Activity className="w-3 h-3" />
                {dashboardData?.activeLearners || 0} active
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/40 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-green-700 dark:text-green-300 dark:text-green-300 dark:text-green-400" />
            </div>
          </div>
        </DashboardCard>

        <DashboardCard>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Avg. Completion</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-2">
                {coursesData?.length ? Math.round(coursesData.reduce((acc, c) => acc + c.avgCompletion, 0) / coursesData.length) : (dashboardData?.courseCompletion || 0)}%
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-green-500" />
                {dashboardData?.completedEnrollments || 0} completed
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/40 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-yellow-700 dark:text-yellow-300 dark:text-yellow-300 dark:text-yellow-400" />
            </div>
          </div>
        </DashboardCard>

        <DashboardCard>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Avg. Score</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mt-2">
                {coursesData?.length ? Math.round(coursesData.reduce((acc, c) => acc + c.avgScore, 0) / coursesData.length) : (dashboardData?.avgAssessmentScore || 0)}%
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Across all courses</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/40 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-purple-700 dark:text-purple-300 dark:text-purple-300 dark:text-purple-400" />
            </div>
          </div>
        </DashboardCard>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardCard title="Course Completion Statistics">
          {courseStats.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={courseStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="course" stroke="#9ca3af" fontSize={11} angle={-20} textAnchor="end" height={80} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip />
                <Legend />
                <Bar dataKey="completion" fill="#6366f1" name="Completion %" radius={[4, 4, 0, 0]} />
                <Bar dataKey="avgScore" fill="#a855f7" name="Avg Score %" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-400 text-center py-12">No course enrollment data yet.</p>
          )}
        </DashboardCard>

        <DashboardCard title="Performance Trends" subtitle="Last 6 weeks (real data)">
          {performanceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="week" stroke="#9ca3af" fontSize={12} />
                <YAxis stroke="#9ca3af" fontSize={12} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="engagement" stroke="#6366f1" strokeWidth={2} name="Engagement %" />
                <Line type="monotone" dataKey="completion" stroke="#14b8a6" strokeWidth={2} name="Completion %" />
                <Line type="monotone" dataKey="avgScore" stroke="#a855f7" strokeWidth={2} name="Avg Score %" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-400 text-center py-12">No performance data yet.</p>
          )}
        </DashboardCard>
      </div>

      {/* Course Performance Details */}
      <DashboardCard title="Course Performance Details">
        <div className="mb-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search courses..."
            value={courseSearch}
            onChange={(e) => setCourseSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-800/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
          />
        </div>
        <div className="space-y-4">
          {loadingCourses ? (
            <p className="text-sm text-gray-400 text-center py-8">Loading courses...</p>
          ) : visibleCourses?.length > 0 ? visibleCourses.map((course, idx) => (
            <div key={idx} className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">{course.courseName}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{course.students} students enrolled</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Avg Score</div>
                  <div className="text-xl font-semibold text-indigo-700 dark:text-indigo-300 dark:text-indigo-300 dark:text-indigo-400">{course.avgScore}%</div>
                </div>
              </div>
              <div className="space-y-2">
                <ProgressBar
                  value={course.avgCompletion}
                  label="Completion Rate"
                  variant={course.avgCompletion >= 75 ? "success" : course.avgCompletion >= 60 ? "default" : "warning"}
                />
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleViewAnalytics(course.courseId, course.courseName)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  View Analytics
                </button>
              </div>
            </div>
          )) : (
            <p className="text-sm text-gray-400 text-center py-8">
              {courseSearch ? "No courses found matching your search." : "No course data available. Students need to enroll in courses first."}
            </p>
          )}
        </div>
        {filteredCoursesList?.length > VISIBLE_LIMIT && (
          <div className="mt-4 text-center">
            <button
              onClick={() => setShowAllCourses(prev => !prev)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-indigo-700 dark:text-indigo-300 dark:text-indigo-300 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/30 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 dark:border-indigo-800 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
            >
              {showAllCourses ? (
                <><ChevronUp className="w-4 h-4" /> Show Less</>
              ) : (
                <><ChevronDown className="w-4 h-4" /> View More ({filteredCoursesList.length - VISIBLE_LIMIT} more)</>
              )}
            </button>
          </div>
        )}
      </DashboardCard>

      {/* Enrolled Learners Roster */}
      <DashboardCard title="Enrolled Learners">
        <div className="mb-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search learners or courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-gray-50 dark:bg-slate-800/50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
          />
        </div>
        <div className="space-y-3">
          {loadingStudents ? (
            <p className="text-sm text-gray-400 text-center py-8">Loading learners...</p>
          ) : visibleUsers.length > 0 ? visibleUsers.map((learner) => (
            <div key={learner._id} className="p-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg">
              <div 
                className="flex items-start justify-between cursor-pointer"
                onClick={() => setExpandedUser(expandedUser === learner._id ? null : learner._id)}
              >
                <div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center cursor-default">
                      <span className="text-white text-xs font-medium">
                        {learner.name ? learner.name.charAt(0).toUpperCase() : 'U'}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        {learner.name}
                        {expandedUser === learner._id ? <ChevronUp className="w-4 h-4 text-gray-500 dark:text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {learner.courses.length} Enrolled Course{learner.courses.length !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSendAlert(learner, learner._id);
                    }}
                    disabled={sendingTo === learner._id}
                    className="px-3 py-1.5 text-sm font-medium bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:bg-slate-800 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 disabled:opacity-50"
                  >
                    {sendingTo === learner._id ? 'Sending...' : 'Message'}
                  </button>
                </div>
              </div>
              
              {expandedUser === learner._id && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-slate-700 space-y-4 cursor-default" onClick={e => e.stopPropagation()}>
                  {learner.courses.map((course, cIdx) => (
                    <div key={cIdx} className="pl-11">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{course.title}</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{course.progress}%</span>
                      </div>
                      <ProgressBar
                        value={course.progress}
                        variant={course.progress >= 75 ? "success" : course.progress >= 60 ? "default" : "warning"}
                        size="sm"
                        showPercentage={false}
                      />
                    </div>
                  ))}
                  <div className="pl-11 pt-2">
                    <button
                      onClick={() => handleViewPath(learner._id, learner.name)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-indigo-700 dark:text-indigo-300 dark:text-indigo-300 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/30 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 dark:border-indigo-800 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
                    >
                      <Map className="w-3.5 h-3.5" />
                      View Learning Path
                    </button>
                  </div>
                </div>
              )}
            </div>
          )) : (
            <p className="text-sm text-gray-400 text-center py-8">
              {search ? "No learners or courses found matching your search." : "No learners currently enrolled in your courses."}
            </p>
          )}
        </div>
        {filteredUsers.length > VISIBLE_LIMIT && (
          <div className="mt-4 text-center">
            <button
              onClick={() => setShowAllUsers(prev => !prev)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-indigo-700 dark:text-indigo-300 dark:text-indigo-300 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/30 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 dark:border-indigo-800 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
            >
              {showAllUsers ? (
                <><ChevronUp className="w-4 h-4" /> Show Less</>
              ) : (
                <><ChevronDown className="w-4 h-4" /> View More ({filteredUsers.length - VISIBLE_LIMIT} more)</>
              )}
            </button>
          </div>
        )}
      </DashboardCard>

      {/* Curriculum Suggestions */}
      <DashboardCard title="Curriculum Improvement Suggestions">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-blue-100 dark:bg-blue-900/30 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 dark:border-blue-800 rounded-lg">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Low Performance Areas</h4>
            <ul className="space-y-2">
              {coursesData.filter(c => c.avgScore < 50 && c.students > 0).length > 0
                ? coursesData.filter(c => c.avgScore < 50 && c.students > 0).map((c, i) => (
                    <li key={i} className="text-sm text-gray-700 dark:text-gray-300">• {c.courseName}</li>
                  ))
                : <li className="text-sm text-gray-700 dark:text-gray-300">• All courses have good scores</li>}
            </ul>
          </div>

          <div className="p-4 bg-purple-100 dark:bg-purple-900/30 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 dark:border-purple-800 rounded-lg">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Low Engagement</h4>
            <ul className="space-y-2">
              {coursesData.filter(c => c.avgCompletion < 40 && c.students > 0).length > 0
                ? coursesData.filter(c => c.avgCompletion < 40 && c.students > 0).map((c, i) => (
                    <li key={i} className="text-sm text-gray-700 dark:text-gray-300">• {c.courseName}</li>
                  ))
                : <li className="text-sm text-gray-700 dark:text-gray-300">• High engagement across active courses</li>}
            </ul>
          </div>

          <div className="p-4 bg-teal-100 dark:bg-teal-900/30 dark:bg-teal-900/20 border border-teal-200 dark:border-teal-800 dark:border-teal-800 rounded-lg">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Highly Successful</h4>
            <ul className="space-y-2">
              {coursesData.filter(c => c.avgScore >= 90 && c.students > 0).length > 0
                ? coursesData.filter(c => c.avgScore >= 90 && c.students > 0).map((c, i) => (
                    <li key={i} className="text-sm text-gray-700 dark:text-gray-300">• {c.courseName}</li>
                  ))
                : <li className="text-sm text-gray-700 dark:text-gray-300">• No exceptional scores yet</li>}
            </ul>
          </div>
        </div>
      </DashboardCard>

      {/* ═══ Course Analytics Modal ═══════════════════════════════════ */}
      {analyticsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setAnalyticsModal(null)}>
          <div className="bg-gray-50 dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/40 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-indigo-700 dark:text-indigo-300 dark:text-indigo-300 dark:text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Course Analytics</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{analyticsModal.courseName}</p>
                </div>
              </div>
              <button onClick={() => setAnalyticsModal(null)} className="p-1.5 rounded-lg hover:bg-gray-50 dark:bg-slate-800 dark:hover:bg-gray-700 transition-colors">
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5">
              {analyticsModal.loading ? (
                <p className="text-sm text-gray-400 text-center py-8">Loading analytics...</p>
              ) : analyticsModal.error ? (
                <p className="text-sm text-red-400 text-center py-8">Failed to load analytics data.</p>
              ) : (
                <>
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 dark:bg-indigo-900/20 rounded-lg text-center">
                      <p className="text-xl font-semibold text-indigo-700 dark:text-indigo-300 dark:text-indigo-300 dark:text-indigo-400">{analyticsModal.totalStudents}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Total Students</p>
                    </div>
                    <div className="p-3 bg-green-100 dark:bg-green-900/30 dark:bg-green-900/20 rounded-lg text-center">
                      <p className="text-xl font-semibold text-green-700 dark:text-green-300 dark:text-green-300 dark:text-green-400">{analyticsModal.completionRate}%</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Completion Rate</p>
                    </div>
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/30 dark:bg-purple-900/20 rounded-lg text-center">
                      <p className="text-xl font-semibold text-purple-700 dark:text-purple-300 dark:text-purple-300 dark:text-purple-400">{analyticsModal.avgProgress}%</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Avg Progress</p>
                    </div>
                    <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 dark:bg-yellow-900/20 rounded-lg text-center">
                      <p className="text-xl font-semibold text-yellow-700 dark:text-yellow-300 dark:text-yellow-300 dark:text-yellow-400">{analyticsModal.inProgressCount}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">In Progress</p>
                    </div>
                  </div>

                  {/* Meta */}
                  {(analyticsModal.domain || analyticsModal.level) && (
                    <div className="flex gap-2 mb-4">
                      {analyticsModal.domain && (
                        <span className="px-2.5 py-1 text-xs font-medium bg-gray-50 dark:bg-slate-800 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">{analyticsModal.domain}</span>
                      )}
                      {analyticsModal.level && (
                        <span className="px-2.5 py-1 text-xs font-medium bg-gray-50 dark:bg-slate-800 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full">{analyticsModal.level}</span>
                      )}
                    </div>
                  )}

                  {/* Student Breakdown */}
                  {analyticsModal.students?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Student Breakdown</h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {analyticsModal.students.map((s, i) => (
                          <div key={i} className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                                <span className="text-white text-[10px] font-medium">{s.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                              </div>
                              <span className="text-sm text-gray-900 dark:text-gray-100">{s.name}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="w-24">
                                <ProgressBar value={s.progress} size="sm" showPercentage={false}
                                  variant={s.progress >= 75 ? "success" : s.progress >= 40 ? "default" : "warning"}
                                />
                              </div>
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                s.status === 'Completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 dark:text-green-400'
                                : s.status === 'In Progress' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 dark:text-blue-400'
                                : 'bg-gray-50 dark:bg-slate-800 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
                              }`}>{s.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {analyticsModal.totalStudents === 0 && (
                    <p className="text-sm text-gray-400 text-center py-4">No students enrolled in this course yet.</p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══ Learning Path Modal ══════════════════════════════════════ */}
      {pathModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setPathModal(null)}>
          <div className="bg-gray-50 dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-100 dark:bg-teal-900/40 rounded-lg flex items-center justify-center">
                  <Map className="w-5 h-5 text-teal-700 dark:text-teal-300 dark:text-teal-300 dark:text-teal-400" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{pathModal.learnerName}'s Learning Path</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{pathModal.goal || pathModal.title || ''}</p>
                </div>
              </div>
              <button onClick={() => setPathModal(null)} className="p-1.5 rounded-lg hover:bg-gray-50 dark:bg-slate-800 dark:hover:bg-gray-700 transition-colors">
                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5">
              {pathModal.loading ? (
                <p className="text-sm text-gray-400 text-center py-8">Loading learning path...</p>
              ) : pathModal.error ? (
                <p className="text-sm text-red-400 text-center py-8">Failed to load learning path data.</p>
              ) : (
                <>
                  {/* Path info badges */}
                  <div className="flex flex-wrap gap-2 mb-5">
                    {pathModal.hasPath && (
                      <span className="px-2.5 py-1 text-xs font-medium bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 dark:text-teal-400 rounded-full">AI Generated Path</span>
                    )}
                    {!pathModal.hasPath && (
                      <span className="px-2.5 py-1 text-xs font-medium bg-gray-50 dark:bg-slate-800 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-full">No Generated Path</span>
                    )}
                    {pathModal.level && (
                      <span className="px-2.5 py-1 text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 dark:text-purple-400 rounded-full">{pathModal.level}</span>
                    )}
                  </div>

                  {/* Stages */}
                  {pathModal.stages?.length > 0 && pathModal.stages.map((stage, sIdx) => (
                    <div key={sIdx} className="mb-5">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                        <span className="w-5 h-5 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 dark:text-indigo-300 dark:text-indigo-400 rounded-full flex items-center justify-center text-[10px] font-semibold">{sIdx + 1}</span>
                        {stage.stageName}
                      </h4>
                      <div className="space-y-2 pl-7">
                        {stage.courses.map((c, cIdx) => (
                          <div key={cIdx} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{c.title}</span>
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                c.status === 'Completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 dark:text-green-400'
                                : c.status === 'In Progress' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 dark:text-blue-400'
                                : 'bg-gray-50 dark:bg-slate-800 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
                              }`}>{c.status}</span>
                            </div>
                            <ProgressBar
                              value={c.progress}
                              size="sm"
                              showPercentage={true}
                              variant={c.progress >= 75 ? "success" : c.progress >= 40 ? "default" : "warning"}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {/* Flat courses list (no generated path) */}
                  {pathModal.courses?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Enrolled Courses</h4>
                      <div className="space-y-2">
                        {pathModal.courses.map((c, cIdx) => (
                          <div key={cIdx} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{c.title}</span>
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                c.status === 'Completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 dark:text-green-400'
                                : c.status === 'In Progress' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 dark:text-blue-400'
                                : 'bg-gray-50 dark:bg-slate-800 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
                              }`}>{c.status}</span>
                            </div>
                            <ProgressBar
                              value={c.progress}
                              size="sm"
                              showPercentage={true}
                              variant={c.progress >= 75 ? "success" : c.progress >= 40 ? "default" : "warning"}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Empty state */}
                  {(!pathModal.stages?.length && !pathModal.courses?.length) && (
                    <p className="text-sm text-gray-400 text-center py-6">No learning path or enrolled courses found for this learner.</p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
