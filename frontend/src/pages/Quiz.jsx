import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Brain, Loader2, Clock, Trophy, ChevronRight, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import api from '../utils/api';
import { formatDate } from '../utils/helpers';

export const Quiz = () => {
  const [mode, setMode] = useState('list'); // list | generate | take | results
  const [notes, setNotes] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [selectedNote, setSelectedNote] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timer, setTimer] = useState(0);
  const [results, setResults] = useState(null);

  useEffect(() => {
    api.get('/api/notes').then(r => setNotes(r.data.notes || [])).catch(() => {});
    api.get('/api/quiz').then(r => setQuizzes(r.data.quizzes || [])).catch(() => {});
  }, []);

  useEffect(() => {
    if (mode !== 'take') return;
    const interval = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, [mode]);

  const generate = async () => {
    if (!selectedNote) return toast.error('Select a note first');
    setLoading(true);
    try {
      const { data } = await api.post('/api/quiz/generate', { noteId: selectedNote, difficulty, questionCount: count });
      setQuiz(data.quiz);
      setAnswers(new Array(data.quiz.questions.length).fill(-1));
      setCurrent(0);
      setTimer(0);
      setMode('take');
    } catch (e) { toast.error(e.response?.data?.message || 'Generation failed'); }
    finally { setLoading(false); }
  };

  const selectAnswer = (idx) => {
    const newAnswers = [...answers];
    newAnswers[current] = idx;
    setAnswers(newAnswers);
  };

  const submit = async () => {
    setLoading(true);
    try {
      const { data } = await api.post(`/api/quiz/${quiz.id}/submit`, { answers, timeTaken: timer });
      setResults(data);
      setMode('results');
    } catch (e) { toast.error('Submit failed'); }
    finally { setLoading(false); }
  };

  const fmtTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  if (mode === 'take' && quiz) {
    const q = quiz.questions[current];
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-slate-500">Question {current + 1} of {quiz.questions.length}</span>
          <span className="text-sm font-mono flex items-center gap-1 text-primary-500"><Clock className="w-4 h-4" />{fmtTime(timer)}</span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
          <div className="gradient-bg h-2 rounded-full transition-all" style={{ width: `${((current + 1) / quiz.questions.length) * 100}%` }} />
        </div>
        <motion.div key={current} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="card">
          <h2 className="text-lg font-bold mb-6">{q.question}</h2>
          <div className="space-y-3">
            {q.options.map((opt, i) => (
              <button key={i} onClick={() => selectAnswer(i)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all text-sm font-medium
                  ${answers[current] === i
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-950 text-primary-700 dark:text-primary-300'
                    : 'border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700'}`}>
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full mr-3 text-xs font-bold
                  {answers[current] === i ? 'gradient-bg text-white' : 'bg-slate-100 dark:bg-slate-800'}">
                  {String.fromCharCode(65 + i)}
                </span>
                {opt}
              </button>
            ))}
          </div>
        </motion.div>
        <div className="flex justify-between">
          <button onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0} className="btn-secondary text-sm py-2 disabled:opacity-40">Previous</button>
          {current < quiz.questions.length - 1
            ? <button onClick={() => setCurrent(c => c + 1)} className="btn-primary text-sm py-2 flex items-center gap-1">Next<ChevronRight className="w-4 h-4" /></button>
            : <button onClick={submit} disabled={loading} className="btn-primary text-sm py-2">{loading ? 'Submitting...' : 'Submit Quiz'}</button>
          }
        </div>
      </div>
    );
  }

  if (mode === 'results' && results) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="card text-center py-10">
          <Trophy className={`w-16 h-16 mx-auto mb-4 ${results.score >= 70 ? 'text-amber-400' : 'text-slate-400'}`} />
          <h2 className="text-4xl font-extrabold gradient-text">{results.score}%</h2>
          <p className="text-lg font-medium mt-2">{results.correct} / {results.total} correct</p>
          <p className="text-sm text-slate-400 mt-1">Time: {fmtTime(timer)}</p>
        </motion.div>
        <div className="space-y-4">
          {results.results?.map((r, i) => (
            <div key={i} className={`card border-l-4 ${r.isCorrect ? 'border-emerald-500' : 'border-red-500'}`}>
              <p className="font-medium text-sm mb-2">{i + 1}. {r.question}</p>
              <p className="text-xs text-slate-500">Your answer: <span className={r.isCorrect ? 'text-emerald-500 font-bold' : 'text-red-500 font-bold'}>{r.options[r.userAnswer]}</span></p>
              {!r.isCorrect && <p className="text-xs text-emerald-500 mt-1">Correct: {r.options[r.correctAnswer]}</p>}
              <p className="text-xs text-slate-400 mt-1 italic">{r.explanation}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-4">
          <button onClick={() => { setMode('list'); setResults(null); setQuiz(null); }} className="btn-secondary flex-1">Back to Quizzes</button>
          <button onClick={() => { setMode('generate'); setResults(null); setQuiz(null); }} className="btn-primary flex-1 flex items-center justify-center gap-2"><RotateCcw className="w-4 h-4" />New Quiz</button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold flex items-center gap-2"><Brain className="w-6 h-6 text-primary-500" />Quizzes</h1>
        <button onClick={() => setMode(mode === 'list' ? 'generate' : 'list')} className="btn-primary text-sm py-2">
          {mode === 'list' ? 'Generate New Quiz' : 'Back to List'}
        </button>
      </div>

      {mode === 'generate' ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card space-y-4 max-w-xl mx-auto">
          <h2 className="text-lg font-bold">Generate Quiz from Notes</h2>
          <select value={selectedNote} onChange={e => setSelectedNote(e.target.value)} className="input-field">
            <option value="">Select a note...</option>
            {notes.map(n => <option key={n._id} value={n._id}>{n.title} ({n.subject})</option>)}
          </select>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Difficulty</label>
              <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="input-field">
                <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 mb-1 block">Questions</label>
              <select value={count} onChange={e => setCount(Number(e.target.value))} className="input-field">
                <option value={5}>5</option><option value={10}>10</option><option value={15}>15</option>
              </select>
            </div>
          </div>
          <button onClick={generate} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Brain className="w-5 h-5" />}
            {loading ? 'Generating...' : 'Generate Quiz'}
          </button>
        </motion.div>
      ) : (
        <div className="grid gap-4">
          {quizzes.length === 0 && <p className="text-center text-slate-400 py-12">No quizzes yet. Generate one from your notes!</p>}
          {quizzes.map((q, i) => (
            <motion.div key={q._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm">{q.title}</h3>
                <p className="text-xs text-slate-400 mt-1">{q.difficulty} • {formatDate(q.createdAt)} {q.isTaken && `• Score: ${q.score}%`}</p>
              </div>
              <button onClick={async () => { const { data } = await api.get(`/api/quiz/${q._id}`); setQuiz({ id: data.quiz._id, questions: data.quiz.questions }); setAnswers(new Array(data.quiz.questions.length).fill(-1)); setCurrent(0); setTimer(0); setMode('take'); }}
                className="btn-secondary text-xs py-1.5 px-4">{q.isTaken ? 'Retake' : 'Take Quiz'}</button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};
