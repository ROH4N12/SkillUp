import { useState, useEffect } from "react";
import { DashboardCard } from "../components/DashboardCard";
import { 
  User, 
  Bell, 
  Lock, 
  Globe, 
  Palette,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Save,
  CheckCircle2
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { apiCall } from "../hooks/useFetch";
import { useToast } from "../contexts/ToastContext";
import { Button } from "../components/ui/Button";
import { Skeleton } from "../components/ui/Skeleton";
import { AccordionContent } from "../components/ui/AccordionContent";
import { AlertDialog } from "../components/ui/HeroUIAlertDialog";
import { Trash2, AlertTriangle, RefreshCw, RotateCcw } from "lucide-react";


export default function Settings() {
  const { theme, setTheme } = useTheme();
  const toast = useToast();
  const userRole = localStorage.getItem('userRole') || 'learner';

  // Profile state
  const [profile, setProfile] = useState({
    name: '', email: '', phone: '', location: '', careerGoal: '', role: ''
  });
  const [preferences, setPreferences] = useState({
    notifications: true, progressReminders: true, weeklyReports: false
  });
  const [profileLoading, setProfileLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);

  // Password state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [savingPassword, setSavingPassword] = useState(false);

  // Fetch profile on mount
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await apiCall('/api/user/profile');
        setProfile({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          location: data.location || '',
          careerGoal: data.careerGoal || '',
          role: data.role || '',
        });
        setPreferences({
          notifications: data.preferences?.notifications ?? true,
          progressReminders: data.preferences?.progressReminders ?? true,
          weeklyReports: data.preferences?.weeklyReports ?? false,
        });
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setProfileLoading(false);
      }
    };
    loadProfile();
  }, []);

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      await apiCall('/api/user/profile', 'PUT', {
        name: profile.name,
        email: profile.email,
        phone: profile.phone,
        location: profile.location,
        careerGoal: profile.careerGoal,
        preferences,
      });
      toast.success('Profile saved successfully!');
      // Update localStorage so header updates
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      user.name = profile.name;
      localStorage.setItem('user', JSON.stringify(user));
    } catch (err) {
      toast.error('Failed to save profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setSavingPassword(true);
    try {
      await apiCall('/api/user/password', 'PUT', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      toast.success('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswordForm(false);
    } catch (err) {
      toast.error('Failed — current password may be incorrect');
    } finally {
      setSavingPassword(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl space-y-4 border border-gray-100 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <Skeleton className="w-20 h-20 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    );
  }


  const initials = profile.name
    ? profile.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
    : 'U';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your account preferences and settings</p>
      </div>

      {/* Profile Settings */}

      <DashboardCard title="Profile Information">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-2xl font-medium">{initials}</span>
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">{profile.name || 'User'}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{profile.role}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={profile.location}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                  placeholder="Mumbai, India"
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>

            {userRole === 'learner' && (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Career Goal</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={profile.careerGoal}
                    onChange={(e) => setProfile({ ...profile, careerGoal: e.target.value })}
                    placeholder="e.g. Frontend Developer"
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="primary"
              icon={Save}
              loading={savingProfile}
              loadingText="Saving Changes..."
              onClick={handleSaveProfile}
            >
              Save Changes
            </Button>
          </div>
        </div>

      </DashboardCard>

      {/* Notification Settings */}
      <DashboardCard title="Notification Preferences">
        <div className="space-y-4">
          {[
            { key: 'notifications', label: "Course Updates", description: "Get notified about new courses and updates" },
            { key: 'progressReminders', label: "Progress Reminders", description: "Daily reminders to keep your streak going" },
            { key: 'weeklyReports', label: "Weekly Reports", description: "Receive weekly progress summaries via email" },
          ].map((setting) => (
            <div key={setting.key} className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-slate-700 last:border-0">
              <div className="flex items-start gap-3">
                <Bell className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{setting.label}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{setting.description}</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={preferences[setting.key]}
                  onChange={() => setPreferences(prev => ({ ...prev, [setting.key]: !prev[setting.key] }))}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:bg-slate-800 after:border-gray-300 dark:border-slate-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          ))}
        </div>
      </DashboardCard>

      {/* Privacy & Security */}
      <DashboardCard title="Privacy & Security">
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-slate-700">
            <div className="flex items-start gap-3">
              <Lock className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">Change Password</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Update your password regularly for security</p>
              </div>
            </div>
            <button
              onClick={() => setShowPasswordForm(!showPasswordForm)}
              className="px-4 py-2 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 active:scale-95 transition-all text-sm select-none"
            >
              {showPasswordForm ? 'Cancel' : 'Change'}
            </button>
          </div>

          <AccordionContent isOpen={showPasswordForm}>
            <div className="space-y-3 pl-8 pb-2">
              <input
                type="password"
                placeholder="Current password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="password"
                placeholder="New password (min 6 chars)"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500"
              />
              <input
                type="password"
                placeholder="Confirm new password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500"
              />
              <div className="pt-1">
                <Button
                  variant="primary"
                  loading={savingPassword}
                  loadingText="Updating Password..."
                  onClick={handleChangePassword}
                >
                  Update Password
                </Button>
              </div>
            </div>
          </AccordionContent>



          <div className="flex items-center justify-between py-3">
            <div className="flex items-start gap-3">
              <Globe className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">Profile Visibility</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Control who can see your profile and portfolio</p>
              </div>
            </div>
            <select className="px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
              <option>Public</option>
              <option>Private</option>
              <option>Connections Only</option>
            </select>
          </div>
        </div>
      </DashboardCard>

      {/* Preferences */}
      <DashboardCard title="Preferences">
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-slate-700">
            <div className="flex items-start gap-3">
              <Palette className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">Theme</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Choose your interface theme</p>
              </div>
            </div>
            <select 
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">Auto</option>
            </select>
          </div>

          <div className="flex items-center justify-between py-3">
            <div className="flex items-start gap-3">
              <Globe className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">Timezone</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Set your timezone for accurate schedules</p>
              </div>
            </div>
            <select className="px-4 py-2 border border-gray-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100">
              <option>Indian Standard Time (IST)</option>
            </select>
          </div>
        </div>
      </DashboardCard>

      {/* Danger Zone */}
      <DashboardCard title="Danger Zone" subtitle="Irreversible account and progress actions">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Reset Progress Alert Dialog */}
          <AlertDialog>
            <AlertDialog.Trigger className="group flex w-full items-center gap-3.5 rounded-2xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/60 dark:bg-amber-950/20 p-4 shadow-xs select-none hover:bg-amber-100/60 dark:hover:bg-amber-950/40 transition-all cursor-pointer">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400">
                <RotateCcw className="size-5" />
              </div>
              <div className="flex flex-1 flex-col gap-0.5 text-left">
                <p className="text-sm font-bold text-amber-900 dark:text-amber-300">Reset Learning Progress</p>
                <p className="text-xs text-amber-700/80 dark:text-amber-400/80">Reset course milestones, completions & streaks</p>
              </div>
              <span className="px-3.5 py-1.5 text-xs font-bold rounded-xl text-amber-800 dark:text-amber-200 bg-amber-200/80 dark:bg-amber-900/70 group-hover:bg-amber-300/80 transition-all shadow-xs">
                Reset
              </span>
            </AlertDialog.Trigger>
            <AlertDialog.Backdrop>
              <AlertDialog.Container>
                <AlertDialog.Dialog className="sm:max-w-[420px]">
                  <AlertDialog.CloseTrigger />
                  <AlertDialog.Header>
                    <AlertDialog.Icon status="warning">
                      <RotateCcw className="size-5" />
                    </AlertDialog.Icon>
                    <AlertDialog.Heading>Reset all progress?</AlertDialog.Heading>
                  </AlertDialog.Header>
                  <AlertDialog.Body>
                    <p className="text-sm text-gray-600 dark:text-slate-300">
                      Are you sure you want to reset all your course completions, assessment scores, and streak history? Your account will remain active but progress will reset to 0%.
                    </p>
                  </AlertDialog.Body>
                  <AlertDialog.Footer>
                    <button
                      type="button"
                      slot="close"
                      className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      slot="close"
                      onClick={async () => {
                        try {
                          await apiCall('/api/learner/progress/reset', 'DELETE');
                          toast.success("All learning progress has been reset");
                        } catch {
                          toast.error("Failed to reset progress");
                        }
                      }}
                      className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 transition-all shadow-md active:scale-95 flex items-center gap-1.5"
                    >
                      Reset Progress
                    </button>
                  </AlertDialog.Footer>
                </AlertDialog.Dialog>
              </AlertDialog.Container>
            </AlertDialog.Backdrop>
          </AlertDialog>

          {/* Delete Account Alert Dialog */}
          <AlertDialog>
            <AlertDialog.Trigger className="group flex w-full items-center gap-3.5 rounded-2xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/60 dark:bg-rose-950/20 p-4 shadow-xs select-none hover:bg-rose-100/60 dark:hover:bg-rose-950/40 transition-all cursor-pointer">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400">
                <Trash2 className="size-5" />
              </div>
              <div className="flex flex-1 flex-col gap-0.5 text-left">
                <p className="text-sm font-bold text-rose-900 dark:text-rose-300">Delete Account</p>
                <p className="text-xs text-rose-700/80 dark:text-rose-400/80">Permanently wipe your account and all data</p>
              </div>
              <span className="px-3.5 py-1.5 text-xs font-bold rounded-xl text-rose-800 dark:text-rose-200 bg-rose-200/80 dark:bg-rose-900/70 group-hover:bg-rose-300/80 transition-all shadow-xs">
                Delete
              </span>
            </AlertDialog.Trigger>
            <AlertDialog.Backdrop>
              <AlertDialog.Container>
                <AlertDialog.Dialog className="sm:max-w-[420px]">
                  <AlertDialog.CloseTrigger />
                  <AlertDialog.Header>
                    <AlertDialog.Icon status="danger">
                      <Trash2 className="size-5" />
                    </AlertDialog.Icon>
                    <AlertDialog.Heading>Delete your account?</AlertDialog.Heading>
                  </AlertDialog.Header>
                  <AlertDialog.Body>
                    <p className="text-sm text-gray-600 dark:text-slate-300">
                      This action is permanent and cannot be undone. All your course progress, certificates, streak history, and personalized roadmap data will be permanently wiped.
                    </p>
                  </AlertDialog.Body>
                  <AlertDialog.Footer>
                    <button
                      type="button"
                      slot="close"
                      className="px-4 py-2 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      slot="close"
                      onClick={() => {
                        toast.error("Account deletion requested. Contacting support...");
                      }}
                      className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 transition-all shadow-md active:scale-95 flex items-center gap-1.5"
                    >
                      Delete Account
                    </button>
                  </AlertDialog.Footer>
                </AlertDialog.Dialog>
              </AlertDialog.Container>
            </AlertDialog.Backdrop>
          </AlertDialog>
        </div>
      </DashboardCard>
    </div>
  );
}
