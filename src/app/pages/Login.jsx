import { useState } from "react";
import { useNavigate } from "react-router";
import { GraduationCap, Mail, Lock, Eye, EyeOff, User, ArrowLeft, Sun, Moon } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { useGoogleLogin } from "@react-oauth/google";
import { AuroraOverlay } from "../components/ui/aurora-overlay";

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!isLogin && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body = isLogin ? { email, password } : { name, email, password };
      
      const res = await fetch(`http://localhost:5000${endpoint}`, {
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
    }
  };

  const handleGoogleSuccess = async (tokenResponse) => {
    try {
      const { access_token } = tokenResponse;
      // We pass the currently selected role in case this is a new signup via Google
      const res = await fetch(`http://localhost:5000/api/auth/google`, {
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
            className="flex items-center text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </button>
          
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 hover:bg-white dark:hover:bg-slate-800 rounded-lg text-gray-500 dark:text-gray-400 shadow-sm border border-gray-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 transition-colors"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-indigo-400" /> : <Moon className="w-4 h-4 text-gray-500" />}
          </button>
        </div>

        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-4">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 transition-colors duration-200">Welcome to SkillUp</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 transition-colors duration-200">
            {isLogin ? "Sign in to continue your learning journey" : "Create your account to get started"}
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-gray-50 dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-200 dark:border-slate-700 p-8 transition-colors duration-200">
          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 dark:text-red-300 rounded-lg text-sm border border-red-200 dark:border-red-800 dark:bg-red-900/30 dark:border-red-800 dark:text-red-400">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-200"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}
            
            {/* Email Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-200"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-12 py-3 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-200"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password Input */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-12 py-3 border border-gray-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent dark:focus:ring-purple-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-colors duration-200"
                    required={!isLogin}
                  />
                </div>
              </div>
            )}



            {/* Forgot Password */}
            {isLogin && (
              <div className="flex items-center justify-end">
                <button type="button" className="text-sm text-indigo-700 dark:text-indigo-300 dark:text-indigo-300 dark:text-indigo-400 hover:text-indigo-700 dark:text-indigo-300 dark:hover:text-indigo-300 transition-colors duration-200">
                  Forgot password?
                </button>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-indigo-600 hover:to-purple-700 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800"
            >
              {isLogin ? "Sign In" : "Create Account"}
            </button>

            {/* Divider */}
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-gray-200 dark:border-slate-700"></div>
              <span className="flex-shrink-0 mx-4 text-sm text-gray-400">Or continue with</span>
              <div className="flex-grow border-t border-gray-200 dark:border-slate-700"></div>
            </div>
            
            {/* Google Login */}
            <button
              type="button"
              onClick={() => loginWithGoogle()}
              className="w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 py-3 rounded-lg font-medium border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 dark:focus:ring-offset-gray-800"
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

          {/* Toggle Login/Register */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError("");
                  setConfirmPassword("");
                }}
                className="text-indigo-700 dark:text-indigo-300 dark:text-indigo-300 dark:text-indigo-400 font-medium hover:text-indigo-700 dark:text-indigo-300 dark:hover:text-indigo-300 transition-colors duration-200"
              >
                {isLogin ? "Sign up" : "Sign in"}
              </button>
            </p>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center text-xs text-gray-500 dark:text-gray-400 transition-colors duration-200">
          <p>By continuing, you agree to SkillUp's Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </div>
  );
}
