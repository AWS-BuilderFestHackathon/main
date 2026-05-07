import { motion, useInView, useScroll, useTransform, useMotionValueEvent } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FileText, Brain, MessageCircleQuestion, CalendarDays, Sparkles, ArrowRight, ChevronDown, Upload, Cpu, Rocket, Star } from 'lucide-react';
import { BackgroundManager } from '../components/3d/BackgroundManager';
import { ThemeToggle } from '../components/layout/ThemeToggle';
import { useStore } from '../store/useStore';

// ── Animated Counter — FIXED alignment ────────────────────────
const Counter = ({ end, suffix = '', label }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / 2000, 1);
      const eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
      setCount(Math.floor(eased * end));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [isInView, end]);
  return (
    <div ref={ref} className="flex flex-col items-center justify-center text-center px-2">
      <p className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-extrabold gradient-text tabular-nums leading-none">
        {count.toLocaleString()}{suffix}
      </p>
      <p className="mt-1.5 sm:mt-2 text-[10px] xs:text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium leading-tight">
        {label}
      </p>
    </div>
  );
};

// ── Feature Card — with glow hover ────────────────────────────
const FeatureCard = ({ icon: Icon, title, description, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-50px' }}
    transition={{ delay, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
    whileHover={{ y: -10, scale: 1.03 }}
    className="card group cursor-pointer relative overflow-hidden
      hover:shadow-xl hover:shadow-primary-500/10 dark:hover:shadow-primary-500/5
      hover:border-primary-200/50 dark:hover:border-primary-800/50"
  >
    {/* Hover glow overlay */}
    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500
      bg-gradient-to-br from-primary-500/5 via-transparent to-secondary-500/5" />
    <div className="relative z-10">
      <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl gradient-bg flex items-center justify-center mb-3 sm:mb-4
        group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-lg group-hover:shadow-primary-500/30
        transition-all duration-500">
        <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:scale-110 transition-transform duration-300" />
      </div>
      <h3 className="text-base sm:text-lg font-bold mb-1.5 sm:mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300">{title}</h3>
      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{description}</p>
    </div>
  </motion.div>
);

// ── Premium Navbar with Scroll Effects ────────────────────────
const PremiumNavbar = () => {
  const { isAuthenticated, theme } = useStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const { scrollY } = useScroll();
  const isDark = theme === 'dark';

  useMotionValueEvent(scrollY, 'change', (latest) => {
    setScrolled(latest > 30);
  });

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <motion.div
          animate={{
            backgroundColor: scrolled
              ? (isDark ? 'rgba(15,23,42,0.88)' : 'rgba(255,255,255,0.88)')
              : 'rgba(0,0,0,0)',
            backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'blur(0px)',
            borderBottomColor: scrolled
              ? (isDark ? 'rgba(51,65,85,0.4)' : 'rgba(148,163,184,0.2)')
              : 'rgba(0,0,0,0)',
            boxShadow: scrolled
              ? (isDark ? '0 4px 30px rgba(0,0,0,0.3)' : '0 4px 30px rgba(0,0,0,0.06)')
              : '0 0 0 rgba(0,0,0,0)',
          }}
          transition={{ duration: 0.4 }}
          className="border-b"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14 sm:h-16">
              {/* Logo */}
              <Link to="/" className="flex items-center gap-2 group">
                <motion.img
                  src="/logo.png"
                  alt="Brainora.AI"
                  whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                  className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl object-cover"
                />
                <span className="text-lg sm:text-xl font-extrabold">
                  <span className="gradient-text">Brainora</span>
                  <span className="text-slate-400 dark:text-slate-500">.AI</span>
                </span>
              </Link>

              {/* Desktop Nav */}
              <nav className="hidden md:flex items-center gap-8">
                {['Features', 'How It Works', 'Impact'].map((item, i) => (
                  <motion.a
                    key={item}
                    href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400
                      transition-colors relative group"
                  >
                    {item}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 gradient-bg rounded-full
                      group-hover:w-full transition-all duration-300" />
                  </motion.a>
                ))}
              </nav>

              {/* Desktop Actions */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="hidden md:flex items-center gap-3"
              >
                <ThemeToggle />
                {isAuthenticated ? (
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/dashboard')} className="btn-primary text-sm py-2">
                    Dashboard
                  </motion.button>
                ) : (
                  <>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={() => navigate('/auth')} className="btn-secondary text-sm py-2">Login</motion.button>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={() => navigate('/auth')} className="btn-primary text-sm py-2">Get Started</motion.button>
                  </>
                )}
              </motion.div>

              {/* Mobile — Animated hamburger icon */}
              <div className="flex md:hidden items-center gap-2">
                <ThemeToggle />
                <button
                  onClick={() => setMobileOpen(!mobileOpen)}
                  className="relative w-10 h-10 rounded-xl flex items-center justify-center
                    hover:bg-primary-50 dark:hover:bg-primary-950 active:scale-90
                    transition-all duration-300 touch-target group"
                  aria-label="Toggle menu"
                >
                  <div className="w-5 h-4 flex flex-col justify-between items-center">
                    <motion.span
                      animate={{ rotate: mobileOpen ? 45 : 0, y: mobileOpen ? 7 : 0, width: mobileOpen ? 20 : 20 }}
                      className="block h-[2px] w-5 rounded-full bg-slate-700 dark:bg-slate-300
                        group-hover:bg-primary-500 transition-colors origin-center"
                    />
                    <motion.span
                      animate={{ opacity: mobileOpen ? 0 : 1, scaleX: mobileOpen ? 0 : 1 }}
                      className="block h-[2px] w-3.5 rounded-full bg-slate-700 dark:bg-slate-300
                        group-hover:bg-primary-500 group-hover:w-5 transition-all origin-center"
                    />
                    <motion.span
                      animate={{ rotate: mobileOpen ? -45 : 0, y: mobileOpen ? -7 : 0, width: mobileOpen ? 20 : 12 }}
                      className="block h-[2px] w-3 rounded-full bg-slate-700 dark:bg-slate-300
                        group-hover:bg-primary-500 group-hover:w-5 transition-all origin-center"
                    />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Mobile Menu */}
        <motion.div
          initial={false}
          animate={{
            height: mobileOpen ? 'auto' : 0,
            opacity: mobileOpen ? 1 : 0,
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="md:hidden overflow-hidden glass-strong"
        >
          <div className="px-4 py-4 space-y-2">
            {['Features', 'How It Works', 'Impact'].map((item, i) => (
              <motion.a
                key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, '-')}`}
                initial={{ x: -20, opacity: 0 }}
                animate={mobileOpen ? { x: 0, opacity: 1 } : {}}
                transition={{ delay: i * 0.08 }}
                onClick={() => setMobileOpen(false)}
                className="block py-3 text-sm font-medium touch-target"
              >
                {item}
              </motion.a>
            ))}
            <motion.button
              initial={{ y: 10, opacity: 0 }}
              animate={mobileOpen ? { y: 0, opacity: 1 } : {}}
              transition={{ delay: 0.25 }}
              onClick={() => { setMobileOpen(false); navigate('/auth'); }}
              className="btn-primary text-sm py-3 w-full mt-2"
            >
              {isAuthenticated ? 'Go to Dashboard' : 'Get Started Free'}
            </motion.button>
          </div>
        </motion.div>
      </motion.header>
    </>
  );
};

// ── Landing Page ──────────────────────────────────────────────
export const Landing = () => {
  const navigate = useNavigate();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.5], [1, 0.95]);
  const heroY = useTransform(scrollYProgress, [0, 0.5], [0, 50]);

  return (
    <div className="min-h-screen min-h-[100dvh] relative overflow-hidden">
      <BackgroundManager />
      <PremiumNavbar />

      {/* Hero — with parallax fade */}
      <section ref={heroRef} className="relative pt-24 sm:pt-28 pb-16 sm:pb-20 px-4 min-h-screen min-h-[100dvh] flex items-center">
        <motion.div style={{ opacity: heroOpacity, scale: heroScale, y: heroY }} className="max-w-5xl mx-auto text-center w-full">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5, type: 'spring' }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-xs sm:text-sm font-medium mb-5 sm:mb-6
                text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800"
            >
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Powered by Google Gemini AI
            </motion.div>

            <h1 className="text-3xl xs:text-4xl sm:text-5xl md:text-7xl font-extrabold leading-[1.1] mb-5 sm:mb-6">
              <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}>
                Study Smarter with{' '}
              </motion.span>
              <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.6 }}
                className="gradient-text block sm:inline">
                AI-Powered
              </motion.span>
              <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.6 }}>
                {' '}Intelligence
              </motion.span>
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9, duration: 0.6 }}
              className="text-sm sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed px-2"
            >
              Summarize notes in seconds, generate quizzes, solve doubts instantly, and plan your studies — all powered by cutting-edge AI.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1, duration: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(99,102,241,0.3)' }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/auth')}
                className="btn-primary text-base sm:text-lg px-7 sm:px-8 py-3.5 sm:py-4 flex items-center gap-2 w-full sm:w-auto justify-center"
              >
                Get Started Free <ArrowRight className="w-5 h-5" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="btn-secondary text-base sm:text-lg px-7 sm:px-8 py-3.5 sm:py-4 w-full sm:w-auto"
              >
                See Features
              </motion.button>
            </motion.div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="mt-12 sm:mt-16"
          >
            <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}>
              <ChevronDown className="w-5 h-5 sm:w-6 sm:h-6 mx-auto text-slate-400" />
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="py-16 sm:py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-3 sm:mb-4">
              Everything You Need to <span className="gradient-text">Ace Your Exams</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-2xl mx-auto px-2">Four powerful AI features designed to transform how you study.</p>
          </motion.div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            <FeatureCard delay={0} icon={FileText} title="Smart Notes" description="AI-generated summaries with key points, difficulty, and read time." />
            <FeatureCard delay={0.1} icon={Brain} title="Quiz Gen" description="Auto-generate MCQ quizzes. Take timed tests and track scores." />
            <FeatureCard delay={0.2} icon={MessageCircleQuestion} title="Doubt Solver" description="Ask any question. Get step-by-step AI explanations." />
            <FeatureCard delay={0.3} icon={CalendarDays} title="Study Planner" description="AI creates personalized day-by-day study plans." />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 sm:py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-3 sm:mb-4">How It <span className="gradient-text">Works</span></h2>
          </motion.div>
          <div className="space-y-8 sm:space-y-10">
            {[
              { n: 1, icon: Upload, t: 'Upload Your Notes', d: 'Paste text or upload files. Our AI handles any format.' },
              { n: 2, icon: Cpu, t: 'AI Processes & Organizes', d: 'Google Gemini analyzes, summarizes, generates quizzes, and builds study plans.' },
              { n: 3, icon: Rocket, t: 'Study Smarter', d: 'Use summaries, take quizzes, ask doubts, and follow your schedule.' },
            ].map((s, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: i % 2 ? 40 : -40 }}
                whileInView={{ opacity: 1, x: 0 }}
                whileHover={{ x: 8 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ delay: i * 0.15, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="flex items-start gap-4 group p-3 sm:p-4 -mx-3 sm:-mx-4 rounded-2xl
                  hover:bg-white/50 dark:hover:bg-slate-800/50 transition-all duration-300 cursor-default"
              >
                <motion.div
                  whileInView={{ scale: [0.5, 1.15, 1] }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 + 0.2, duration: 0.5 }}
                  className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 rounded-full gradient-bg flex items-center justify-center text-white font-bold text-sm
                    shadow-lg shadow-primary-500/30 group-hover:shadow-xl group-hover:shadow-primary-500/40
                    group-hover:scale-110 transition-all duration-300"
                >
                  {s.n}
                </motion.div>
                <div>
                  <h3 className="font-bold text-base sm:text-lg mb-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300">{s.t}</h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{s.d}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats — FIXED counter alignment */}
      <section id="impact" className="py-16 sm:py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="card p-6 sm:p-10"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
              <Counter end={12500} suffix="+" label="Notes Summarized" />
              <Counter end={8200} suffix="+" label="Quizzes Generated" />
              <Counter end={3400} suffix="+" label="Doubts Solved" />
              <Counter end={15000} suffix="+" label="Hours Saved" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 sm:py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-3 sm:mb-4">Students <span className="gradient-text">Love It</span></h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {[
              { name: 'Priya S.', quote: 'Cut my study prep time in half. The quiz generator is incredibly accurate!' },
              { name: 'Rahul M.', quote: 'The doubt solver explained calculus better than my textbook. Lifesaver!' },
              { name: 'Ananya K.', quote: "AI study planner kept me on track for 3 finals. Got A's in all of them." },
            ].map((t, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{ y: -6, scale: 1.02 }}
                className="card text-center group relative overflow-hidden
                  hover:shadow-xl hover:shadow-amber-500/10 hover:border-amber-200/30 dark:hover:border-amber-800/30"
              >
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500
                  bg-gradient-to-t from-amber-500/5 to-transparent" />
                <div className="relative z-10">
                  <div className="flex justify-center gap-0.5 mb-3">
                    {[...Array(5)].map((_, j) => (
                      <motion.span key={j} whileHover={{ scale: 1.3, rotate: 15 }}>
                        <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-400 text-amber-400
                          group-hover:drop-shadow-[0_0_6px_rgba(251,191,36,0.5)] transition-all duration-300" />
                      </motion.span>
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 italic mb-3">"{t.quote}"</p>
                  <p className="font-semibold text-sm group-hover:gradient-text transition-all duration-300">{t.name}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-24 px-4 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-3 sm:mb-4">Ready to <span className="gradient-text">Ace Your Exams?</span></h2>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mb-6 sm:mb-8">Join thousands of students already studying smarter with AI.</p>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(99,102,241,0.3)' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/auth')}
            className="btn-primary text-base sm:text-lg px-8 sm:px-10 py-3.5 sm:py-4"
          >
            Start Free Now <ArrowRight className="w-5 h-5 inline ml-2" />
          </motion.button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-6 sm:py-8 px-4 border-t border-slate-200/50 dark:border-slate-700/50 text-center space-y-1.5">
        <p className="text-xs sm:text-sm text-slate-400">
          © {new Date().getFullYear()} <span className="font-semibold gradient-text">Brainora.AI</span> — All rights reserved.
        </p>
        <p className="text-[10px] sm:text-xs text-slate-400/70 font-medium tracking-wide uppercase">
          Developed by <span className="text-primary-500 dark:text-primary-400 font-semibold">Cyber Centinals</span>
        </p>
      </footer>
    </div>
  );
};
