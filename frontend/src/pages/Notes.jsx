import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Sparkles, Loader2, Upload, Save, Search, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '../utils/api';
import { useStore } from '../store/useStore';
import { formatDate } from '../utils/helpers';

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

  return (
    <div className="space-y-6">
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
            <textarea value={noteText} onChange={e => setNoteText(e.target.value)} rows={12} placeholder="Or paste your notes here (min 50 chars)..." className="input-field resize-none" />
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">{noteText.length} characters</span>
              <button onClick={handleSummarize} disabled={loading || noteText.length < 50} className="btn-primary flex items-center gap-2">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                {loading ? 'Summarizing...' : 'Summarize with AI'}
              </button>
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
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold truncate">{n.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">{n.summary}</p>
                  <div className="flex gap-3 mt-2 text-xs text-slate-400">
                    <span>{n.subject}</span><span>{formatDate(n.createdAt)}</span><span>{n.difficulty}</span>
                  </div>
                </div>
                <button onClick={() => deleteNote(n._id)} className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-red-400 hover:text-red-500 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </motion.div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
