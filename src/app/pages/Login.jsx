import { useState } from "react";
import { useNavigate } from "react-router";
import { GraduationCap, Mail, Lock, Eye, EyeOff, User, ArrowLeft, Sun, Moon } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { useGoogleLogin } from "@react-oauth/google";
import { AuroraOverlay } from "../components/ui/aurora-overlay";
import { Button } from "../components/ui/Button";
import { ThemeToggle } from "../components/ui/ThemeToggle";
import { getApiUrl } from "../config/api";


export default function Login() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isLogin && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setSubmitting(true);
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body = isLogin ? { email, password } : { name, email, password };

      
      const res = await fetch(getApiUrl(endpoint), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.message || 'Authentication failed');
        return;
      }
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('userRole', data.role);
      localStorage.setItem('user', JSON.stringify({ name: data.name, role: data.role }));
      
      if (data.role === 'counselor') {
        navigate('/dashboard/counselor');
      } else if (data.role === 'trainer') {
        navigate('/dashboard/trainer');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError('Network error, please try again');
    } finally {
      setSubmitting(false);
    }
  };


  const handleGoogleSuccess = async (tokenResponse) => {
    try {
      const { access_token } = tokenResponse;
      // We pass the currently selected role in case this is a new signup via Google
      const res = await fetch(getApiUrl('/api/auth/google'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token })
      });
      
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Google Authentication failed');
        return;
      }
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('userRole', data.role);
      localStorage.setItem('user', JSON.stringify({ name: data.name, role: data.role }));
      
      if (data.role === 'counselor') {
        navigate('/dashboard/counselor');
      } else if (data.role === 'trainer') {
        navigate('/dashboard/trainer');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError('Network error during Google login');
    }
  };

  const [demoRoleLoading, setDemoRoleLoading] = useState(null);

  const handleDemoLogin = async (role) => {
    try {
      setDemoRoleLoading(role);
      setError("");
      const res = await fetch(getApiUrl('/api/auth/demo-login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Demo login failed');

      localStorage.setItem('token', data.token);
      localStorage.setItem('userRole', data.role);
      localStorage.setItem('user', JSON.stringify({ name: data.name, role: data.role }));

      if (data.role === 'counselor') {
        navigate('/dashboard/counselor');
      } else if (data.role === 'trainer') {
        navigate('/dashboard/trainer');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setDemoRoleLoading(null);
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => setError('Google Login Failed')
  });

  return (
    <div className="relative min-h-screen bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center p-4 transition-colors duration-200 overflow-hidden">
      <AuroraOverlay />
      <div className="relative z-10 w-full max-w-md">
        {/* Top Header Actions */}
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Home
          </button>
          <ThemeToggle variant="icon" />
        </div>

        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-2xl p-8 border border-gray-200/60 dark:border-slate-700/60 shadow-xl shadow-black/5 dark:shadow-black/20 transition-colors duration-200">
          {/* Logo & Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-purple-600 text-white mb-4 shadow-lg shadow-purple-500/30">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">
              {isLogin ? "Welcome to SkillUp" : "Create Account"}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {isLogin ? "Sign in to continue your learning journey" : "Join thousands of learners worldwide"}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Alex Mercer"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-3 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              loading={submitting}
              loadingText={isLogin ? "Signing In..." : "Creating Account..."}
              className="w-full justify-center !py-3 !text-base shadow-md hover:shadow-purple-500/25 !bg-purple-600 hover:!bg-purple-700"
            >
              {isLogin ? "Sign In" : "Create Account"}
            </Button>

            {/* Divider */}
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-gray-200 dark:border-slate-700"></div>
              <span className="flex-shrink-0 mx-4 text-xs uppercase tracking-wider text-gray-400">Or continue with</span>
              <div className="flex-grow border-t border-gray-200 dark:border-slate-700"></div>
            </div>
            
            {/* Google Login */}
            <button
              type="button"
              onClick={() => loginWithGoogle()}
              className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-900 text-gray-700 dark:text-gray-300 py-3 rounded-lg font-medium border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-1 7.28-2.69l-3.57-2.77c-.99.69-2.26 1.1-3.71 1.1-2.87 0-5.3-1.94-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.11c-.22-.69-.35-1.43-.35-2.11s.13-1.42.35-2.11V7.05H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.95l3.68-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.05l3.68 2.84c.86-2.59 3.29-4.51 6.16-4.51z" fill="#EA4335"/>
              </svg>
              Google
            </button>
          </form>

          {/* Quick 1-Click Demo Logins */}
          <div className="mt-6 pt-5 border-t border-gray-200/80 dark:border-slate-700/80 text-center">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2.5">
              ⚡ Instant 1-Click Demo Evaluation Logins:
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('learner')}
                disabled={demoRoleLoading !== null}
                className="py-2 px-2 text-xs font-medium rounded-lg bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/60 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {demoRoleLoading === 'learner' ? 'Loading...' : '🎓 Learner'}
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('trainer')}
                disabled={demoRoleLoading !== null}
                className="py-2 px-2 text-xs font-medium rounded-lg bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/60 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {demoRoleLoading === 'trainer' ? 'Loading...' : '👨‍🏫 Trainer'}
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('counselor')}
                disabled={demoRoleLoading !== null}
                className="py-2 px-2 text-xs font-medium rounded-lg bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {demoRoleLoading === 'counselor' ? 'Loading...' : '🧑‍💼 Counselor'}
              </button>
            </div>
          </div>

          {/* Toggle Login/Register */}
          <div className="mt-5 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError("");
                  setConfirmPassword("");
                }}
                className="text-purple-600 dark:text-purple-400 font-semibold hover:underline"
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400">
          <p>By continuing, you agree to SkillUp's Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </div>
  );
}
