import { useState } from 'react';
import { Link } from 'react-router-dom';
import { confessionsApi } from '../api/confessions';
import { vibesApi, type VibeCheckResult } from '../api/vibes';
import { aiApi } from '../api/ai';
import { triggerNotificationRefresh } from '../utils/events';
import type { ConfessionResponse, OwnedConfession, EnhanceResponse } from '../types';

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
  const [polishing, setPolishing] = useState(false);
  const [vibeResult, setVibeResult] = useState<VibeCheckResult | null>(null);
  const [enhancedResult, setEnhancedResult] = useState<EnhanceResponse | null>(null);
  const [error, setError] = useState('');

  async function handleSubmit() {
    if (!text.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const created = await confessionsApi.create({ content: text.trim() });
      saveOwnedConfession({ id: created.id, content: created.content, createdAt: new Date().toISOString() });
      onCreated(created);
      triggerNotificationRefresh();
      onClose();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { msg?: string; message?: string; details?: string } } };
      setError(
        err?.response?.data?.message ??
        err?.response?.data?.details ??
        err?.response?.data?.msg ??
        'Failed to post confession'
      );
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

  async function handlePolish() {
    if (!text.trim() || polishing) return;
    setPolishing(true);
    setError('');
    try {
      const result = await aiApi.enhance({ text: text.trim(), type: 'CONFESSION' });
      setEnhancedResult(result);
    } catch {
      setError('AI enhancement unavailable right now.');
    } finally {
      setPolishing(false);
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

        {/* AI Actions Row */}
        <div className="mb-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">{text.length} characters</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePolish}
                disabled={polishing || !text.trim()}
                className="flex items-center gap-1.5 rounded-lg bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700 transition hover:bg-violet-100 disabled:opacity-40 dark:bg-violet-950/40 dark:text-violet-300"
              >
                <span>{polishing ? 'Polishing…' : '✨ AI Polish'}</span>
              </button>
              <button
                type="button"
                onClick={handleCheckVibe}
                disabled={checkingVibe || !text.trim()}
                className="flex items-center gap-1.5 rounded-lg border border-vw-border px-2.5 py-1 text-xs font-semibold text-gray-600 transition hover:bg-vw-muted disabled:opacity-40 dark:text-gray-300"
              >
                <span>{checkingVibe ? 'Analyzing…' : '🎯 Vibe Check'}</span>
              </button>
            </div>
          </div>

          {/* AI Polished Sentence Card */}
          {enhancedResult && (
            <div className="rounded-xl border border-violet-200 bg-violet-50/80 p-3.5 text-xs animate-fade-in dark:border-violet-900/50 dark:bg-violet-950/40">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-violet-900 dark:text-violet-200 flex items-center gap-1">
                  ✨ AI Polished Sentence
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setText(enhancedResult.polishedText);
                    setEnhancedResult(null);
                  }}
                  className="rounded-lg bg-violet-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-xs transition hover:bg-violet-700 active:scale-95"
                >
                  Apply Sentence ✓
                </button>
              </div>
              <p className="text-gray-800 dark:text-gray-200 italic bg-white/80 dark:bg-zinc-900/60 p-2.5 rounded-lg border border-violet-100 dark:border-violet-900/40">
                "{enhancedResult.polishedText}"
              </p>
              {enhancedResult.suggestions && enhancedResult.suggestions.length > 0 && (
                <div className="mt-2 space-y-1">
                  {enhancedResult.suggestions.map((s, idx) => (
                    <p key={idx} className="text-[11px] text-violet-700 dark:text-violet-300 flex items-start gap-1">
                      <span>💡</span>
                      <span>{s}</span>
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}

          {vibeResult && (
            <div className="rounded-xl border border-violet-100 bg-violet-50/70 p-3 text-xs dark:border-zinc-800 dark:bg-zinc-800/60 animate-fade-in">
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
