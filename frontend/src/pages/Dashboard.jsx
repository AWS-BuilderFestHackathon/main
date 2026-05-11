import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Brain, MessageCircleQuestion, CalendarDays, TrendingUp, Flame, Clock, Sparkles } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useStore } from '../store/useStore';
import api from '../utils/api';
import { getGreeting, timeAgo } from '../utils/helpers';

const StatCard = ({ icon: Icon, label, value, color, delay }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
    className="card flex items-center gap-3 sm:gap-4 p-3 sm:p-4">
    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center flex-shrink-0 ${color}`}>
      <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
    </div>
    <div className="min-w-0">
      <p className="text-xl sm:text-2xl font-extrabold leading-tight">{value}</p>
      <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium truncate">{label}</p>
    </div>
  </motion.div>
);

const QuickAction = ({ icon: Icon, title, desc, to, delay }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
    <Link to={to} className="card flex items-center gap-3 sm:gap-4 group hover:border-primary-300 dark:hover:border-primary-700 p-3 sm:p-4 touch-target">
      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl gradient-bg flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
        <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
      </div>
      <div className="min-w-0">
        <p className="font-semibold text-sm">{title}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{desc}</p>
      </div>
    </Link>
  </motion.div>
);

const chartData = [
  { day: 'Mon', hours: 2.5 }, { day: 'Tue', hours: 3 }, { day: 'Wed', hours: 1.5 },
  { day: 'Thu', hours: 4 }, { day: 'Fri', hours: 2 }, { day: 'Sat', hours: 3.5 }, { day: 'Sun', hours: 2.8 },
];

export const Dashboard = () => {
  const { user } = useStore();
  const [stats, setStats] = useState(null);
  const [quote, setQuote] = useState('The beautiful thing about learning is that nobody can take it away from you.');

  useEffect(() => {
    api.get('/api/user/stats').then(r => setStats(r.data)).catch(() => {});
    api.post('/api/background/generate', { timeOfDay: new Date().getHours() < 12 ? 'morning' : 'afternoon' })
      .then(r => r.data.quote && setQuote(r.data.quote)).catch(() => {});
  }, []);

  const s = stats?.stats || {};

  return (
    <div className="space-y-5 sm:space-y-8">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl sm:text-3xl font-extrabold">
          {getGreeting()}, <span className="gradient-text">{user?.name?.split(' ')[0]}</span>!
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 italic line-clamp-2">"{quote}"</p>
        <p className="text-xs text-slate-400 mt-1 sm:mt-0 sm:hidden">
          {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
        </p>
      </motion.div>

      {/* Stats — 2×2 grid on mobile */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <StatCard delay={0} icon={FileText} label="Total Notes" value={s.totalNotes || 0} color="bg-indigo-500" />
        <StatCard delay={0.1} icon={Brain} label="Quizzes Taken" value={s.totalQuizzes || 0} color="bg-purple-500" />
        <StatCard delay={0.2} icon={Flame} label="Study Streak" value={`${s.studyStreak || 0}d`} color="bg-orange-500" />
        <StatCard delay={0.3} icon={Clock} label="Hours Studied" value="12.5" color="bg-emerald-500" />
      </div>

      {/* Quick Actions — horizontal scroll on mobile, grid on desktop */}
      <div>
        <h2 className="text-base sm:text-lg font-bold mb-3">Quick Actions</h2>
        <div className="flex gap-3 overflow-x-auto pb-2 sm:pb-0 sm:grid sm:grid-cols-3 sm:overflow-visible
          -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory">
          <div className="min-w-[75%] sm:min-w-0 snap-start">
            <QuickAction delay={0} icon={FileText} title="Summarize Notes" desc="Upload & summarize with AI" to="/notes" />
          </div>
          <div className="min-w-[75%] sm:min-w-0 snap-start">
            <QuickAction delay={0.1} icon={Brain} title="Take a Quiz" desc="Test your knowledge" to="/quiz" />
          </div>
          <div className="min-w-[75%] sm:min-w-0 snap-start">
            <QuickAction delay={0.2} icon={MessageCircleQuestion} title="Ask a Doubt" desc="Get instant AI answers" to="/doubts" />
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        {/* Weekly Chart */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="card">
          <h3 className="font-bold text-sm sm:text-base mb-3 sm:mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary-500" />Weekly Study
          </h3>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} width={30} />
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,.1)', fontSize: 12 }} />
              <Line type="monotone" dataKey="hours" stroke="#6366f1" strokeWidth={2.5} dot={{ fill: '#6366f1', r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Recent Activity */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="card">
          <h3 className="font-bold text-sm sm:text-base mb-3 sm:mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary-500" />Recent Activity
          </h3>
          <div className="space-y-2 sm:space-y-3 max-h-44 sm:max-h-56 overflow-y-auto">
            {stats?.recentActivity?.notes?.map((n, i) => (
              <div key={i} className="flex items-center gap-2.5 sm:gap-3 py-1.5 sm:py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                <FileText className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{n.title}</p>
                  <p className="text-[10px] sm:text-xs text-slate-400">{timeAgo(n.createdAt)}</p>
                </div>
              </div>
            ))}
            {stats?.recentActivity?.quizzes?.map((q, i) => (
              <div key={`q-${i}`} className="flex items-center gap-2.5 sm:gap-3 py-1.5 sm:py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                <Brain className="w-4 h-4 text-purple-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{q.title} — {q.score}%</p>
                  <p className="text-[10px] sm:text-xs text-slate-400">{timeAgo(q.completedAt)}</p>
                </div>
              </div>
            ))}
            {!stats?.recentActivity?.notes?.length && !stats?.recentActivity?.quizzes?.length && (
              <p className="text-sm text-slate-400 text-center py-6 sm:py-8">No activity yet. Start by summarizing some notes!</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
