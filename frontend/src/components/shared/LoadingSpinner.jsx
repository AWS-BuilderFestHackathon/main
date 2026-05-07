import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ size = 'md', text = '' }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <Loader2 className={`${sizes[size]} animate-spin text-primary-500`} />
      {text && <p className="text-sm text-slate-500 dark:text-slate-400 animate-pulse">{text}</p>}
    </div>
  );
};
