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
import { ThemeToggle } from "./ui/ThemeToggle";
import { getApiUrl } from "../config/api";


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
  const [isScrolled, setIsScrolled] = useState(false);

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
    fetch(getApiUrl('/api/notifications/unread-count'), {
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
        const res = await fetch(getApiUrl('/api/notifications?limit=5'), {
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
      await fetch(getApiUrl(`/api/notifications/${id}/read`), {
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

  // Profile dropdown state
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const [headerSearch, setHeaderSearch] = useState("");

  // Close profile dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
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
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-20 lg:hidden modal-backdrop-enter"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30
        w-64 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border-r border-gray-200/80 dark:border-slate-700/80
        transform transition-transform duration-300 ease-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-5 border-b border-gray-200/80 dark:border-slate-700/80">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-sm shadow-indigo-500/20">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-gray-100">SkillUp</span>
            </div>
            <button 
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg text-gray-500 dark:text-gray-400 transition-colors"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-3.5 space-y-1">
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
                        group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium
                        transition-all duration-150 ease-out active:scale-[0.98] select-none
                        ${isActive 
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 shadow-sm shadow-indigo-500/5' 
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/70 dark:hover:bg-slate-700/50 hover:text-gray-900 dark:hover:text-gray-100'
                        }
                      `}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-2 bottom-2 w-1 bg-indigo-600 dark:bg-indigo-400 rounded-r-full" />
                      )}
                      <Icon className={`w-4.5 h-4.5 transition-transform duration-150 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'group-hover:scale-105'}`} />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          
          {/* Sidebar Bottom Actions */}
          <div className="p-3.5 border-t border-gray-200/80 dark:border-slate-700/80 space-y-1.5">
            <ThemeToggle variant="switch" />
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top navbar */}
        <header className={`
          bg-white/80 dark:bg-slate-800/80 backdrop-blur-md px-6 py-3.5 z-20 transition-all duration-200
          ${isScrolled 
            ? 'border-b border-indigo-500/20 shadow-md shadow-black/5 dark:shadow-black/25' 
            : 'border-b border-gray-200/80 dark:border-slate-700/80 shadow-none'}
        `}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-slate-700 active:scale-90 rounded-lg text-gray-600 dark:text-gray-300 transition-all"
                aria-label="Open sidebar"
              >

                <Menu className="w-5 h-5" />
              </button>
              
              {/* Search bar */}
              <div className="hidden md:flex items-center gap-2 bg-gray-100/80 dark:bg-slate-700/60 border border-transparent focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-500/20 rounded-xl px-3.5 py-2 w-80 lg:w-96 transition-all duration-150">
                <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  value={headerSearch}
                  onChange={(e) => setHeaderSearch(e.target.value)}
                  placeholder="Search courses, skills, or careers..."
                  className="bg-transparent border-none outline-none flex-1 text-xs sm:text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400"
                />
                {headerSearch && (
                  <button
                    onClick={() => setHeaderSearch("")}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-0.5"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Animated Theme Toggle */}
              <ThemeToggle variant="icon" />

              {/* Notifications Bell with Dropdown */}

              <div className="relative" ref={notifRef}>
                <button
                  onClick={openNotifDropdown}
                  className="relative p-2 hover:bg-gray-100 dark:hover:bg-slate-700/60 active:scale-90 rounded-xl text-gray-500 dark:text-gray-400 transition-all focus:outline-none"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-rose-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold px-1 animate-pulse">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {notifOpen && (
                  <div className="dropdown-enter absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-gray-200/80 dark:border-slate-700 p-4 z-50 overflow-hidden">
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-slate-700">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">Notifications</h4>
                        {unreadCount > 0 && (
                          <span className="text-[11px] bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-semibold px-2 py-0.5 rounded-full">
                            {unreadCount} new
                          </span>
                        )}
                      </div>
                      <Link 
                        to="/dashboard/alerts" 
                        onClick={() => setNotifOpen(false)}
                        className="text-xs text-indigo-700 dark:text-indigo-300 hover:underline"
                      >
                        View all
                      </Link>
                    </div>

                    <div className="divide-y divide-gray-100 dark:divide-slate-700/60 max-h-72 overflow-y-auto mt-2 -mx-1 px-1">
                      {notifications.length === 0 ? (
                        <div className="py-8 text-center text-xs text-gray-400">
                          No notifications
                        </div>
                      ) : (
                        notifications.slice(0, 5).map((n) => (
                          <div 
                            key={n._id} 
                            onClick={(e) => markRead(e, n._id)}
                            className={`py-3 px-2 flex items-start gap-3 rounded-xl transition-all cursor-pointer ${n.read ? 'opacity-60 hover:opacity-100' : 'bg-indigo-50/50 dark:bg-indigo-950/20'} hover:bg-gray-50 dark:hover:bg-slate-700/40`}
                          >
                            <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <Bell className="w-3.5 h-3.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-1">
                                <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">{n.title}</p>
                                {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 flex-shrink-0" />}
                              </div>
                              <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 mt-0.5">{n.message}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User profile with animated dropdown */}
              <div className="relative pl-3 border-l border-gray-200 dark:border-slate-700" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen(prev => !prev)}
                  className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-gray-100/80 dark:hover:bg-slate-700/50 active:scale-95 transition-all focus:outline-none select-none"
                >
                  <div className="text-right hidden sm:block">
                    <div className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-tight">{userName}</div>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400 capitalize">{userRole}</div>
                  </div>
                  <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center shadow-sm shadow-indigo-500/20">
                    <span className="text-white text-xs font-bold">{userInitials}</span>
                  </div>
                </button>
                
                {/* Profile dropdown */}
                {profileOpen && (
                  <div className="dropdown-enter absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-200/80 dark:border-slate-700 py-1 z-50 overflow-hidden">
                    <Link
                      to="/dashboard/settings"
                      onClick={() => setProfileOpen(false)}
                      className="block px-4 py-2 text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      Account Settings
                    </Link>
                    <button 
                      onClick={() => {
                        localStorage.removeItem('token');
                        localStorage.removeItem('userRole');
                        localStorage.removeItem('user');
                        window.location.href = '/login';
                      }}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors flex items-center gap-2"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content with smooth subtle page-enter animation */}
        <main 
          onScroll={(e) => setIsScrolled(e.currentTarget.scrollTop > 10)}
          className="flex-1 overflow-y-auto p-6 relative z-[1]"
        >
          <div key={location.pathname} className="page-enter">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}