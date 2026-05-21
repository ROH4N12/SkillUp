import { Outlet, Link, useLocation } from "react-router";
import { 
  LayoutDashboard, 
  Route, 
  BarChart3, 
  Briefcase, 
  Bell, 
  Users, 
  GraduationCap,
  Settings,
  Search,
  Menu,
  X,
  Sun,
  Moon,
  CheckCircle2
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { AuroraOverlay } from "./ui/aurora-overlay";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard", roles: ["learner"] },
  { icon: Route, label: "Learning Path", path: "/dashboard/learning-path", roles: ["learner"] },
  { icon: BarChart3, label: "Progress Tracking", path: "/dashboard/progress", roles: ["learner"] },
  { icon: Bell, label: "Alerts", path: "/dashboard/alerts", roles: ["learner", "counselor", "trainer"] },
  { icon: Users, label: "Counselor Dashboard", path: "/dashboard/counselor", roles: ["counselor"] },
  { icon: GraduationCap, label: "Trainer Dashboard", path: "/dashboard/trainer", roles: ["trainer"] },
  { icon: Settings, label: "Settings", path: "/dashboard/settings", roles: ["learner", "counselor", "trainer"] },
];

export function DashboardLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  // Notification bell state
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef(null);

  let userName = "Current User";
  let userRole = localStorage.getItem('userRole') || 'learner';
  let userInitials = "CU";
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user?.name) {
      userName = user.name;
      userInitials = userName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0,2) || "CU";
    }
    if (user?.role) {
      userRole = user.role;
    }
  } catch(e) {}

  // Fetch unread count
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch('http://localhost:5000/api/notifications/unread-count', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => setUnreadCount(d.count || 0))
      .catch(() => {});
  }, [location.pathname]);

  // Fetch recent notifications when bell is opened
  const openNotifDropdown = async () => {
    setNotifOpen(prev => !prev);
    if (!notifOpen) {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/notifications?limit=5', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setNotifications(Array.isArray(data) ? data.slice(0, 5) : []);
      } catch (e) {}
    }
  };

  // Mark notification as read locally
  const markRead = async (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch(e) {}
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-900 relative overflow-hidden">
      <AuroraOverlay />
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30
        w-64 bg-gray-50 dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700 
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-xl text-gray-900 dark:text-gray-100">SkillUp</span>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 hover:bg-gray-50 dark:bg-slate-800 dark:hover:bg-gray-700 rounded dark:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4">
            <ul className="space-y-1">
              {menuItems.filter(item => {
                return item.roles.includes(userRole);
              }).map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      onClick={() => setSidebarOpen(false)}
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-lg
                        transition-colors duration-150
                        ${isActive 
                          ? 'bg-indigo-100 dark:bg-indigo-900/30 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 dark:text-indigo-300 dark:text-indigo-400' 
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-slate-800 dark:hover:bg-gray-700'
                        }
                      `}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          
          {/* Sidebar Bottom Actions */}
          <div className="p-4 border-t border-gray-200 dark:border-slate-700 space-y-2">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                {theme === 'dark' ? <Moon className="w-5 h-5 text-indigo-400" /> : <Sun className="w-5 h-5 text-amber-500" />}
                <span className="text-sm font-medium">Dark Mode</span>
              </div>
              <div className={`w-10 h-5 rounded-full relative transition-colors ${theme === 'dark' ? 'bg-indigo-600' : 'bg-gray-300'}`}>
                <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${theme === 'dark' ? 'translate-x-5' : ''}`} />
              </div>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top navbar */}
        <header className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-50 dark:bg-slate-800 dark:hover:bg-gray-700 rounded-lg dark:text-gray-300"
              >
                <Menu className="w-5 h-5" />
              </button>
              
              {/* Search bar */}
              <div className="hidden md:flex items-center gap-2 bg-gray-50 dark:bg-slate-800 dark:bg-gray-700 rounded-lg px-4 py-2 w-96">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search courses, skills, or careers..."
                  className="bg-transparent border-none outline-none flex-1 text-sm dark:text-white dark:placeholder-gray-400"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Theme Toggle */}
              <button 
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg text-gray-500 dark:text-gray-400"
                title="Toggle Theme"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Notifications Bell with Dropdown */}
              <div className="relative" ref={notifRef}>
                <button
                  onClick={openNotifDropdown}
                  className="relative p-2 hover:bg-gray-50 dark:bg-slate-800 dark:hover:bg-gray-700 rounded-lg"
                >
                  <Bell className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 rounded-full flex items-center justify-center text-white text-[10px] font-semibold px-1">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notification Dropdown */}
                {notifOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-gray-50 dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-200 dark:border-slate-700 z-50 overflow-hidden">
                    <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-700 flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">Notifications</h3>
                      {unreadCount > 0 && (
                        <span className="text-xs text-indigo-700 dark:text-indigo-300 dark:text-indigo-300 dark:text-indigo-400 font-medium">{unreadCount} unread</span>
                      )}
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {notifications.length > 0 ? notifications.map(n => (
                        <div
                          key={n._id}
                          className={`px-4 py-3 border-b border-gray-200 dark:border-slate-700 last:border-0 ${
                            n.read ? 'opacity-60' : 'bg-indigo-50/50 dark:bg-indigo-900/20'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{n.title}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{n.message}</p>
                              <p className="text-[10px] text-gray-400 mt-1">{new Date(n.createdAt).toLocaleDateString()}</p>
                            </div>
                            {!n.read && (
                              <button
                                onClick={(e) => markRead(e, n._id)}
                                className="p-1 text-green-700 dark:text-green-300 dark:text-green-300 hover:bg-green-100 dark:bg-green-900/30 dark:hover:bg-green-900/30 rounded transition-colors flex-shrink-0"
                                title="Mark as read"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      )) : (
                        <div className="px-4 py-8 text-center text-sm text-gray-400">No notifications yet</div>
                      )}
                    </div>
                    <Link
                      to="/dashboard/alerts"
                      onClick={() => setNotifOpen(false)}
                      className="block px-4 py-2.5 text-center text-sm text-indigo-700 dark:text-indigo-300 dark:text-indigo-300 dark:text-indigo-400 font-medium border-t border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      View All Notifications
                    </Link>
                  </div>
                )}
              </div>

              {/* User profile */}
              <div className="flex items-center gap-3 pl-4 border-l border-gray-200 dark:border-slate-700 relative group">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{userName}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">{userRole}</div>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center cursor-pointer">
                  <span className="text-white text-sm font-medium">{userInitials}</span>
                </div>
                
                {/* Logout Dropdown (hover) */}
                <div className="absolute right-0 top-full mt-2 w-48 bg-gray-50 dark:bg-slate-800 rounded-lg shadow-xl border border-gray-200 dark:border-slate-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                  <button 
                    onClick={() => {
                      localStorage.removeItem('token');
                      localStorage.removeItem('userRole');
                      localStorage.removeItem('user');
                      window.location.href = '/login';
                    }}
                    className="w-full text-left px-4 py-3 text-sm text-red-700 dark:text-red-300 dark:text-red-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 relative z-[1]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}