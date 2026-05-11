import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircleQuestion, Send, Plus, Loader2, CheckCircle, ChevronLeft, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import api from '../utils/api';
import { timeAgo } from '../utils/helpers';

export const Doubts = () => {
  const [sessions, setSessions] = useState([]);
  const [active, setActive] = useState(null);
  const [input, setInput] = useState('');
  const [subject, setSubject] = useState('General');
  const [loading, setLoading] = useState(false);
  const [showSessions, setShowSessions] = useState(true); // mobile: toggle sessions/chat
  const chatEnd = useRef(null);

  useEffect(() => {
    api.get('/api/doubts').then(r => setSessions(r.data.doubts || [])).catch(() => {});
  }, []);

  useEffect(() => { chatEnd.current?.scrollIntoView({ behavior: 'smooth' }); }, [active?.messages]);

  const loadSession = async (id) => {
    const { data } = await api.get(`/api/doubts/${id}`);
    setActive(data.doubt);
    setShowSessions(false); // on mobile, switch to chat view
  };

  const newSession = () => { setActive(null); setInput(''); setShowSessions(false); };

  const send = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      if (!active) {
        const { data } = await api.post('/api/doubts', { message: input, subject });
        setActive(data.doubt);
        setSessions(s => [{ _id: data.doubt._id, title: data.doubt.title, subject, isResolved: false, updatedAt: new Date() }, ...s]);
      } else {
        const { data } = await api.post(`/api/doubts/${active._id}/message`, { message: input });
        setActive(data.doubt);
      }
      setInput('');
    } catch (e) { toast.error(e.response?.data?.message || 'Failed to send'); }
    finally { setLoading(false); }
  };

  const resolve = async (id) => {
    await api.put(`/api/doubts/${id}/resolve`);
    setSessions(s => s.map(x => x._id === id ? { ...x, isResolved: true } : x));
    if (active?._id === id) setActive(a => ({ ...a, isResolved: true }));
    toast.success('Doubt marked as resolved!');
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 h-[calc(100dvh-10rem)] lg:h-[calc(100vh-4rem)]">

      {/* Sessions Sidebar — full width on mobile, side panel on desktop */}
      <div className={`w-full lg:w-72 flex-shrink-0 flex flex-col card p-0 overflow-hidden
        ${showSessions ? 'flex' : 'hidden lg:flex'}`}>
        <div className="p-3 sm:p-4 border-b border-slate-200/50 dark:border-slate-700/50">
          <button onClick={newSession} className="btn-primary w-full text-sm py-2.5 flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" />New Chat
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {sessions.map(s => (
            <button key={s._id} onClick={() => loadSession(s._id)}
              className={`w-full text-left p-3 rounded-xl text-sm transition-colors touch-target
                ${active?._id === s._id ? 'bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
              <p className="font-medium truncate">{s.title}</p>
              <p className="text-xs text-slate-400 mt-0.5">{s.subject} • {timeAgo(s.updatedAt)}</p>
            </button>
          ))}
          {sessions.length === 0 && <p className="text-center text-xs text-slate-400 py-6">No doubt sessions yet</p>}
        </div>
      </div>

      {/* Chat Area — full width on mobile, flex-1 on desktop */}
      <div className={`flex-1 flex flex-col card p-0 overflow-hidden min-h-0
        ${!showSessions ? 'flex' : 'hidden lg:flex'}`}>

        {/* Chat Header */}
        <div className="p-3 sm:p-4 border-b border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {/* Back button — mobile only */}
            <button onClick={() => setShowSessions(true)} className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 touch-target flex-shrink-0">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <MessageCircleQuestion className="w-5 h-5 text-primary-500 flex-shrink-0" />
            <h2 className="font-bold text-sm sm:text-base truncate">{active ? active.title : 'AI Doubt Solver'}</h2>
          </div>
          {active && !active.isResolved && (
            <button onClick={() => resolve(active._id)} className="text-xs text-emerald-500 hover:text-emerald-600 flex items-center gap-1 font-medium flex-shrink-0 touch-target">
              <CheckCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Resolve</span>
            </button>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
          {!active && (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <MessageCircleQuestion className="w-12 h-12 sm:w-16 sm:h-16 text-primary-200 dark:text-primary-800 mb-4" />
              <h3 className="text-lg sm:text-xl font-bold mb-2">Ask Any Question</h3>
              <p className="text-sm text-slate-400 max-w-sm">Get step-by-step explanations powered by Google Gemini AI.</p>
            </div>
          )}
          {active?.messages?.map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] sm:max-w-[80%] px-3.5 py-2.5 sm:px-4 sm:py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap
                ${m.role === 'user'
                  ? 'bg-primary-500 text-white rounded-br-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-md'}`}>
                {m.content}
              </div>
            </motion.div>
          ))}
          {loading && (
            <div className="flex justify-start"><div className="bg-slate-100 dark:bg-slate-800 px-4 py-3 rounded-2xl rounded-bl-md">
              <Loader2 className="w-5 h-5 animate-spin text-primary-500" />
            </div></div>
          )}
          <div ref={chatEnd} />
        </div>

        {/* Input */}
        <div className="p-3 sm:p-4 border-t border-slate-200/50 dark:border-slate-700/50">
          {!active && (
            <select value={subject} onChange={e => setSubject(e.target.value)} className="input-field mb-3 text-sm py-2.5">
              {['General','Mathematics','Physics','Chemistry','Biology','Computer Science','History','Literature'].map(s => <option key={s}>{s}</option>)}
            </select>
          )}
          <div className="flex gap-2">
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
              placeholder="Ask your doubt..."
              className="input-field flex-1 text-sm"
              disabled={loading}
              enterKeyHint="send"
            />
            <button onClick={send} disabled={loading || !input.trim()} className="btn-primary px-3 sm:px-4 flex-shrink-0">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
