import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Brain, MessageCircleQuestion, CalendarDays, Sparkles, ArrowRight, ChevronDown, Upload, Cpu, Rocket, Star } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { BackgroundManager } from '../components/3d/BackgroundManager';

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
      setCount(Math.floor(p * end));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [isInView, end]);
  return (
    <div ref={ref} className="text-center">
      <p className="text-4xl md:text-5xl font-extrabold gradient-text">{count.toLocaleString()}{suffix}</p>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 font-medium">{label}</p>
    </div>
  );
};

const FeatureCard = ({ icon: Icon, title, description, delay }) => (
  <motion.div initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
    transition={{ delay, duration: 0.5 }} whileHover={{ y: -8, scale: 1.02 }} className="card group cursor-pointer">
    <div className="w-12 h-12 rounded-2xl gradient-bg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
      <Icon className="w-6 h-6 text-white" />
    </div>
    <h3 className="text-lg font-bold mb-2">{title}</h3>
    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{description}</p>
  </motion.div>
);

export const Landing = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen relative overflow-hidden">
      <BackgroundManager />
      <Navbar />

      {/* Hero */}
      <section className="relative pt-28 pb-20 px-4 min-h-screen flex items-center">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm font-medium mb-6 text-primary-600 dark:text-primary-400">
              <Sparkles className="w-4 h-4" /> Powered by Google Gemini AI
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold leading-tight mb-6">
              Study Smarter with <span className="gradient-text">AI-Powered</span> Intelligence
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
              Summarize notes in seconds, generate quizzes, solve doubts instantly, and plan your studies — all powered by cutting-edge AI.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate('/auth')} className="btn-primary text-lg px-8 py-4 flex items-center gap-2">
                Get Started Free <ArrowRight className="w-5 h-5" />
              </motion.button>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="btn-secondary text-lg px-8 py-4">
                See Features
              </motion.button>
            </div>
          </motion.div>
          <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }} className="mt-16">
            <ChevronDown className="w-6 h-6 mx-auto text-slate-400" />
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">Everything You Need to <span className="gradient-text">Ace Your Exams</span></h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">Four powerful AI features designed to transform how you study.</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard delay={0} icon={FileText} title="Smart Notes Summarizer" description="Upload notes and get AI summaries with key points, difficulty, and read time." />
            <FeatureCard delay={0.1} icon={Brain} title="Quiz Generator" description="Auto-generate MCQ quizzes from notes. Take timed quizzes and track scores." />
            <FeatureCard delay={0.2} icon={MessageCircleQuestion} title="AI Doubt Solver" description="Ask any question and get step-by-step explanations with code support." />
            <FeatureCard delay={0.3} icon={CalendarDays} title="Study Planner" description="AI creates personalized day-by-day plans based on your exams and schedule." />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-4">
        <div className="max-w-3xl mx-auto">
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">How It <span className="gradient-text">Works</span></h2>
          </motion.div>
          <div className="space-y-10">
            {[
              { n: 1, icon: Upload, t: 'Upload Your Notes', d: 'Paste text or upload files. Our AI handles any format.' },
              { n: 2, icon: Cpu, t: 'AI Processes & Organizes', d: 'Google Gemini analyzes, summarizes, generates quizzes, and builds study plans.' },
              { n: 3, icon: Rocket, t: 'Study Smarter', d: 'Use summaries, take quizzes, ask doubts, and follow your optimized schedule.' },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: i % 2 ? 40 : -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15, duration: 0.5 }} className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full gradient-bg flex items-center justify-center text-white font-bold text-sm">{s.n}</div>
                <div><h3 className="font-bold text-lg mb-1">{s.t}</h3><p className="text-sm text-slate-500 dark:text-slate-400">{s.d}</p></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section id="stats" className="py-24 px-4">
        <div className="max-w-4xl mx-auto card p-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <Counter end={12500} suffix="+" label="Notes Summarized" />
            <Counter end={8200} suffix="+" label="Quizzes Generated" />
            <Counter end={3400} suffix="+" label="Doubts Solved" />
            <Counter end={15000} suffix="+" label="Hours Saved" />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <h2 className="text-3xl font-extrabold mb-4">Students <span className="gradient-text">Love It</span></h2>
        </div>
        <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6">
          {[
            { name: 'Priya S.', quote: 'Cut my study prep time in half. The quiz generator is incredibly accurate!' },
            { name: 'Rahul M.', quote: 'The doubt solver explained calculus better than my textbook. Lifesaver!' },
            { name: 'Ananya K.', quote: "AI study planner kept me on track for 3 finals. Got A's in all of them." },
          ].map((t, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="card text-center">
              <div className="flex justify-center gap-0.5 mb-3">{[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />)}</div>
              <p className="text-sm text-slate-600 dark:text-slate-300 italic mb-3">"{t.quote}"</p>
              <p className="font-semibold text-sm">{t.name}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-4 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}>
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">Ready to <span className="gradient-text">Ace Your Exams?</span></h2>
          <p className="text-slate-500 dark:text-slate-400 mb-8 text-lg">Join thousands of students already studying smarter with AI.</p>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate('/auth')} className="btn-primary text-lg px-10 py-4">
            Start Free Now <ArrowRight className="w-5 h-5 inline ml-2" />
          </motion.button>
        </motion.div>
      </section>

      <footer className="py-8 px-4 border-t border-slate-200/50 dark:border-slate-700/50 text-center">
        <p className="text-sm text-slate-400">© 2026 StudyAI — Built with ❤️ for AWS BuilderFest Hackathon</p>
      </footer>
    </div>
  );
};
