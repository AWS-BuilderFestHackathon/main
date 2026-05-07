import { Suspense } from 'react';
import { useStore } from '../../store/useStore';
import { LightBackground } from './LightBackground';
import { DarkBackground } from './DarkBackground';

export const BackgroundManager = () => {
  const theme = useStore((s) => s.theme);

  return (
    <Suspense fallback={
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-900" />
    }>
      {theme === 'dark' ? <DarkBackground /> : <LightBackground />}
    </Suspense>
  );
};
