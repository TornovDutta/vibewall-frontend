import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className={`group relative flex h-9 w-9 items-center justify-center rounded-xl border border-vw-border bg-vw-surface text-vw-text transition-all duration-200 hover:border-violet-400 hover:bg-violet-50/50 hover:text-violet-600 focus:outline-none focus:ring-2 focus:ring-violet-500/30 dark:hover:bg-zinc-800 dark:hover:text-violet-400 ${className}`}
    >
      {isDark ? (
        // Sun icon for dark mode
        <svg
          className="h-4.5 w-4.5 text-amber-400 transition-transform duration-300 group-hover:rotate-45"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ) : (
        // Moon icon for light mode
        <svg
          className="h-4.5 w-4.5 text-gray-600 transition-transform duration-300 group-hover:-rotate-12 group-hover:text-violet-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      )}
    </button>
  );
}
