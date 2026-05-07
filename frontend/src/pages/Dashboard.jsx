import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Brain, MessageCircleQuestion, CalendarDays, TrendingUp, Flame, Clock, Sparkles } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useStore } from '../store/useStore';
import api from '../utils/api';
import { getGreeting, timeAgo } from '../utils/helpers';

const StatCard = ({ icon: Icon, label, value, color, delay }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }} className="card flex items-center gap-4">
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <p className="text-2xl font-extrabold">{value}</p>
      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{label}</p>
    </div>
  </motion.div>
);

const QuickAction = ({ icon: Icon, title, desc, to, delay }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
    <Link to={to} className="card flex items-center gap-4 group hover:border-primary-300 dark:hover:border-primary-700">
      <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center group-hover:scale-110 transition-transform">
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="font-semibold text-sm">{title}</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{desc}</p>
      </div>
    </Link>
  </motion.div>
);

// Sample chart data
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
    <div className="space-y-8">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold">{getGreeting()}, <span className="gradient-text">{user?.name?.split(' ')[0]}</span>!</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 italic">"{quote}"</p>
        </div>
        <p className="text-sm text-slate-400">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard delay={0} icon={FileText} label="Total Notes" value={s.totalNotes || 0} color="bg-indigo-500" />
        <StatCard delay={0.1} icon={Brain} label="Quizzes Taken" value={s.totalQuizzes || 0} color="bg-purple-500" />
        <StatCard delay={0.2} icon={Flame} label="Study Streak" value={`${s.studyStreak || 0} days`} color="bg-orange-500" />
        <StatCard delay={0.3} icon={Clock} label="Hours Studied" value="12.5" color="bg-emerald-500" />
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-bold mb-4">Quick Actions</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <QuickAction delay={0} icon={FileText} title="Summarize Notes" desc="Upload & summarize with AI" to="/notes" />
          <QuickAction delay={0.1} icon={Brain} title="Take a Quiz" desc="Test your knowledge" to="/quiz" />
          <QuickAction delay={0.2} icon={MessageCircleQuestion} title="Ask a Doubt" desc="Get instant AI explanations" to="/doubts" />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Weekly Chart */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="card">
          <h3 className="font-bold mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-primary-500" />Weekly Study Hours</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,.1)' }} />
              <Line type="monotone" dataKey="hours" stroke="#6366f1" strokeWidth={3} dot={{ fill: '#6366f1', r: 5 }} activeDot={{ r: 7 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Recent Activity */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="card">
          <h3 className="font-bold mb-4 flex items-center gap-2"><Sparkles className="w-5 h-5 text-primary-500" />Recent Activity</h3>
          <div className="space-y-3 max-h-56 overflow-y-auto">
            {stats?.recentActivity?.notes?.map((n, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                <FileText className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{n.title}</p><p className="text-xs text-slate-400">{timeAgo(n.createdAt)}</p></div>
              </div>
            ))}
            {stats?.recentActivity?.quizzes?.map((q, i) => (
              <div key={`q-${i}`} className="flex items-center gap-3 py-2 border-b border-slate-100 dark:border-slate-800 last:border-0">
                <Brain className="w-4 h-4 text-purple-500 flex-shrink-0" />
                <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{q.title} — {q.score}%</p><p className="text-xs text-slate-400">{timeAgo(q.completedAt)}</p></div>
              </div>
            ))}
            {!stats?.recentActivity?.notes?.length && !stats?.recentActivity?.quizzes?.length && (
              <p className="text-sm text-slate-400 text-center py-8">No activity yet. Start by summarizing some notes!</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};
