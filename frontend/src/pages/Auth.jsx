import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Sparkles, Loader2, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import api from '../utils/api';
import { useStore } from '../store/useStore';
import { BackgroundManager } from '../components/3d/BackgroundManager';

// ── Carousel slides data ──────────────────────────────────────
const slides = [
  { img: '/carousel/1.png', title: 'Focus & Flow', quote: '"The secret of getting ahead is getting started."', author: '— Mark Twain' },
  { img: '/carousel/2.png', title: 'Celebrate Success', quote: '"Success is the sum of small efforts, repeated day in and day out."', author: '— Robert Collier' },
  { img: '/carousel/3.png', title: 'Learn Together', quote: '"Alone we can do so little; together we can do so much."', author: '— Helen Keller' },
  { img: '/carousel/4.png', title: 'Knowledge is Power', quote: '"An investment in knowledge pays the best interest."', author: '— Benjamin Franklin' },
  { img: '/carousel/5.png', title: 'Unlock Your Potential', quote: '"The beautiful thing about learning is nobody can take it from you."', author: '— B.B. King' },
];

// ── Motivational Carousel ─────────────────────────────────────
const MotivationalCarousel = () => {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);

  const next = useCallback(() => { setDirection(1); setCurrent(c => (c + 1) % slides.length); }, []);
  const prev = useCallback(() => { setDirection(-1); setCurrent(c => (c - 1 + slides.length) % slides.length); }, []);

  // Auto-advance every 5s
  useEffect(() => {
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [next]);

  const variants = {
    enter: (d) => ({ x: d > 0 ? 300 : -300, opacity: 0, scale: 0.95 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (d) => ({ x: d > 0 ? -300 : 300, opacity: 0, scale: 0.95 }),
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden rounded-2xl sm:rounded-3xl
      bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900">

      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(139,92,246,0.3),transparent_60%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(99,102,241,0.2),transparent_60%)]" />

      {/* Image with crossfade */}
      <div className="relative w-full flex-1 flex items-center justify-center p-4 sm:p-8">
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={current}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="w-full max-w-xs sm:max-w-sm"
          >
            <motion.img
              src={slides[current].img}
              alt={slides[current].title}
              className="w-full aspect-square rounded-2xl object-cover shadow-2xl shadow-black/30
                ring-2 ring-white/10"
              whileHover={{ scale: 1.03, rotate: 1 }}
              transition={{ duration: 0.4 }}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Quote overlay */}
      <div className="relative z-10 px-4 sm:px-8 pb-6 sm:pb-8 text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <h3 className="text-lg sm:text-xl font-bold text-white mb-2">{slides[current].title}</h3>
            <p className="text-xs sm:text-sm text-white/80 italic leading-relaxed mb-1">{slides[current].quote}</p>
            <p className="text-[10px] sm:text-xs text-white/50 font-medium">{slides[current].author}</p>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-center gap-4 mt-4 sm:mt-5">
          <button onClick={prev} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20
            flex items-center justify-center transition-all active:scale-90 touch-target">
            <ChevronLeft className="w-4 h-4 text-white" />
          </button>

          {/* Dots */}
          <div className="flex gap-1.5">
            {slides.map((_, i) => (
              <button key={i} onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i); }}
                className="touch-target flex items-center justify-center p-1">
                <motion.div
                  animate={{ width: i === current ? 20 : 6, backgroundColor: i === current ? '#fff' : 'rgba(255,255,255,0.3)' }}
                  className="h-1.5 rounded-full"
                  transition={{ duration: 0.3 }}
                />
              </button>
            ))}
          </div>

          <button onClick={next} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20
            flex items-center justify-center transition-all active:scale-90 touch-target">
            <ChevronRight className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Auth Page ─────────────────────────────────────────────────
export const Auth = () => {
  const [mode, setMode] = useState('login');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', otp: '' });
  const { login: storeLogin } = useStore();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  // Google OAuth callback
  if (params.get('token')) {
    const token = params.get('token');
    api.get('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
      .then(res => { storeLogin(res.data.user, token); navigate('/dashboard'); })
      .catch(() => toast.error('OAuth failed'));
  }

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'otp' && !otpSent) {
        await api.post('/api/auth/send-otp', { email: form.email });
        setOtpSent(true);
        toast.success('OTP sent to your email!');
      } else if (mode === 'otp' && otpSent) {
        const { data } = await api.post('/api/auth/verify-otp', { email: form.email, otp: form.otp });
        storeLogin(data.user, data.token);
        toast.success('Welcome back!');
        navigate('/dashboard');
      } else if (mode === 'register') {
        const { data } = await api.post('/api/auth/register', { name: form.name, email: form.email, password: form.password });
        storeLogin(data.user, data.token);
        toast.success('Account created!');
        navigate('/dashboard');
      } else {
        const { data } = await api.post('/api/auth/login', { email: form.email, password: form.password });
        storeLogin(data.user, data.token);
        toast.success('Welcome back!');
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/google`;
  };

  return (
    <div className="min-h-screen min-h-[100dvh] flex items-center justify-center p-4 relative">
      <BackgroundManager />

      {/* Split layout: Carousel (left/top) + Form (right/bottom) */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-4xl flex flex-col lg:flex-row rounded-2xl sm:rounded-3xl overflow-hidden
          glass card-shadow dark:card-shadow-dark relative"
      >
        {/* Carousel Panel — top on mobile, left on desktop */}
        <div className="w-full lg:w-[55%] h-56 sm:h-72 lg:h-auto lg:min-h-[580px] flex-shrink-0">
          <MotivationalCarousel />
        </div>

        {/* Form Panel */}
        <div className="w-full lg:w-[45%] p-5 sm:p-8 flex flex-col justify-center">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-center mb-5 sm:mb-6"
          >
            <motion.div
              whileHover={{ rotate: [0, -8, 8, 0], scale: 1.1 }}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-3"
            >
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </motion.div>
            <h1 className="text-xl sm:text-2xl font-extrabold">
              <AnimatePresence mode="wait">
                <motion.span key={mode} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  {mode === 'register' ? 'Create Account' : mode === 'otp' ? 'OTP Login' : 'Welcome Back'}
                </motion.span>
              </AnimatePresence>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              {mode === 'register' ? 'Start your journey with Brainora.AI' : 'Sign in to Brainora.AI'}
            </p>
          </motion.div>

          {/* Google OAuth */}
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={googleLogin}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl
              border border-slate-200/60 dark:border-slate-700/60
              hover:border-primary-300 dark:hover:border-primary-700
              hover:shadow-lg hover:shadow-primary-500/10
              bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm
              transition-all duration-300 mb-5 font-medium text-sm touch-target"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continue with Google
          </motion.button>

          {/* Divider */}
          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200/50 dark:border-slate-700/50" /></div>
            <div className="relative flex justify-center"><span className="bg-white/80 dark:bg-slate-900/80 px-3 text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider">or use email</span></div>
          </div>

          {/* Mode Tabs */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="flex rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 p-1 mb-5 gap-0.5"
          >
            {['login', 'register', 'otp'].map(m => (
              <button key={m} onClick={() => { setMode(m); setOtpSent(false); }}
                className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all duration-300 touch-target relative
                  ${mode === m ? 'text-primary-600 dark:text-primary-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
                {mode === m && (
                  <motion.div layoutId="auth-tab" className="absolute inset-0 bg-white dark:bg-slate-700 rounded-xl shadow-sm"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
                )}
                <span className="relative z-10">{m === 'login' ? 'Login' : m === 'register' ? 'Register' : 'OTP'}</span>
              </button>
            ))}
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <AnimatePresence mode="wait">
              {mode === 'register' && (
                <motion.div key="name" initial={{ opacity: 0, x: -20, height: 0 }} animate={{ opacity: 1, x: 0, height: 'auto' }}
                  exit={{ opacity: 0, x: 20, height: 0 }} className="relative overflow-hidden">
                  <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input name="name" value={form.name} onChange={handleChange} placeholder="Full Name" required
                    className="input-field pl-10 text-sm" autoComplete="name" />
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="relative">
              <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email address" required
                className="input-field pl-10 text-sm" autoComplete="email" enterKeyHint="next" />
            </motion.div>

            <AnimatePresence mode="wait">
              {mode !== 'otp' && (
                <motion.div key="password" initial={{ opacity: 0, x: -20, height: 0 }} animate={{ opacity: 1, x: 0, height: 'auto' }}
                  exit={{ opacity: 0, x: 20, height: 0 }} className="relative overflow-hidden">
                  <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Password" required minLength={6}
                    className="input-field pl-10 text-sm" autoComplete={mode === 'register' ? 'new-password' : 'current-password'} enterKeyHint="done" />
                </motion.div>
              )}
              {mode === 'otp' && otpSent && (
                <motion.div key="otp" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input name="otp" value={form.otp} onChange={handleChange} placeholder="Enter 6-digit OTP" required maxLength={6}
                    className="input-field pl-10 text-center tracking-[0.5em] text-lg font-bold" inputMode="numeric" enterKeyHint="done" />
                </motion.div>
              )}
            </AnimatePresence>

            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.96 }}
              type="submit" disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
              {loading ? 'Please wait...' : mode === 'otp' ? (otpSent ? 'Verify OTP' : 'Send OTP') : mode === 'register' ? 'Create Account' : 'Sign In'}
            </motion.button>
          </form>

          {/* Footer */}
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
            className="text-[10px] sm:text-xs text-slate-400 text-center mt-4 sm:mt-5">
            By continuing, you agree to our Terms of Service
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
};
