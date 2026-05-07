import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, Plus, Loader2, Sparkles, Trash2, Check, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import api from '../utils/api';
import { formatDate } from '../utils/helpers';

export const Planner = () => {
  const [plans, setPlans] = useState([]);
  const [activePlan, setActivePlan] = useState(null);
  const [showGen, setShowGen] = useState(false);
  const [showTasks, setShowTasks] = useState(false); // mobile: toggle between plan list and tasks
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ subject: '', examDate: '', hoursPerDay: 2, currentLevel: 'beginner' });

  useEffect(() => {
    api.get('/api/planner').then(r => setPlans(r.data.plans || [])).catch(() => {});
  }, []);

  const generate = async () => {
    if (!form.subject || !form.examDate) return toast.error('Subject and exam date required');
    setLoading(true);
    try {
      const { data } = await api.post('/api/planner/generate', form);
      setPlans(p => [data.plan, ...p]);
      setActivePlan(data.plan);
      setShowGen(false);
      setShowTasks(true);
      toast.success('Study plan generated!');
    } catch (e) { toast.error(e.response?.data?.message || 'Generation failed'); }
    finally { setLoading(false); }
  };

  const toggleTask = async (planId, taskId, completed) => {
    try {
      const { data } = await api.put(`/api/planner/${planId}/task/${taskId}`, { completed: !completed });
      setActivePlan(data.plan);
      setPlans(p => p.map(x => x._id === planId ? data.plan : x));
    } catch { toast.error('Update failed'); }
  };

  const deletePlan = async (id) => {
    await api.delete(`/api/planner/${id}`);
    setPlans(p => p.filter(x => x._id !== id));
    if (activePlan?._id === id) { setActivePlan(null); setShowTasks(false); }
    toast.success('Plan deleted');
  };

  const selectPlan = (p) => {
    setActivePlan(p);
    setShowTasks(true);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between gap-2">
        <h1 className="text-xl sm:text-2xl font-extrabold flex items-center gap-2">
          <CalendarDays className="w-5 h-5 sm:w-6 sm:h-6 text-primary-500" />
          <span className="hidden xs:inline">Study</span> Planner
        </h1>
        <button onClick={() => setShowGen(!showGen)} className="btn-primary text-xs sm:text-sm py-2 px-3 sm:px-4 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4" />
          <span className="hidden sm:inline">Generate AI</span> Plan
        </button>
      </div>

      {showGen && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card space-y-4 max-w-xl mx-auto">
          <h2 className="text-base sm:text-lg font-bold">Generate AI Study Plan</h2>
          <input value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} placeholder="Subject (e.g. Physics)" className="input-field" />
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Exam Date</label>
              <input type="date" value={form.examDate} onChange={e => setForm(f => ({ ...f, examDate: e.target.value }))} className="input-field" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Hours/Day</label>
              <input type="number" min={1} max={12} value={form.hoursPerDay} onChange={e => setForm(f => ({ ...f, hoursPerDay: Number(e.target.value) }))} className="input-field" />
            </div>
          </div>
          <select value={form.currentLevel} onChange={e => setForm(f => ({ ...f, currentLevel: e.target.value }))} className="input-field">
            <option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option>
          </select>
          <button onClick={generate} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            {loading ? 'Generating...' : 'Generate Plan'}
          </button>
        </motion.div>
      )}

      <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
        {/* Plan List — hidden on mobile when viewing tasks */}
        <div className={`space-y-3 ${showTasks ? 'hidden lg:block' : 'block'}`}>
          <h3 className="font-bold text-xs sm:text-sm text-slate-500 uppercase tracking-wider">Your Plans</h3>
          {plans.length === 0 && <p className="text-sm text-slate-400 py-4 text-center">No plans yet</p>}
          {plans.map(p => (
            <motion.button key={p._id} onClick={() => selectPlan(p)} whileHover={{ scale: 1.02 }}
              className={`w-full text-left p-3 sm:p-4 rounded-xl border-2 transition-all touch-target
                ${activePlan?._id === p._id ? 'border-primary-500 bg-primary-50 dark:bg-primary-950' : 'border-slate-200 dark:border-slate-700 hover:border-primary-300'}`}>
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-bold text-sm truncate">{p.title}</p>
                  <p className="text-xs text-slate-400">{p.subject} • {p.tasks?.length || 0} tasks</p>
                  {p.examDate && <p className="text-xs text-primary-500 mt-0.5">Exam: {formatDate(p.examDate)}</p>}
                </div>
                <button onClick={(e) => { e.stopPropagation(); deletePlan(p._id); }} className="p-2 text-red-400 hover:text-red-500 touch-target flex-shrink-0">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Task View — full width on mobile */}
        <div className={`lg:col-span-2 ${!showTasks ? 'hidden lg:block' : 'block'}`}>
          {activePlan ? (
            <div className="card">
              <div className="flex items-center gap-2 mb-3">
                <button onClick={() => setShowTasks(false)} className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 touch-target">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg sm:text-xl font-extrabold truncate">{activePlan.title}</h2>
                  <p className="text-xs sm:text-sm text-slate-400">{activePlan.tasks?.filter(t => t.completed).length || 0} / {activePlan.tasks?.length || 0} completed</p>
                </div>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mb-4 sm:mb-6">
                <div className="gradient-bg h-2 rounded-full transition-all" style={{ width: `${activePlan.tasks?.length ? (activePlan.tasks.filter(t => t.completed).length / activePlan.tasks.length) * 100 : 0}%` }} />
              </div>
              <div className="space-y-2 sm:space-y-3 max-h-[55vh] sm:max-h-[60vh] overflow-y-auto">
                {activePlan.tasks?.map((t, i) => (
                  <motion.div key={t._id || i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                    className={`flex items-start gap-3 p-2.5 sm:p-3 rounded-xl border transition-colors
                      ${t.completed ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800' : 'border-slate-200 dark:border-slate-700'}`}>
                    <button onClick={() => toggleTask(activePlan._id, t._id, t.completed)}
                      className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors touch-target
                        ${t.completed ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300 dark:border-slate-600 hover:border-primary-500'}`}>
                      {t.completed && <Check className="w-3 h-3 text-white" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium text-sm ${t.completed ? 'line-through text-slate-400' : ''}`}>{t.title}</p>
                      {t.description && <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{t.description}</p>}
                      <div className="flex flex-wrap gap-2 sm:gap-3 mt-1 text-[10px] sm:text-xs text-slate-400">
                        {t.date && <span>{formatDate(t.date)}</span>}
                        {t.duration && <span>{t.duration}min</span>}
                        <span className={`font-medium ${t.priority === 'high' ? 'text-red-400' : t.priority === 'medium' ? 'text-amber-400' : 'text-emerald-400'}`}>{t.priority}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : (
            <div className="card flex flex-col items-center justify-center py-12 sm:py-20 text-center">
              <CalendarDays className="w-12 h-12 sm:w-16 sm:h-16 text-primary-200 dark:text-primary-800 mb-4" />
              <h3 className="text-lg sm:text-xl font-bold mb-2">Select a Plan</h3>
              <p className="text-sm text-slate-400 px-4">Choose a study plan or generate a new one with AI.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
