import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import api from '../utils/api';
import { useStore } from '../store/useStore';
import { BackgroundManager } from '../components/3d/BackgroundManager';

export const Auth = () => {
  const [mode, setMode] = useState('login'); // login | register | otp
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', otp: '' });
  const { login: storeLogin } = useStore();
  const navigate = useNavigate();
  const [params] = useSearchParams();

  // Handle Google OAuth callback
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
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <BackgroundManager />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="card p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-extrabold">
              {mode === 'register' ? 'Create Account' : mode === 'otp' ? 'OTP Login' : 'Welcome Back'}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {mode === 'register' ? 'Start your AI-powered study journey' : 'Sign in to continue learning'}
            </p>
          </div>

          {/* Google OAuth */}
          <button onClick={googleLogin} className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors mb-6 font-medium">
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            Continue with Google
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-700" /></div>
            <div className="relative flex justify-center"><span className="bg-white dark:bg-slate-900 px-3 text-xs text-slate-400">or</span></div>
          </div>

          {/* Mode Tabs */}
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 mb-6">
            {['login', 'register', 'otp'].map(m => (
              <button key={m} onClick={() => { setMode(m); setOtpSent(false); }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === m ? 'bg-white dark:bg-slate-700 shadow-sm text-primary-600 dark:text-primary-400' : 'text-slate-500'}`}>
                {m === 'login' ? 'Login' : m === 'register' ? 'Register' : 'OTP'}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="relative">
                <User className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                <input name="name" value={form.name} onChange={handleChange} placeholder="Full Name" required className="input-field pl-10" />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="Email" required className="input-field pl-10" />
            </div>
            {mode !== 'otp' && (
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="Password" required minLength={6} className="input-field pl-10" />
              </div>
            )}
            {mode === 'otp' && otpSent && (
              <div className="relative">
                <Lock className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
                <input name="otp" value={form.otp} onChange={handleChange} placeholder="Enter 6-digit OTP" required maxLength={6} className="input-field pl-10 text-center tracking-[0.5em] text-lg font-bold" />
              </div>
            )}
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
              {loading ? 'Please wait...' : mode === 'otp' ? (otpSent ? 'Verify OTP' : 'Send OTP') : mode === 'register' ? 'Create Account' : 'Sign In'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};
