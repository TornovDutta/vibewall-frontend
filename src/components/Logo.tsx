import { Link } from 'react-router-dom';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  clickable?: boolean;
  className?: string;
  textClassName?: string;
}

export function LogoMark({ className = 'h-9 w-9' }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-full drop-shadow-sm transition-transform duration-300 group-hover:scale-105"
      >
        <defs>
          <linearGradient id="vw-comp-logo-grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="50%" stopColor="#d946ef" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
          <linearGradient id="vw-comp-inner-glow" x1="24" y1="2" x2="24" y2="24" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Base squircle container */}
        <rect width="48" height="48" rx="14" fill="url(#vw-comp-logo-grad)" />

        {/* Upper glass highlight */}
        <path
          d="M2 14C2 7.373 7.373 2 14 2H34C40.627 2 46 7.373 46 14V22C46 22 36 26 24 26C12 26 2 22 2 22V14Z"
          fill="url(#vw-comp-inner-glow)"
        />

        {/* Crisp border line */}
        <rect
          x="1"
          y="1"
          width="46"
          height="46"
          rx="13"
          stroke="white"
          strokeOpacity="0.25"
          strokeWidth="1.5"
        />

        {/* Dynamic V glyph */}
        <path
          d="M13.5 16C14.2 16 15.2 16.8 16.2 18.8L23.2 32.2C23.6 32.9 24.4 32.9 24.8 32.2L31.8 18.8C32.8 16.8 33.8 16 34.5 16"
          stroke="white"
          strokeWidth="3.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Central Vibe pulse / equalizer wave bars */}
        <line x1="24" y1="18" x2="24" y2="25" stroke="white" strokeWidth="2.8" strokeLinecap="round" />
        <line
          x1="20"
          y1="20.5"
          x2="20"
          y2="23.5"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeOpacity="0.9"
        />
        <line
          x1="28"
          y1="20.5"
          x2="28"
          y2="23.5"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeOpacity="0.9"
        />

        {/* Magical 12h spark */}
        <path
          d="M36.5 10L37.3 12.2L39.5 13L37.3 13.8L36.5 16L35.7 13.8L33.5 13L35.7 12.2L36.5 10Z"
          fill="white"
        />
      </svg>
    </div>
  );
}

export default function Logo({
  size = 'md',
  showText = true,
  clickable = true,
  className = '',
  textClassName = '',
}: LogoProps) {
  const sizeMap = {
    sm: { icon: 'h-7 w-7', text: 'text-lg', gap: 'gap-2' },
    md: { icon: 'h-9 w-9', text: 'text-xl', gap: 'gap-2.5' },
    lg: { icon: 'h-12 w-12', text: 'text-3xl', gap: 'gap-3.5' },
  };

  const { icon, text, gap } = sizeMap[size];

  const content = (
    <div className={`group inline-flex items-center ${gap} ${className}`}>
      <LogoMark className={icon} />
      {showText && (
        <span
          className={`bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-500 bg-clip-text font-black tracking-tight text-transparent dark:from-violet-400 dark:via-fuchsia-400 dark:to-pink-400 ${text} ${textClassName}`}
        >
          VibeWall
        </span>
      )}
    </div>
  );

  if (!clickable) return content;

  return (
    <Link to="/" className="inline-flex items-center transition-opacity hover:opacity-95">
      {content}
    </Link>
  );
}
