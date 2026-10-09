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
  Loader2,
  CheckCircle2,
  ShieldAlert,
  Flame
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { WavyBackground } from '../components/ui/blue-meshy-background';
import { ScrollReveal } from '../components/ui/ScrollReveal';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { getApiUrl } from '../config/api';
import HeroSection from '../components/ui/hero-01-utils/hero';
import Header from '../components/ui/hero-01-utils/header';

const navigationData = [
  {
    title: "Home",
    href: "#",
    isActive: true,
  },
  {
    title: "Features",
    href: "#features",
  },
  {
    title: "How It Works",
    href: "#how-it-works",
  },
  {
    title: "Platform",
    href: "/dashboard",
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [demoLoading, setDemoLoading] = useState(null);
  const [activeHeroTab, setActiveHeroTab] = useState('learner');

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

      {/* 1. Header Navigation from Hero-01 */}
      <Header navigationData={navigationData} onGetStarted={() => navigate('/login')} />

      {/* 2. Hero-01 Section */}
      <main className="relative">
        <HeroSection onGetStarted={() => navigate('/login')} />

        {/* Simplified Glass Tabs for 3 Roles & 1-Click Interactive Sandboxes */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
          <div className="glass-elevated rounded-3xl p-6 sm:p-8 border border-white/70 dark:border-white/10 shadow-2xl shadow-indigo-950/5 dark:shadow-black/40 backdrop-blur-2xl text-center">

            {/* Header Badge & Title */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full glass-pill text-purple-700 dark:text-purple-300 text-xs font-semibold uppercase tracking-wider mb-2.5 border border-purple-500/20 font-accent">
              <Zap className="w-3.5 h-3.5 text-purple-500 fill-purple-500/20" /> Live Interactive Sandboxes
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
              Evaluate Live Role Dashboards in 1 Click
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-6 max-w-lg mx-auto">
              Switch between roles below to preview each tailored interface, live metrics, and instant sandbox workspace:
            </p>

            {/* Glass Tabs Switcher */}
            <div className="inline-flex p-1.5 rounded-2xl glass-pill border border-white/60 dark:border-white/10 gap-1 sm:gap-2 mb-6">
              <button
                type="button"
                onClick={() => setActiveHeroTab('learner')}
                className={`px-3.5 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer flex items-center gap-2 ${activeHeroTab === 'learner'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
              >
                <GraduationCap className="w-4 h-4" /> Learner
              </button>
              <button
                type="button"
                onClick={() => setActiveHeroTab('trainer')}
                className={`px-3.5 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer flex items-center gap-2 ${activeHeroTab === 'trainer'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-500/30'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
              >
                <Briefcase className="w-4 h-4" /> Trainer
              </button>
              <button
                type="button"
                onClick={() => setActiveHeroTab('counselor')}
                className={`px-3.5 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer flex items-center gap-2 ${activeHeroTab === 'counselor'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/30'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
              >
                <Users className="w-4 h-4" /> Counselor
              </button>
            </div>

            {/* Active Tab Preview Card */}
            <div className="text-left bg-white/40 dark:bg-white/5 rounded-2xl p-4 sm:p-6 border border-white/60 dark:border-white/10 backdrop-blur-md">
              {/* Tab 1: Learner */}
              {activeHeroTab === 'learner' && (
                <div className="space-y-3.5 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-xs">
                        RO
                      </div>
                      <div>
                        <div className="text-[11px] font-semibold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-accent">
                          Learner Track • Rohan
                        </div>
                        <h3 className="font-display font-bold text-base text-gray-900 dark:text-white leading-tight">
                          Full-Stack AI Engineer Path
                        </h3>
                      </div>
                    </div>
                    <span className="font-accent text-xs font-bold px-2.5 py-1 rounded-full glass-pill text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
                      84% Readiness
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="p-2.5 sm:p-3 rounded-xl glass-default border border-white/60 dark:border-white/10 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span className="text-xs font-medium text-gray-800 dark:text-gray-200">
                          1. Foundations & PyTorch Core
                        </span>
                      </div>
                      <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 font-accent">100%</span>
                    </div>

                    <div className="p-2.5 sm:p-3 rounded-xl glass-elevated border border-indigo-500/30 flex flex-col gap-2 shadow-xs">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                          </span>
                          <span className="text-xs font-semibold text-indigo-950 dark:text-indigo-200">
                            2. Transformer Architectures & LLM Fine-Tuning
                          </span>
                        </div>
                        <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 font-accent">68%</span>
                      </div>
                      <div className="w-full bg-indigo-200/50 dark:bg-indigo-950/50 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full w-[68%] rounded-full" />
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl glass-default border border-white/40 dark:border-white/10 flex items-center justify-between opacity-75">
                      <div className="flex items-center gap-2.5">
                        <div className="w-4 h-4 rounded-full border border-gray-400 dark:border-gray-500 shrink-0 flex items-center justify-center text-[9px] text-gray-500">3</div>
                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                          3. Production Vector DBs & RAG Pipelines
                        </span>
                      </div>
                      <span className="text-[10px] font-medium text-gray-500 font-accent">Upcoming</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl glass-pill text-xs text-gray-600 dark:text-gray-300 flex items-center gap-2 border border-white/50 dark:border-white/10">
                    <Compass className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span className="text-[11px]">Adaptive Engine: <strong>Dynamic path updates</strong> calibrated to Rohan's assessment quizzes</span>
                  </div>
                </div>
              )}

              {/* Tab 2: Trainer */}
              {activeHeroTab === 'trainer' && (
                <div className="space-y-3.5 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-xs">
                        AT
                      </div>
                      <div>
                        <div className="text-[11px] font-semibold uppercase tracking-wider text-purple-600 dark:text-purple-400 font-accent">
                          Trainer Console
                        </div>
                        <h3 className="font-display font-bold text-base text-gray-900 dark:text-white leading-tight">
                          AI Cohort Alpha (Fall '26)
                        </h3>
                      </div>
                    </div>
                    <span className="font-accent text-xs font-bold px-2.5 py-1 rounded-full glass-pill text-purple-700 dark:text-purple-300 border border-purple-500/20">
                      34 Active Students
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="p-3 rounded-xl glass-default border border-white/60 dark:border-white/10">
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                        <span>Avg Velocity</span>
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                      </div>
                      <div className="font-display font-bold text-xl text-gray-900 dark:text-white">78%</div>
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">+6% ahead of pace</div>
                    </div>

                    <div className="p-3 rounded-xl glass-default border border-white/60 dark:border-white/10">
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                        <span>At-Risk Alerts</span>
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                      </div>
                      <div className="font-display font-bold text-xl text-amber-600 dark:text-amber-400">2 Flagged</div>
                      <div className="text-[10px] text-gray-500 dark:text-gray-400">Proactive outreach ready</div>
                    </div>
                  </div>

                  <div className="p-2.5 sm:p-3 rounded-xl glass-default border border-white/60 dark:border-white/10">
                    <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                      <span className="text-gray-700 dark:text-gray-300">Attention Mechanism Module</span>
                      <span className="text-purple-600 dark:text-purple-400 font-accent font-bold">28 / 34 Submitted</span>
                    </div>
                    <div className="w-full bg-purple-200/40 dark:bg-purple-950/40 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full w-[82%] rounded-full" />
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl glass-pill text-xs text-gray-600 dark:text-gray-300 flex items-center gap-2 border border-white/50 dark:border-white/10">
                    <Flame className="w-4 h-4 text-purple-500 shrink-0" />
                    <span className="text-[11px]">Curriculum: <strong>92% projected completion rate</strong></span>
                  </div>
                </div>
              )}

              {/* Tab 3: Counselor */}
              {activeHeroTab === 'counselor' && (
                <div className="space-y-3.5 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-accent">
                        Intervention Desk
                      </div>
                      <h3 className="font-display font-bold text-base text-gray-900 dark:text-white">
                        Guidance & Retention Hub
                      </h3>
                    </div>
                    <span className="font-accent text-xs font-bold px-2.5 py-1 rounded-full glass-pill text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                      12 Active Cases
                    </span>
                  </div>

                  <div className="p-3 sm:p-3.5 rounded-xl glass-elevated border border-emerald-500/30 space-y-2 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
                          SY
                        </div>
                        <div>
                          <div className="text-xs font-bold text-gray-900 dark:text-white">Sayujya</div>
                          <div className="text-[10px] text-gray-500 dark:text-gray-400">Junior Dev Track</div>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        High Priority
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-300 pl-9">
                      API Security module gap detected. 1-on-1 counseling session recommended with Sayujya.
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl glass-pill text-xs text-gray-600 dark:text-gray-300 flex items-center gap-2 border border-white/50 dark:border-white/10">
                    <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span className="text-[11px]">Retention Impact: <strong>88% reduction</strong> in at-risk student dropouts</span>
                  </div>
                </div>
              )}

              {/* Direct 1-Click Sandbox Launch Button for Active Role */}
              <div className="mt-5 pt-4 border-t border-white/50 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => handleDemoLogin(activeHeroTab)}
                  disabled={demoLoading !== null}
                  className={`w-full py-3 px-4 rounded-xl font-semibold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 shadow-md hover:-translate-y-0.5 active:scale-[0.98] text-white border border-white/20 ${activeHeroTab === 'learner'
                      ? 'bg-gradient-to-r from-indigo-600 via-indigo-700 to-indigo-800 hover:from-indigo-500 hover:to-indigo-700 shadow-indigo-500/25'
                      : activeHeroTab === 'trainer'
                        ? 'bg-gradient-to-r from-purple-600 via-purple-700 to-purple-800 hover:from-purple-500 hover:to-purple-700 shadow-purple-500/25'
                        : 'bg-gradient-to-r from-emerald-600 via-emerald-700 to-emerald-800 hover:from-emerald-500 hover:to-emerald-700 shadow-emerald-500/25'
                    }`}
                >
                  {demoLoading === activeHeroTab ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Launching {activeHeroTab} Portal...</>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-white/20" />
                      <span>Launch Live {activeHeroTab.charAt(0).toUpperCase() + activeHeroTab.slice(1)} Portal</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
                <p className="text-center text-[11px] text-gray-500 dark:text-gray-400 mt-2">
                  Instant 1-click sandbox access • Pre-loaded sample data • No login required
                </p>
              </div>

            </div>
          </div>
        </div>
      </main>

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
