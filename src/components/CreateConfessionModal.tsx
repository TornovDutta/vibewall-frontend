import { useState } from 'react';
import { Link } from 'react-router-dom';
import { confessionsApi } from '../api/confessions';
import { vibesApi, type VibeCheckResult } from '../api/vibes';
import type { ConfessionResponse, OwnedConfession } from '../types';

const OWNED_KEY = 'vw_owned_confessions';

export function saveOwnedConfession(item: OwnedConfession) {
  try {
    const existing: OwnedConfession[] = JSON.parse(localStorage.getItem(OWNED_KEY) ?? '[]');
    localStorage.setItem(OWNED_KEY, JSON.stringify([...existing, item]));
  } catch {
    // ignore
  }
}

export function getOwnedConfessionIds(): string[] {
  try {
    const items: OwnedConfession[] = JSON.parse(localStorage.getItem(OWNED_KEY) ?? '[]');
    return items.map((i) => i.id);
  } catch {
    return [];
  }
}

export function removeOwnedConfession(id: string) {
  try {
    const items: OwnedConfession[] = JSON.parse(localStorage.getItem(OWNED_KEY) ?? '[]');
    localStorage.setItem(OWNED_KEY, JSON.stringify(items.filter((i) => i.id !== id)));
  } catch {
    // ignore
  }
}

interface Props {
  onClose: () => void;
  onCreated: (c: ConfessionResponse) => void;
}

export default function CreateConfessionModal({ onClose, onCreated }: Props) {
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [checkingVibe, setCheckingVibe] = useState(false);
  const [vibeResult, setVibeResult] = useState<VibeCheckResult | null>(null);
  const [error, setError] = useState('');

  async function handleSubmit() {
    if (!text.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const created = await confessionsApi.create({ content: text.trim() });
      saveOwnedConfession({ id: created.id, content: created.content, createdAt: new Date().toISOString() });
      onCreated(created);
      onClose();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { msg?: string } } };
      setError(err?.response?.data?.msg ?? 'Failed to post confession');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCheckVibe() {
    if (!text.trim() || checkingVibe) return;
    setCheckingVibe(true);
    setError('');
    try {
      const result = await vibesApi.checkVibe(text.trim());
      setVibeResult(result);
    } catch {
      // ignore
    } finally {
      setCheckingVibe(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-200/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg animate-fade-in rounded-2xl border border-vw-border bg-vw-card p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-900">New Confession</h2>
            <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-semibold text-violet-700">
              Disappears in 12h
            </span>
          </div>
          <button onClick={onClose} className="text-gray-500 transition hover:text-gray-900">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="mb-3 text-sm text-gray-600 dark:text-zinc-400">
          Your confession is completely anonymous and encrypted.{' '}
          <Link
            to="/privacy"
            target="_blank"
            className="text-violet-600 underline underline-offset-2 hover:text-violet-700 dark:text-violet-400"
          >
            How we protect your safety &rarr;
          </Link>
        </p>

        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (vibeResult) setVibeResult(null);
          }}
          placeholder="What's weighing on your mind? Spill your thoughts safely…"
          className="mb-2 w-full resize-none rounded-xl border border-vw-border bg-vw-surface px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:border-violet-500 focus:outline-none"
          rows={5}
          autoFocus
        />

        {/* AI Vibe Check trigger & result */}
        <div className="mb-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">{text.length} characters</span>
            <button
              type="button"
              onClick={handleCheckVibe}
              disabled={checkingVibe || !text.trim()}
              className="flex items-center gap-1.5 text-xs font-semibold text-violet-600 transition hover:text-violet-800 disabled:opacity-40"
            >
              <span>{checkingVibe ? 'Analyzing…' : '✨ AI Vibe Check'}</span>
            </button>
          </div>

          {vibeResult && (
            <div className="mt-2.5 rounded-xl border border-violet-100 bg-violet-50/70 p-3 text-xs dark:border-zinc-800 dark:bg-zinc-800/60">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 font-semibold text-violet-900 dark:text-violet-200">
                  <span className="text-base">{vibeResult.emoji}</span>
                  <span>{vibeResult.vibe}</span>
                </div>
                <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-gray-600 shadow-xs dark:bg-zinc-900 dark:text-zinc-400">
                  {vibeResult.sentiment}
                </span>
              </div>
              <p className="mt-1.5 text-gray-600 dark:text-zinc-300">
                💡 <span className="italic">{vibeResult.comfortingTip}</span>
              </p>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-500">
            {error}
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={handleSubmit}
            disabled={submitting || !text.trim()}
            className="flex-1 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-2.5 text-sm font-semibold text-white shadow-md transition hover:opacity-90 disabled:opacity-40"
          >
            {submitting ? 'Posting…' : 'Post Anonymously'}
          </button>
          <button
            onClick={onClose}
            className="rounded-xl border border-vw-border px-4 text-sm text-gray-700 transition hover:text-gray-900"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
