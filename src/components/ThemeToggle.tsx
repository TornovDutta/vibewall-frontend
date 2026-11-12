import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      onClick={toggleTheme}
      className={`group relative inline-flex h-7.5 w-14 shrink-0 cursor-pointer items-center rounded-full border p-0.5 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:ring-offset-2 dark:focus:ring-offset-zinc-950 ${
        isDark
          ? 'border-zinc-700 bg-zinc-800/95 hover:bg-zinc-750'
          : 'border-slate-300/80 bg-slate-200/90 hover:bg-slate-300/80'
      } ${className}`}
    >
      {/* Background track icons (shows subtle icons on inactive sides) */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-between px-2">
        {/* Sun on left */}
        <svg
          className={`h-3.5 w-3.5 text-amber-500 transition-opacity duration-200 ${
            isDark ? 'opacity-35' : 'opacity-0'
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
            clipRule="evenodd"
          />
        </svg>

        {/* Moon on right */}
        <svg
          className={`h-3.5 w-3.5 text-violet-400 transition-opacity duration-200 ${
            isDark ? 'opacity-0' : 'opacity-35'
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      </div>

      {/* Sliding thumb knob */}
      <span
        className={`relative flex h-6 w-6 items-center justify-center rounded-full shadow-md transition-all duration-300 ease-in-out ${
          isDark
            ? 'translate-x-[1.65rem] border border-zinc-750 bg-zinc-900 text-violet-300 shadow-violet-950/50'
            : 'translate-x-0.5 bg-white text-amber-500 shadow-slate-400/30'
        }`}
      >
        {isDark ? (
          <svg
            className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-rotate-12"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
          </svg>
        ) : (
          <svg
            className="h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-45"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
              clipRule="evenodd"
            />
          </svg>
        )}
      </span>
    </button>
  );
}
