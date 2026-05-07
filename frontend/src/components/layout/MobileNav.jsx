import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, FileText, MessageCircleQuestion, Brain, CalendarDays } from 'lucide-react';

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { path: '/notes', icon: FileText, label: 'Notes' },
  { path: '/doubts', icon: MessageCircleQuestion, label: 'Doubts' },
  { path: '/quiz', icon: Brain, label: 'Quiz' },
  { path: '/planner', icon: CalendarDays, label: 'Planner' },
];

export const MobileNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 lg:hidden
      glass-strong border-t border-slate-200/50 dark:border-slate-700/50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-center justify-around px-2 h-16">
        {navItems.map(({ path, icon: Icon, label }) => {
          const active = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className="flex flex-col items-center justify-center gap-0.5 py-1 px-3 rounded-xl
                transition-all duration-200 relative touch-target"
            >
              {active && (
                <motion.div
                  layoutId="mobile-nav-active"
                  className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full gradient-bg"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <Icon className={`w-5 h-5 transition-colors ${active
                ? 'text-primary-600 dark:text-primary-400'
                : 'text-slate-400 dark:text-slate-500'}`}
              />
              <span className={`text-[10px] font-medium transition-colors ${active
                ? 'text-primary-600 dark:text-primary-400'
                : 'text-slate-400 dark:text-slate-500'}`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
