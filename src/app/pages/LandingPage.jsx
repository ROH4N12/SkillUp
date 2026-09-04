import React, { useState, useEffect } from 'react';
import { Link } from 'react-router';
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
  Moon
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { AuroraOverlay } from '../components/ui/aurora-overlay';
import { ScrollReveal } from '../components/ui/ScrollReveal';
import { ThemeToggle } from '../components/ui/ThemeToggle';


export default function LandingPage() {
  const { theme, setTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative min-h-screen bg-zinc-50 dark:bg-zinc-900 text-gray-900 dark:text-gray-100 transition-colors duration-200 font-sans overflow-hidden">
      <AuroraOverlay />
      
      {/* 1. Navbar */}
      <nav className={`sticky top-0 z-50 transition-all duration-200 ${
        isScrolled 
          ? 'bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border-b border-indigo-500/20 shadow-lg shadow-black/5 dark:shadow-black/30' 
          : 'bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm border-b border-gray-200/60 dark:border-slate-800/60 shadow-none'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-xl tracking-tight text-gray-900 dark:text-gray-100">SkillUp</span>
            </div>
            {/* Nav Actions */}
            <div className="flex items-center gap-4">
              <ThemeToggle variant="icon" />
              <Link to="/login" className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-medium text-sm transition-colors">

                Login
              </Link>
              <Link to="/login" className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] shadow-md hover:shadow-indigo-500/25">
                Register
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-32">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-indigo-950/20 dark:to-purple-950/20" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4" /> Introducing AI-Powered Learning
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
            Your Own  <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
              Personalized Learning Platform
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-400 mb-10 leading-relaxed">
            Generate your perfect learning path, track your real-time progress, and master any skill with expert guidance and curated content.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/login" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-purple-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200 shadow-xl shadow-indigo-500/25">
              Get Started <ChevronRight className="w-5 h-5" />
            </Link>
            <a href="#features" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-slate-700 px-8 py-4 rounded-full text-lg font-semibold hover:bg-gray-100 dark:hover:bg-slate-700 hover:-translate-y-0.5 active:scale-[0.98] transition-all duration-200">
              Explore Features
            </a>
          </div>
        </div>
      </section>


      {/* 3. Features Section */}
      <section id="features" className="py-24 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-semibold mb-4">Everything you need to succeed</h2>
              <p className="text-lg text-gray-500 dark:text-gray-400">Powerful tools designed to accelerate your career growth.</p>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: <Brain className="w-6 h-6 text-indigo-700 dark:text-indigo-300 dark:text-indigo-300 dark:text-indigo-400" />, title: "AI Learning Path Generator", desc: "Enter your career goals and let AI build a step-by-step roadmap tailored specifically to your needs.", color: "indigo" },
              { icon: <BarChart className="w-6 h-6 text-purple-700 dark:text-purple-300 dark:text-purple-300 dark:text-purple-400" />, title: "Real-Time Progress Tracking", desc: "Monitor your advancement with dynamic charts, readiness scores, and visual skill gap analysis.", color: "purple" },
              { icon: <PlayCircle className="w-6 h-6 text-pink-600 dark:text-pink-400" />, title: "YouTube-Based Learning", desc: "Learn from the best. We aggregate top-quality video tutorials and projects to match your learning stage.", color: "pink" },
              { icon: <Target className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />, title: "Skill Gap Analysis", desc: "Identify exactly what you need to learn. Our radar charts compare your current skills against industry requirements.", color: "emerald" },
              { icon: <Bell className="w-6 h-6 text-amber-600 dark:text-amber-400" />, title: "Smart Notifications", desc: "Stay on track with automated reminders, course updates, and real-time alerts from your mentors.", color: "amber" },
              { icon: <Layout className="w-6 h-6 text-blue-700 dark:text-blue-300 dark:text-blue-300 dark:text-blue-400" />, title: "Role-Based Dashboards", desc: "Dedicated and specialized interfaces designed uniquely for Learners, Counselors, and Trainers.", color: "blue" }
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
      <section className="py-24 bg-gray-50 dark:bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-semibold mb-4">How SkillUp Works</h2>
              <p className="text-lg text-gray-500 dark:text-gray-400">Your journey from beginner to professional</p>
            </div>
          </ScrollReveal>
          
          <ScrollReveal direction="up" delay={150}>
            <div className="flex flex-col md:flex-row justify-center items-stretch gap-8 relative">
              <div className="hidden md:block absolute top-1/2 left-[10%] right-[10%] h-0.5 bg-gray-200 dark:bg-gray-700 -z-10 translate-y-[-50%]"></div>
              
              <StepItem number="1" title="Choose Goal" desc="Select your target career or skill" />
              <StepItem number="2" title="Get Roadmap" desc="AI generates your custom learning path" />
              <StepItem number="3" title="Start Learning" desc="Watch videos & complete projects" />
              <StepItem number="4" title="Track & Grow" desc="Monitor progress and get mentor guidance" />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 5. Dashboard Preview Section */}
      <section className="py-24 bg-white dark:bg-slate-900 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <ScrollReveal direction="left">
              <div>
                <h2 className="text-3xl md:text-4xl font-semibold mb-6">Designed for Focus and clarity</h2>
                <p className="text-lg text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
                  Experience a beautiful, distraction-free dashboard that keeps you motivated. View your career readiness, upcoming courses, and master new skills—all in one place.
                </p>
                <ul className="space-y-4">
                  {['Intuitive progress bars', 'Dynamic radar charts', 'Dark mode support', 'Mobile responsive'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-gray-700 dark:text-gray-300 font-medium">
                      <div className="w-6 h-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-700 dark:text-green-300 dark:text-green-300 dark:text-green-400">
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
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 rounded-3xl blur-3xl" />
                <div className="relative z-10 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-2xl p-4 md:p-6 select-none hover:-translate-y-2 active:scale-[0.99] transition-all duration-300 cursor-pointer">
                  <div className="flex items-center justify-between mb-6">
                    <div className="space-y-1">
                      <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      <div className="h-3 w-48 bg-gray-50 dark:bg-slate-800 dark:bg-gray-600 rounded animate-pulse" />
                    </div>
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 dark:text-indigo-300 dark:text-indigo-300 flex items-center justify-center font-semibold">
                      LD
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-white dark:bg-gray-700 p-4 rounded-xl border border-gray-100 dark:border-gray-600">
                      <div className="h-3 w-20 bg-gray-200 dark:bg-gray-600 rounded mb-3" />
                      <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100">85%</div>
                    </div>
                    <div className="bg-white dark:bg-gray-700 p-4 rounded-xl border border-gray-100 dark:border-gray-600">
                      <div className="h-3 w-24 bg-gray-200 dark:bg-gray-600 rounded mb-3" />
                      <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100">12/15</div>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-700 p-4 rounded-xl border border-gray-100 dark:border-gray-600 mb-4">
                    <div className="flex justify-between items-center mb-4">
                      <div className="h-4 w-40 bg-gray-200 dark:bg-gray-600 rounded" />
                      <div className="h-6 w-16 bg-green-100 dark:bg-green-900/30 rounded-full" />
                    </div>
                    <div className="w-full bg-gray-50 dark:bg-slate-800 dark:bg-gray-600 rounded-full h-2 mb-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                    <div className="h-3 w-32 bg-gray-200 dark:bg-gray-600 rounded" />
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* 6. Role System Section */}
      <section className="py-24 bg-indigo-100 dark:bg-indigo-900/30 dark:bg-indigo-950/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal direction="up">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-semibold mb-4">A Collaborative Ecosystem</h2>
              <p className="text-lg text-gray-500 dark:text-gray-400">Multiple roles working together to ensure your success.</p>
            </div>
          </ScrollReveal>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ScrollReveal direction="up" delay={0}>
              <div className="bg-gray-50 dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 text-center hover:shadow-md active:scale-[0.98] transition-all cursor-pointer select-none">
                <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/40 rounded-full flex items-center justify-center mx-auto mb-6">
                  <GraduationCap className="w-8 h-8 text-indigo-700 dark:text-indigo-300 dark:text-indigo-300 dark:text-indigo-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Learners</h3>
                <p className="text-gray-500 dark:text-gray-400">Follow personalized paths, learn via interactive content, and track progress.</p>
              </div>
            </ScrollReveal>
            
            <ScrollReveal direction="up" delay={100}>
              <div className="bg-gray-50 dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 text-center hover:shadow-md active:scale-[0.98] transition-all cursor-pointer select-none">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/40 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-8 h-8 text-purple-700 dark:text-purple-300 dark:text-purple-300 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Counselors</h3>
                <p className="text-gray-500 dark:text-gray-400">Monitor learner progress, identify bottlenecks, and assign trainers.</p>
              </div>
            </ScrollReveal>
            
            <ScrollReveal direction="up" delay={200}>
              <div className="bg-gray-50 dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-700 text-center hover:shadow-md active:scale-[0.98] transition-all cursor-pointer select-none">
                <div className="w-16 h-16 bg-pink-100 dark:bg-pink-900/40 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Briefcase className="w-8 h-8 text-pink-600 dark:text-pink-400" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Trainers</h3>
                <p className="text-gray-500 dark:text-gray-400">Manage assigned courses, answer learner queries, and provide expert guidance.</p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* 7. CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-800" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <ScrollReveal direction="scale">
            <h2 className="text-4xl md:text-5xl font-semibold mb-6">Ready to Master New Skills?</h2>
            <p className="text-xl text-indigo-100 mb-10">Join SkillUp today and take the first step towards a personalized, scalable, and data-driven learning journey.</p>
            <Link to="/login" className="inline-block bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 px-10 py-4 rounded-full text-lg font-medium hover:bg-gray-50 hover:scale-105 active:scale-95 transition-all shadow-2xl select-none">
              Start Your Journey Today
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* 8. Footer */}

      <footer className="bg-white dark:bg-slate-900 pt-16 pb-8 border-t border-gray-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 to-purple-600 rounded flex items-center justify-center">
                  <GraduationCap className="w-4 h-4 text-white" />
                </div>
                <span className="font-semibold text-xl text-gray-900 dark:text-gray-100">SkillUp</span>
              </div>
              <p className="text-gray-500 dark:text-gray-400 max-w-sm">
                Empowering learners worldwide through scalable, AI-driven pathways and deeply personalized education.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                <li><a href="#" className="hover:text-indigo-700 dark:text-indigo-300 dark:text-indigo-300 dark:hover:text-indigo-400">Features</a></li>
                <li><a href="#" className="hover:text-indigo-700 dark:text-indigo-300 dark:text-indigo-300 dark:hover:text-indigo-400">Pathways</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                <li><a href="#" className="hover:text-indigo-700 dark:text-indigo-300 dark:text-indigo-300 dark:hover:text-indigo-400">About Us</a></li>
                <li><a href="#" className="hover:text-indigo-700 dark:text-indigo-300 dark:text-indigo-300 dark:hover:text-indigo-400">Contact</a></li>
                <li><a href="#" className="hover:text-indigo-700 dark:text-indigo-300 dark:text-indigo-300 dark:hover:text-indigo-400">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-200 dark:border-slate-700 text-center text-sm text-gray-500 dark:text-gray-400">
            <p>&copy; {new Date().getFullYear()} SkillUp Platform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Subcomponents for cleaner code
function FeatureCard({ icon, title, desc, color }) {
  const colorMap = {
    indigo: "bg-indigo-100 dark:bg-indigo-900/30 dark:bg-indigo-900/20",
    purple: "bg-purple-100 dark:bg-purple-900/30 dark:bg-purple-900/20",
    pink: "bg-pink-50 dark:bg-pink-900/20",
    emerald: "bg-emerald-50 dark:bg-emerald-900/20",
    amber: "bg-amber-50 dark:bg-amber-900/20",
    blue: "bg-blue-100 dark:bg-blue-900/30 dark:bg-blue-900/20"
  };

  return (
    <div className="p-6 rounded-2xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:shadow-xl hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 cursor-pointer select-none">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${colorMap[color]}`}>
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">{title}</h3>
      <p className="text-gray-500 dark:text-gray-400 leading-relaxed">{desc}</p>
    </div>
  );
}

function StepItem({ number, title, desc }) {
  return (
    <div className="flex-1 flex flex-col items-center text-center p-4 bg-gray-50 dark:bg-slate-800 rounded-xl md:bg-transparent md:dark:bg-transparent md:rounded-none z-10 shadow-sm md:shadow-none mb-4 md:mb-0 border border-gray-200 dark:border-slate-700 md:border-none hover:-translate-y-1 active:scale-[0.98] transition-all duration-300 select-none">
      <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center font-semibold text-xl mb-4 shadow-lg shadow-indigo-500/30">
        {number}
      </div>
      <h4 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">{title}</h4>
      <p className="text-gray-500 dark:text-gray-400 text-sm max-w-[200px]">{desc}</p>
    </div>
  );
}

