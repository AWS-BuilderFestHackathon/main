import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, FileText, MessageCircleQuestion,
  Brain, CalendarDays, UserCircle, LogOut, X,
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { ThemeToggle } from './ThemeToggle';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/notes', icon: FileText, label: 'Notes Library' },
  { path: '/doubts', icon: MessageCircleQuestion, label: 'Doubt Solver' },
  { path: '/quiz', icon: Brain, label: 'Quizzes' },
  { path: '/planner', icon: CalendarDays, label: 'Study Planner' },
  { path: '/profile', icon: UserCircle, label: 'Profile' },
];

export const Sidebar = () => {
  const location = useLocation();
  const { user, logout, sidebarOpen, toggleSidebar } = useStore();

  return (
    <>
      {/* Desktop Sidebar — hidden on mobile */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 260 : 72 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="fixed left-0 top-0 h-screen z-40 hidden lg:flex flex-col
          glass-strong border-r border-slate-200/50 dark:border-slate-700/50"
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-200/50 dark:border-slate-700/50">
          <img src="/logo.png" alt="Brainora.AI" className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
          {sidebarOpen && (
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-extrabold text-lg whitespace-nowrap">
              <span className="gradient-text">Brainora</span><span className="text-slate-400 dark:text-slate-500">.AI</span>
            </motion.span>
          )}
        </div>

        {/* User */}
        {user && sidebarOpen && (
          <div className="px-4 py-4 border-b border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-center gap-3">
              <img src={user.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=6366f1&color=fff`}
                alt={user.name} className="w-9 h-9 rounded-full ring-2 ring-primary-500/30" />
              <div className="overflow-hidden">
                <p className="font-semibold text-sm truncate">{user.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Nav Links */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {navItems.map(({ path, icon: Icon, label }) => {
            const active = location.pathname === path;
            return (
              <Link key={path} to={path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative
                  ${active ? 'bg-primary-50 dark:bg-primary-950 text-primary-600 dark:text-primary-400 font-semibold shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary-600 dark:hover:text-primary-400'}`}>
                {active && (
                  <motion.div layoutId="sidebar-active" className="absolute left-0 top-0 bottom-0 w-1 rounded-r-full bg-primary-500"
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }} />
                )}
                <Icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm whitespace-nowrap">{label}</motion.span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-slate-200/50 dark:border-slate-700/50 space-y-2">
          <ThemeToggle className="w-full justify-center" />
          <button onClick={() => { logout(); window.location.href = '/'; }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-sm font-medium">
            <LogOut className="w-5 h-5 flex-shrink-0" />{sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* Mobile Header Bar — visible only on mobile */}
      <div className="fixed top-0 left-0 right-0 z-50 lg:hidden glass-strong border-b border-slate-200/50 dark:border-slate-700/50"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
        <div className="flex items-center justify-between px-4 h-14">
          <Link to="/dashboard" className="flex items-center gap-2">
            <img src="/logo.png" alt="Brainora.AI" className="w-8 h-8 rounded-lg object-cover" />
            <span className="font-bold text-base"><span className="gradient-text">Brainora</span><span className="text-slate-400 dark:text-slate-500">.AI</span></span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link to="/profile" className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-primary-500/30">
              <img src={user?.profilePicture || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'U')}&background=6366f1&color=fff&size=32`}
                alt="Profile" className="w-full h-full object-cover" />
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};
