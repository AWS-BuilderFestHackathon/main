import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Merge Tailwind classes conditionally */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/** Format a Date object */
export function formatDate(date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  }).format(new Date(date));
}

/** Format relative time */
export function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(date);
}

/** Get time-of-day label */
export function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 6) return 'night';
  if (h < 12) return 'morning';
  if (h < 18) return 'afternoon';
  if (h < 22) return 'evening';
  return 'night';
}

/** Get greeting string */
export function getGreeting() {
  const t = getTimeOfDay();
  const map = { morning: 'Good morning', afternoon: 'Good afternoon', evening: 'Good evening', night: 'Burning midnight oil' };
  return map[t] || 'Hello';
}
