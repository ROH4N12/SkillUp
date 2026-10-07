import React, { useState, useEffect, useCallback, memo } from 'react';
import { Link, useNavigate } from 'react-router';
import { 
  GraduationCap, 
  Brain, 
  Target, 
  BarChart, 
  PlayCircle, 
  Bell, 
  Users, 
  ChevronRight, 
  Sparkles, 
  TrendingUp, 
  Layout, 
  Briefcase, 
  Sun, 
  Moon,
  Zap,
  ShieldCheck,
  Compass,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { WavyBackground } from '../components/ui/blue-meshy-background';
import { ScrollReveal } from '../components/ui/ScrollReveal';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { getApiUrl } from '../config/api';

export default function LandingPage() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [demoLoading, setDemoLoading] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleDemoLogin = async (role) => {
    try {
      setDemoLoading(role);
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
      alert(err.message || 'Demo login failed');
    } finally {
      setDemoLoading(null);
    }
  };

  return (
    <div className="relative min-h-screen bg-transparent text-gray-900 dark:text-gray-100 transition-colors duration-200 font-sans overflow-hidden">
      <WavyBackground waveOpacity={0.45} blur={12} speed="slow" />
      
      {/* 1. Navbar */}
      <nav className={`sticky top-0 z-50 transition-all duration-200 ${
        isScrolled 
          ? 'glass-subtle border-b border-indigo-500/20 shadow-lg shadow-black/5 dark:shadow-black/30' 
          : 'bg-transparent border-b border-white/20 dark:border-white/5 shadow-none'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-500/25">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-gray-900 dark:text-gray-100">SkillUp</span>
            </div>
            {/* Nav Actions */}
            <div className="flex items-center gap-4">
              <ThemeToggle variant="switch" />
              <Link to="/login" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium text-sm transition-colors">
                Login
              </Link>
              <Link to="/login" className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] shadow-md hover:shadow-indigo-500/25">
                Register
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-pill text-indigo-700 dark:text-indigo-300 text-sm font-semibold mb-6 border border-indigo-500/20">
            <Sparkles className="w-4 h-4 text-indigo-500" /> Introducing AI-Powered Learning
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
            Your Own <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">
              Personalized Learning Platform
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
            Generate your perfect learning path, track your real-time progress, and master any skill with expert guidance and curated content.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <Link to="/login" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-purple-600 text-white px-8 py-3.5 rounded-full text-base md:text-lg font-semibold hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 shadow-xl shadow-indigo-500/25">
              Get Started <ChevronRight className="w-5 h-5" />
            </Link>
            <a href="#features" className="w-full sm:w-auto flex items-center justify-center gap-2 glass-default text-gray-900 dark:text-gray-100 px-8 py-3.5 rounded-full text-base md:text-lg font-semibold hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200">
              Explore Features
            </a>
          </div>

          {/* Instant 1-Click Demo Logins for Evaluation */}
          <div className="max-w-4xl mx-auto pt-6 border-t border-white/40 dark:border-white/10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass-pill text-purple-700 dark:text-purple-300 text-xs font-semibold uppercase tracking-wider mb-4 border border-purple-500/20">
              <Zap className="w-3.5 h-3.5 text-purple-500" /> Instant 1-Click Demo Logins
            </div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-6">
              Evaluate live dashboards instantly with pre-configured role accounts (no registration needed):
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
              {/* Learner Card */}
              <button
                onClick={() => handleDemoLogin('learner')}
                disabled={demoLoading !== null}
                className="group relative p-5 glass-default rounded-2xl hover:border-indigo-500/50 shadow-sm hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-200 hover:-translate-y-1 text-left disabled:opacity-70 cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl glass-pill flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full glass-pill text-indigo-700 dark:text-indigo-300">
                    Learner Role
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white text-base mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  Learner Portal
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
                  Interactive learning paths, video player, and real-time progress analytics.
                </p>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  {demoLoading === 'learner' ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Launching...</>
                  ) : (
                    <>Launch Learner View <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" /></>
                  )}
                </div>
              </button>

              {/* Trainer Card */}
              <button
                onClick={() => handleDemoLogin('trainer')}
                disabled={demoLoading !== null}
                className="group relative p-5 glass-default rounded-2xl hover:border-purple-500/50 shadow-sm hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-200 hover:-translate-y-1 text-left disabled:opacity-70 cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl glass-pill flex items-center justify-center text-purple-600 dark:text-purple-400">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full glass-pill text-purple-700 dark:text-purple-300">
                    Trainer Role
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white text-base mb-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  Trainer Portal
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
                  Cohort management, curriculum monitoring, and dropout-risk interventions.
                </p>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-600 dark:text-purple-400">
                  {demoLoading === 'trainer' ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Launching...</>
                  ) : (
                    <>Launch Trainer View <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" /></>
                  )}
                </div>
              </button>

              {/* Counselor Card */}
              <button
                onClick={() => handleDemoLogin('counselor')}
                disabled={demoLoading !== null}
                className="group relative p-5 glass-default rounded-2xl hover:border-emerald-500/50 shadow-sm hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-200 hover:-translate-y-1 text-left disabled:opacity-70 cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl glass-pill flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                    <Users className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full glass-pill text-emerald-700 dark:text-emerald-300">
                    Counselor Role
                  </span>
                </div>
                <h3 className="font-bold text-gray-900 dark:text-white text-base mb-1 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  Counselor Portal
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">
                  Academic counseling, high-risk student alerts, and outreach logs.
                </p>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  {demoLoading === 'counselor' ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Launching...</>
                  ) : (
                    <>Launch Counselor View <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" /></>
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Features Section */}
      <section id="features" className="py-20 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Everything you need to succeed</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">Powerful tools designed to accelerate your career growth.</p>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: <Brain className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />, title: "AI Learning Path Generator", desc: "Enter your career goals and let AI build a step-by-step roadmap tailored specifically to your needs.", color: "indigo" },
              { icon: <BarChart className="w-6 h-6 text-purple-600 dark:text-purple-400" />, title: "Real-Time Progress Tracking", desc: "Monitor your advancement with dynamic charts, readiness scores, and visual skill gap analysis.", color: "purple" },
              { icon: <PlayCircle className="w-6 h-6 text-pink-600 dark:text-pink-400" />, title: "YouTube-Based Learning", desc: "Learn from the best. We aggregate top-quality video tutorials and projects to match your learning stage.", color: "pink" },
              { icon: <Target className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />, title: "Skill Gap Analysis", desc: "Identify exactly what you need to learn. Our radar charts compare your current skills against industry requirements.", color: "emerald" },
              { icon: <Bell className="w-6 h-6 text-amber-600 dark:text-amber-400" />, title: "Smart Notifications", desc: "Stay on track with automated reminders, course updates, and real-time alerts from your mentors.", color: "amber" },
              { icon: <Layout className="w-6 h-6 text-blue-600 dark:text-blue-400" />, title: "Role-Based Dashboards", desc: "Dedicated and specialized interfaces designed uniquely for Learners, Counselors, and Trainers.", color: "blue" }
            ].map((feature, i) => (
              <ScrollReveal key={feature.title} delay={i * 70} direction="up">
                <FeatureCard 
                  icon={feature.icon}
                  title={feature.title}
                  desc={feature.desc}
                  color={feature.color}
                />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* 4. How It Works Section */}
      <section className="py-20 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold mb-4">How SkillUp Works</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">Your journey from beginner to professional</p>
            </div>
          </ScrollReveal>
          
          <ScrollReveal direction="up" delay={150}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
              <StepItem number="1" title="Choose Goal" desc="Select your target career or skill" />
              <StepItem number="2" title="Get Roadmap" desc="AI generates your custom learning path" />
              <StepItem number="3" title="Start Learning" desc="Watch videos & complete projects" />
              <StepItem number="4" title="Track & Grow" desc="Monitor progress and get mentor guidance" />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 5. Dashboard Preview Section */}
      <section className="py-20 bg-transparent overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <ScrollReveal direction="left">
              <div>
                <h2 className="text-3xl md:text-4xl font-extrabold mb-6">Designed for Focus and Clarity</h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                  Experience a beautiful, distraction-free dashboard that keeps you motivated. View your career readiness, upcoming courses, and master new skills—all in one place.
                </p>
                <ul className="space-y-4">
                  {['Intuitive progress bars', 'Dynamic radar charts', 'Dark & light glass modes', 'Mobile responsive'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-700 dark:text-gray-300 font-semibold">
                      <div className="w-6 h-6 rounded-full glass-pill flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs">
                        ✓
                      </div>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>
            
            {/* Mock UI Dashboard */}
            <ScrollReveal direction="right" delay={100}>
              <div className="relative">
                <div className="glass-default rounded-3xl shadow-2xl p-5 md:p-7 select-none hover:-translate-y-2 transition-all duration-300">
                  <div className="flex items-center justify-between mb-6">
                    <div className="space-y-1.5">
                      <div className="h-4 w-32 bg-indigo-500/20 rounded animate-pulse" />
                      <div className="h-3 w-48 bg-purple-500/15 rounded animate-pulse" />
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-indigo-500/30">
                      LD
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="glass-subtle p-4 rounded-xl">
                      <div className="h-3 w-20 bg-gray-400/20 rounded mb-3" />
                      <div className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">85%</div>
                    </div>
                    <div className="glass-subtle p-4 rounded-xl">
                      <div className="h-3 w-24 bg-gray-400/20 rounded mb-3" />
                      <div className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">12/15</div>
                    </div>
                  </div>
                  <div className="glass-subtle p-4 rounded-xl mb-2">
                    <div className="flex justify-between items-center mb-3">
                      <div className="h-4 w-40 bg-gray-400/25 rounded" />
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">Active</span>
                    </div>
                    <div className="w-full bg-black/5 dark:bg-white/10 rounded-full h-2 mb-2 overflow-hidden">
                      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                    <div className="h-3 w-32 bg-gray-400/20 rounded" />
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* 6. Role System Section */}
      <section className="py-20 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-extrabold mb-4">A Collaborative Ecosystem</h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">Multiple roles working together to ensure your success.</p>
            </div>
          </ScrollReveal>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ScrollReveal direction="up" delay={0}>
              <div className="glass-default p-8 rounded-2xl shadow-sm text-center hover:shadow-lg active:scale-[0.98] transition-all cursor-pointer select-none">
                <div className="w-16 h-16 glass-pill rounded-2xl flex items-center justify-center mx-auto mb-6 text-indigo-600 dark:text-indigo-400">
                  <GraduationCap className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-3">Learners</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">Follow personalized paths, learn via interactive content, and track progress.</p>
              </div>
            </ScrollReveal>
            
            <ScrollReveal direction="up" delay={100}>
              <div className="glass-default p-8 rounded-2xl shadow-sm text-center hover:shadow-lg active:scale-[0.98] transition-all cursor-pointer select-none">
                <div className="w-16 h-16 glass-pill rounded-2xl flex items-center justify-center mx-auto mb-6 text-purple-600 dark:text-purple-400">
                  <Users className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-3">Counselors</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">Monitor learner progress, identify bottlenecks, and assign trainers.</p>
              </div>
            </ScrollReveal>
            
            <ScrollReveal direction="up" delay={200}>
              <div className="glass-default p-8 rounded-2xl shadow-sm text-center hover:shadow-lg active:scale-[0.98] transition-all cursor-pointer select-none">
                <div className="w-16 h-16 glass-pill rounded-2xl flex items-center justify-center mx-auto mb-6 text-pink-600 dark:text-pink-400">
                  <Briefcase className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-3">Trainers</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">Manage assigned courses, answer learner queries, and provide expert guidance.</p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* 7. Floating Glass CTA Section (Live background shows through!) */}
      <section className="py-20 bg-transparent relative">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal direction="scale">
            <div className="glass-elevated rounded-3xl p-10 sm:p-14 border border-indigo-500/30 shadow-2xl relative overflow-hidden">
              <div className="relative z-10">
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-5 text-gray-900 dark:text-white tracking-tight">
                  Ready to Master New Skills?
                </h2>
                <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-9 leading-relaxed">
                  Join SkillUp today and take the first step towards a personalized, scalable, and data-driven learning journey.
                </p>
                <Link 
                  to="/login" 
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold px-9 py-4 rounded-full text-base sm:text-lg shadow-xl shadow-indigo-500/25 hover:scale-105 active:scale-95 transition-all select-none"
                >
                  Start Your Journey Today <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 8. Footer */}
      <footer className="glass-subtle pt-16 pb-8 border-t border-white/40 dark:border-white/10 mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 text-white" />
                </div>
                <span className="font-extrabold text-xl text-gray-900 dark:text-gray-100">SkillUp</span>
              </div>
              <p className="text-gray-500 dark:text-gray-400 max-w-sm text-sm">
                Empowering learners worldwide through scalable, AI-driven pathways and deeply personalized education.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100 mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                <li><a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400">Features</a></li>
                <li><a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400">Pathways</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-sm text-gray-900 dark:text-gray-100 mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                <li><a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400">About Us</a></li>
                <li><a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400">Contact</a></li>
                <li><a href="#" className="hover:text-indigo-600 dark:hover:text-indigo-400">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-white/20 dark:border-white/5 text-center text-xs text-gray-500 dark:text-gray-400">
            <p>&copy; {new Date().getFullYear()} SkillUp Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Subcomponents for cleaner code
const FeatureCard = memo(function FeatureCard({ icon, title, desc }) {
  return (
    <div className="p-7 rounded-2xl glass-default hover:border-indigo-500/40 hover:shadow-xl hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 cursor-pointer select-none">
      <div className="w-12 h-12 rounded-xl glass-pill flex items-center justify-center mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2.5">{title}</h3>
      <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{desc}</p>
    </div>
  );
});

const StepItem = memo(function StepItem({ number, title, desc }) {
  return (
    <div className="flex-1 flex flex-col items-center text-center p-6 glass-default rounded-2xl shadow-sm hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 select-none">
      <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl flex items-center justify-center font-extrabold text-lg mb-4 shadow-md shadow-indigo-500/25">
        {number}
      </div>
      <h4 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1.5">{title}</h4>
      <p className="text-gray-500 dark:text-gray-400 text-xs max-w-[220px] leading-relaxed">{desc}</p>
    </div>
  );
});
