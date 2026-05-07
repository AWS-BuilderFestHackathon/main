import { useState } from 'react';
import { motion } from 'framer-motion';
import { UserCircle, Save, Loader2, Trash2, Camera } from 'lucide-react';
import { toast } from 'sonner';
import api from '../utils/api';
import { useStore } from '../store/useStore';
import { formatDate } from '../utils/helpers';

export const Profile = () => {
  const { user, setUser, logout } = useStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    theme: user?.theme || 'light',
    defaultDifficulty: user?.defaultDifficulty || 'medium',
    notificationsEnabled: user?.notificationsEnabled ?? true,
  });

  const save = async () => {
    setLoading(true);
    try {
      const { data } = await api.put('/api/user/profile', form);
      setUser(data.user);
      toast.success('Profile updated!');
    } catch (e) { toast.error('Update failed'); }
    finally { setLoading(false); }
  };

  const uploadPic = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('avatar', file);
    try {
      const { data } = await api.post('/api/user/profile/picture', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setUser(data.user);
      toast.success('Profile picture updated!');
    } catch { toast.error('Upload failed'); }
  };

  const deleteAccount = async () => {
    if (!window.confirm('Are you sure? This cannot be undone.')) return;
    toast.success('Account deletion requested');
    logout();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-extrabold flex items-center gap-2">
        <UserCircle className="w-6 h-6 text-primary-500" />Profile Settings
      </h1>

      {/* Avatar */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card flex items-center gap-6">
        <div className="relative group">
          <img
            src={user?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=6366f1&color=fff&size=96`}
            alt="Profile" className="w-20 h-20 rounded-2xl object-cover ring-4 ring-primary-100 dark:ring-primary-900"
          />
          <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
            <Camera className="w-6 h-6 text-white" />
            <input type="file" accept="image/*" onChange={uploadPic} className="hidden" />
          </label>
        </div>
        <div>
          <h2 className="text-xl font-bold">{user?.name}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
          <p className="text-xs text-slate-400 mt-1">Member since {formatDate(user?.createdAt || new Date())}</p>
        </div>
      </motion.div>

      {/* Personal Info */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card space-y-4">
        <h3 className="font-bold">Personal Information</h3>
        <div>
          <label className="text-xs font-medium text-slate-500 mb-1 block">Name</label>
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="input-field" />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500 mb-1 block">Bio</label>
          <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} rows={3} maxLength={500} placeholder="Tell us about yourself..." className="input-field resize-none" />
          <p className="text-xs text-slate-400 mt-1 text-right">{form.bio.length}/500</p>
        </div>
      </motion.div>

      {/* Preferences */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card space-y-4">
        <h3 className="font-bold">Study Preferences</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Theme</label>
            <select value={form.theme} onChange={e => setForm(f => ({ ...f, theme: e.target.value }))} className="input-field">
              <option value="light">Light</option><option value="dark">Dark</option><option value="auto">Auto</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-slate-500 mb-1 block">Default Difficulty</label>
            <select value={form.defaultDifficulty} onChange={e => setForm(f => ({ ...f, defaultDifficulty: e.target.value }))} className="input-field">
              <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
            </select>
          </div>
        </div>
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" checked={form.notificationsEnabled} onChange={e => setForm(f => ({ ...f, notificationsEnabled: e.target.checked }))}
            className="w-4 h-4 rounded border-slate-300 text-primary-500 focus:ring-primary-500" />
          <span className="text-sm">Enable email notifications</span>
        </label>
      </motion.div>

      {/* Stats */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card">
        <h3 className="font-bold mb-4">Account Statistics</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div><p className="text-2xl font-extrabold gradient-text">{user?.totalNotes || 0}</p><p className="text-xs text-slate-400">Notes</p></div>
          <div><p className="text-2xl font-extrabold gradient-text">{user?.totalQuizzes || 0}</p><p className="text-xs text-slate-400">Quizzes</p></div>
          <div><p className="text-2xl font-extrabold gradient-text">{user?.totalDoubts || 0}</p><p className="text-xs text-slate-400">Doubts</p></div>
          <div><p className="text-2xl font-extrabold gradient-text">{user?.studyStreak || 0}</p><p className="text-xs text-slate-400">Streak</p></div>
        </div>
      </motion.div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4">
        <button onClick={save} disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
        <button onClick={deleteAccount} className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-red-300 dark:border-red-800 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors font-semibold">
          <Trash2 className="w-5 h-5" />Delete Account
        </button>
      </div>
    </div>
  );
};
