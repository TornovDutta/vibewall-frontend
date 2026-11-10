import { useEffect, useState } from 'react';
import { reactionsApi, type ReactionsMap } from '../api/reactions';

interface Props {
  confessionId: string;
}

const REACTION_CONFIG = [
  { key: 'hug', label: 'Virtual Hug', emoji: '🫂' },
  { key: 'heart', label: 'Not Alone', emoji: '💜' },
  { key: 'relate', label: 'Relatable', emoji: '🤝' },
  { key: 'strength', label: 'Strength', emoji: '🕯️' },
] as const;

export default function ReactionButtons({ confessionId }: Props) {
  const [reactions, setReactions] = useState<ReactionsMap>({
    hug: 0,
    heart: 0,
    relate: 0,
    strength: 0,
  });
  const [reactedList, setReactedList] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`vw_reacted_${confessionId}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    let isMounted = true;
    reactionsApi
      .get(confessionId)
      .then((data) => {
        if (isMounted && data) setReactions(data);
      })
      .catch(() => {
        // ignore
      });
    return () => {
      isMounted = false;
    };
  }, [confessionId]);

  async function handleReact(type: 'hug' | 'heart' | 'relate' | 'strength') {
    // Optimistic UI update
    setReactions((prev) => ({
      ...prev,
      [type]: (prev[type] || 0) + 1,
    }));

    if (!reactedList.includes(type)) {
      const next = [...reactedList, type];
      setReactedList(next);
      try {
        localStorage.setItem(`vw_reacted_${confessionId}`, JSON.stringify(next));
      } catch {
        // ignore
      }
    }

    try {
      const updated = await reactionsApi.add(confessionId, type);
      if (updated) setReactions(updated);
    } catch {
      // rollback or keep optimistic
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-1.5 pt-2">
      {REACTION_CONFIG.map(({ key, label, emoji }) => {
        const count = reactions[key] || 0;
        const hasReacted = reactedList.includes(key);

        return (
          <button
            key={key}
            type="button"
            onClick={() => handleReact(key)}
            title={`Send a ${label}`}
            className={`group inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-all duration-200 active:scale-95 ${
              hasReacted
                ? 'border-violet-300 bg-violet-50 text-violet-700 shadow-xs dark:border-violet-800/80 dark:bg-violet-950/40 dark:text-violet-300'
                : 'border-vw-border bg-vw-surface text-gray-600 hover:border-violet-200 hover:bg-violet-50/50 hover:text-gray-900 dark:text-zinc-400 dark:hover:text-zinc-200'
            }`}
          >
            <span className="transition-transform group-hover:scale-125">{emoji}</span>
            <span className="text-[11px]">{label}</span>
            {count > 0 && (
              <span
                className={`ml-0.5 rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                  hasReacted
                    ? 'bg-violet-200 text-violet-800 dark:bg-violet-900 dark:text-violet-200'
                    : 'bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-zinc-300'
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
