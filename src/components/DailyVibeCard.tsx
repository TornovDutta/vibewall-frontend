import { useEffect, useState } from 'react';
import { vibesApi, type DailyVibe } from '../api/vibes';

export default function DailyVibeCard() {
  const [vibe, setVibe] = useState<DailyVibe | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    vibesApi
      .getDaily()
      .then(setVibe)
      .catch(() => {
        setVibe({
          quote: 'Be gentle with yourself. You are doing the best you can with what you have today.',
          author: 'VibeWall Sanctuary',
          category: 'Self-Love',
          emoji: '🌱',
        });
      });
  }, []);

  async function handleRefresh() {
    setLoading(true);
    try {
      const next = await vibesApi.getRandom();
      setVibe(next);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  if (!vibe) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50/80 via-fuchsia-50/40 to-pink-50/60 p-5 shadow-sm dark:border-zinc-800 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-800">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xl" role="img" aria-label="vibe emoji">
            {vibe.emoji}
          </span>
          <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-[11px] font-semibold text-violet-700 dark:bg-violet-950 dark:text-violet-300">
            {vibe.category}
          </span>
        </div>
        <button
          type="button"
          onClick={handleRefresh}
          disabled={loading}
          title="Get another vibe"
          className="flex items-center gap-1 text-[11px] font-medium text-gray-400 transition hover:text-violet-600 disabled:opacity-50"
        >
          <svg className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Next Vibe</span>
        </button>
      </div>

      <p className="mt-3 text-sm italic font-medium leading-relaxed text-gray-700 dark:text-zinc-200">
        &ldquo;{vibe.quote}&rdquo;
      </p>

      <span className="mt-2 block text-right text-[11px] font-medium text-gray-400 dark:text-zinc-500">
        — {vibe.author}
      </span>
    </div>
  );
}
