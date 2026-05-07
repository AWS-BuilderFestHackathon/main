import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStore } from '../../store/useStore';

export const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme } = useStore();

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={toggleTheme}
      className={`relative p-2 rounded-xl transition-colors duration-300
        bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 ${className}`}
      aria-label="Toggle theme"
    >
      <motion.div
        initial={false}
        animate={{ rotate: theme === 'dark' ? 180 : 0 }}
        transition={{ duration: 0.4, type: 'spring' }}
      >
        {theme === 'dark' ? (
          <Moon className="w-5 h-5 text-indigo-400" />
        ) : (
          <Sun className="w-5 h-5 text-amber-500" />
        )}
      </motion.div>
    </motion.button>
  );
};
