import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Sparkles, Loader2, Upload, Save, Search, Plus, Trash2, Eye, X } from 'lucide-react';
import { toast } from 'sonner';
import api from '../utils/api';
import { useStore } from '../store/useStore';
import { formatDate } from '../utils/helpers';

const formatFullDate = (dateString) => {
  const d = new Date(dateString);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) + ' at ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

export const Notes = () => {
  const [view, setView] = useState('list'); // list | summarize
  const [noteText, setNoteText] = useState('');
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('General');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [notes, setNotes] = useState([]);
  const [fetched, setFetched] = useState(false);
  const [search, setSearch] = useState('');
  const [viewNote, setViewNote] = useState(null);

  const fetchNotes = async () => {
    try {
      const { data } = await api.get('/api/notes', { params: { search } });
      setNotes(data.notes || []);
      setFetched(true);
    } catch { toast.error('Failed to load notes'); }
  };

  if (!fetched) fetchNotes();

  const handleUpload = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setFile(f);
    const reader = new FileReader();
    reader.onload = (ev) => setNoteText(ev.target.result);
    reader.readAsText(f);
  };

  const handleSave = async () => {
    if (noteText.trim().length < 10) return toast.error('Enter at least 10 characters');
    setLoading(true);
    try {
      await api.post('/api/notes/save', { text: noteText, title, subject });
      toast.success('Note saved!');
      setNoteText(''); setTitle(''); setResult(null);
      fetchNotes();
      setView('list');
    } catch (e) { toast.error(e.response?.data?.message || 'Save failed'); }
    finally { setLoading(false); }
  };

  const handleSummarize = async () => {
    if (noteText.trim().length < 50) return toast.error('Enter at least 50 characters');
    setLoading(true);
    try {
      const { data } = await api.post('/api/notes/summarize', { text: noteText, title, subject });
      setResult(data);
      toast.success('Notes summarized!');
      fetchNotes();
    } catch (e) { toast.error(e.response?.data?.message || 'Summarization failed'); }
    finally { setLoading(false); }
  };

  const deleteNote = async (id) => {
    try {
      await api.delete(`/api/notes/${id}`);
      setNotes(n => n.filter(x => x._id !== id));
      toast.success('Note deleted');
    } catch { toast.error('Delete failed'); }
  };

  const handleViewNote = async (id) => {
    try {
      const { data } = await api.get(`/api/notes/${id}`);
      setViewNote(data.note);
    } catch { toast.error('Failed to load note details'); }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold flex items-center gap-2"><FileText className="w-6 h-6 text-primary-500" />Notes Library</h1>
        <button onClick={() => { setView(view === 'list' ? 'summarize' : 'list'); setResult(null); }}
          className="btn-primary text-sm py-2 flex items-center gap-2">
          {view === 'list' ? <><Plus className="w-4 h-4" />New Note</> : 'Back to Library'}
        </button>
      </div>

      {view === 'summarize' ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card">
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Note Title (optional)" className="input-field" />
              <select value={subject} onChange={e => setSubject(e.target.value)} className="input-field">
                {['General','Mathematics','Physics','Chemistry','Biology','Computer Science','History','Literature','Economics'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <label className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl cursor-pointer hover:border-primary-500 transition-colors">
              <Upload className="w-5 h-5" /><span>{file ? file.name : 'Upload Text File'}</span>
              <input type="file" accept=".txt" onChange={handleUpload} className="hidden" />
            </label>
            <textarea value={noteText} onChange={e => setNoteText(e.target.value)} rows={12} placeholder="Or paste your notes here (min 10 chars to save, 50 to summarize)..." className="input-field resize-none" />
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <span className="text-xs text-slate-400">{noteText.length} characters</span>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button onClick={handleSave} disabled={loading || noteText.length < 10} className="btn-secondary flex items-center justify-center gap-2 text-sm">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Note
                </button>
                <button onClick={handleSummarize} disabled={loading || noteText.length < 50} className="btn-primary flex items-center justify-center gap-2 text-sm">
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  Summarize with AI
                </button>
              </div>
            </div>

            {result && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-6 p-6 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border-l-4 border-primary-500">
                <h3 className="text-xl font-bold mb-3 gradient-text">AI Summary</h3>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed mb-4">{result.summary}</p>
                {result.keyPoints?.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Key Points:</h4>
                    <ul className="list-disc list-inside space-y-1 text-sm text-slate-600 dark:text-slate-400">
                      {result.keyPoints.map((p, i) => <li key={i}>{p}</li>)}
                    </ul>
                  </div>
                )}
                <div className="flex gap-4 mt-4 text-xs text-slate-500">
                  <span>Difficulty: {result.difficulty}</span>
                  <span>Read time: {result.estimatedReadTime}</span>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      ) : (
        <>
          <div className="relative"><Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
            <input value={search} onChange={e => { setSearch(e.target.value); setFetched(false); }} placeholder="Search notes..." className="input-field pl-10" />
          </div>
          <div className="grid gap-4">
            {notes.length === 0 && <p className="text-center text-slate-400 py-12">No notes yet. Create your first one!</p>}
            {notes.map((n, i) => (
              <motion.div key={n._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handleViewNote(n._id)}>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold truncate hover:text-primary-500 transition-colors">{n.title}</h3>
                    {n.difficulty ? (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 font-semibold flex-shrink-0">AI</span>
                    ) : (
                      <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-semibold flex-shrink-0">Saved</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{n.summary || 'No summary — raw note'}</p>
                  <div className="flex gap-3 mt-2 text-xs text-slate-400">
                    <span>{n.subject}</span><span>{formatDate(n.createdAt)}</span>{n.difficulty && <span>{n.difficulty}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                  <button onClick={() => handleViewNote(n._id)} className="p-2 rounded-lg hover:bg-primary-50 dark:hover:bg-primary-950/30 text-primary-400 hover:text-primary-500 transition-colors">
                    <Eye className="w-4 h-4" />
                  </button>
                  <button onClick={() => deleteNote(n._id)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-red-400 hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}

      {/* Note View Modal */}
      <AnimatePresence>
        {viewNote && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setViewNote(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-2xl max-h-[85vh] bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200/50 dark:border-slate-700/50"
            >
              <div className="flex items-start justify-between p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800">
                <div className="min-w-0 pr-4">
                  <div className="flex items-center gap-2 mb-2">
                    <h2 className="text-xl sm:text-2xl font-bold truncate">{viewNote.title}</h2>
                    {viewNote.difficulty ? (
                      <span className="text-[10px] px-2 py-1 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 font-semibold">AI</span>
                    ) : (
                      <span className="text-[10px] px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-semibold">Saved</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1"><span className="font-medium text-slate-700 dark:text-slate-300">Subject:</span> {viewNote.subject}</span>
                    <span className="flex items-center gap-1"><span className="font-medium text-slate-700 dark:text-slate-300">Created:</span> {formatFullDate(viewNote.createdAt)}</span>
                  </div>
                </div>
                <button onClick={() => setViewNote(null)} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex-shrink-0 touch-target">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                {viewNote.difficulty && viewNote.summary && (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 border-l-4 border-primary-500">
                      <h3 className="text-lg font-bold mb-2 gradient-text">AI Summary</h3>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-sm sm:text-base">{viewNote.summary}</p>
                    </div>
                    {viewNote.keyPoints?.length > 0 && (
                      <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                        <h4 className="font-semibold mb-2">Key Points</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-slate-600 dark:text-slate-400">
                          {viewNote.keyPoints.map((p, i) => <li key={i}>{p}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
                
                <div>
                  <h4 className="font-semibold text-lg mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">Original Text</h4>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/30 text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-mono">
                    {viewNote.originalText || "No original text available."}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
