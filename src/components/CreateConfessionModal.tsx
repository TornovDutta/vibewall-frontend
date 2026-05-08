import { useState } from 'react';
import { confessionsApi } from '../api/confessions';
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg animate-fade-in rounded-2xl border border-vw-border bg-vw-card p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">New Confession</h2>
          <button onClick={onClose} className="text-gray-500 transition hover:text-white">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="mb-4 text-sm text-gray-400">
          Your confession is anonymous and disappears after 12 hours.
          AI moderation ensures community safety.
        </p>

        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="What's on your mind…"
          className="mb-4 w-full resize-none rounded-xl border border-vw-border bg-vw-surface px-4 py-3 text-sm text-white placeholder-gray-600 focus:border-violet-500 focus:outline-none"
          rows={6}
          autoFocus
        />

        {error && (
          <div className="mb-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-xs text-red-400">
            {error}
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={handleSubmit}
            disabled={submitting || !text.trim()}
            className="flex-1 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-40"
          >
            {submitting ? 'Posting…' : 'Post Anonymously'}
          </button>
          <button
            onClick={onClose}
            className="rounded-xl border border-vw-border px-4 text-sm text-gray-400 transition hover:text-white"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
