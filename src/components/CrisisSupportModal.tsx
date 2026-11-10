import { useEffect, useState } from 'react';
import { supportApi, type Helpline } from '../api/support';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function CrisisSupportModal({ isOpen, onClose }: Props) {
  const [helplines, setHelplines] = useState<Helpline[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      supportApi
        .getHelplines()
        .then((data) => setHelplines(data ?? []))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl max-h-[85vh] flex flex-col rounded-2xl border border-vw-border bg-vw-card shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-vw-border px-6 py-4 bg-gradient-to-r from-violet-600/10 via-fuchsia-600/10 to-transparent">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🌱</span>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">Confidential Support & Helplines</h2>
              <p className="text-xs text-gray-500 dark:text-zinc-400">Free, confidential 24/7 help. You are never alone.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700 dark:hover:bg-zinc-800 dark:hover:text-white"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Breathing Reminder Card */}
        <div className="mx-6 mt-4 rounded-xl border border-violet-100 bg-violet-50/70 p-3.5 text-xs text-violet-900 dark:border-violet-900/60 dark:bg-violet-950/40 dark:text-violet-200">
          <span className="font-bold">Take a gentle breath:</span>
          <p className="mt-1 leading-relaxed">
            Inhale for 4 seconds, hold for 4 seconds, and exhale for 6 seconds. Whatever you are carrying right now,
            talking to someone who understands can make a world of difference.
          </p>
        </div>

        {/* Helplines List */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {loading ? (
            <div className="py-8 text-center text-xs text-gray-500">Loading verified helplines…</div>
          ) : (
            helplines.map((h, i) => (
              <div
                key={i}
                className="rounded-xl border border-vw-border bg-vw-surface p-4 transition hover:border-violet-200 dark:hover:border-zinc-700"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">{h.name}</h3>
                    <span className="mt-0.5 inline-block rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                      {h.availability}
                    </span>
                    <span className="ml-2 text-[10px] text-gray-400">· {h.region}</span>
                  </div>
                  <a
                    href={h.website}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border border-violet-200 bg-white px-2.5 py-1 text-[11px] font-medium text-violet-600 transition hover:bg-violet-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-violet-300"
                  >
                    Visit Website ↗
                  </a>
                </div>

                <p className="mt-2 text-xs text-gray-600 dark:text-zinc-300 leading-relaxed">{h.description}</p>

                <div className="mt-3 flex items-center justify-between border-t border-vw-border/60 pt-2 text-xs">
                  <span className="text-gray-500 font-medium">Contact:</span>
                  <span className="font-bold text-violet-700 dark:text-violet-300">{h.contact}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-vw-border p-4 bg-vw-surface/40 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-gray-900 px-5 py-2 text-xs font-semibold text-white transition hover:bg-gray-800 dark:bg-zinc-100 dark:text-zinc-900"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
