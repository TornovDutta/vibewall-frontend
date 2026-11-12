import { useState } from 'react';
import { qaApi } from '../api/qa';
import { useAuth } from '../context/AuthContext';
import { triggerNotificationRefresh } from '../utils/events';
import { generateAnonName } from '../utils/generateAnonName';
import type { QuestionResponse } from '../types';

interface Props {
  isOpen: boolean;
  targetUserId: string;
  targetAlias?: string;
  onClose: () => void;
  onAsked?: (q: QuestionResponse) => void;
}

export default function AskQuestionModal({
  isOpen,
  targetUserId,
  targetAlias,
  onClose,
  onAsked,
}: Props) {
  const { user } = useAuth();
  const [content, setContent] = useState('');
  const [anonymous, setAnonymous] = useState(true);
  const [customName, setCustomName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const myAnonAlias = user ? generateAnonName(user.id) : '';
  const wallName = targetAlias || (targetUserId ? generateAnonName(targetUserId) : 'Wall Owner');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('Please type your question.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        content: content.trim(),
        anonymous,
        askerName: !anonymous && !user && customName.trim() ? customName.trim() : undefined,
      };

      const created = await qaApi.askQuestion(targetUserId, payload);
      triggerNotificationRefresh();

      if (onAsked) onAsked(created);
      setContent('');
      setCustomName('');
      onClose();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { msg?: string; message?: string } } })?.response?.data?.msg ??
        (err as { response?: { data?: { msg?: string; message?: string } } })?.response?.data?.message ??
        'Failed to send question. Please check content safety.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-vw-border bg-vw-surface shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-vw-border p-5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-100 text-lg dark:bg-violet-950/50">
              ❓
            </span>
            <div>
              <h3 className="text-sm font-bold text-vw-text">Ask {wallName}</h3>
              <p className="text-[11px] text-vw-textMuted">Anonymous Q&A</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl text-vw-textMuted transition hover:bg-vw-muted hover:text-vw-text"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-600 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
              {error}
            </div>
          )}

          {/* Question Textarea */}
          <div>
            <label className="block text-xs font-semibold text-vw-text mb-1.5">
              Your Question
            </label>
            <textarea
              rows={4}
              maxLength={500}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`Ask ${wallName} anything... They can reply publicly on their wall or privately.`}
              className="w-full resize-none rounded-xl border border-vw-border bg-vw-card p-3 text-xs text-vw-text leading-relaxed placeholder:text-vw-textMuted/60 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
              autoFocus
            />
            <div className="mt-1 flex items-center justify-between text-[11px] text-vw-textMuted">
              <span>AI moderated for community safety</span>
              <span>{content.length}/500</span>
            </div>
          </div>

          {/* Anonymity Controls */}
          <div className="rounded-2xl border border-vw-border bg-vw-muted/40 p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-vw-text">Ask Anonymously</p>
                <p className="text-[11px] text-vw-textMuted">
                  {anonymous
                    ? 'Your identity is completely hidden.'
                    : user
                    ? `Visible as "${myAnonAlias}".`
                    : 'Your chosen name will be shown.'}
                </p>
              </div>

              {/* Toggle Switch */}
              <button
                type="button"
                onClick={() => setAnonymous(!anonymous)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  anonymous ? 'bg-violet-600' : 'bg-gray-300 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    anonymous ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Non-anonymous custom name for visitors */}
            {!anonymous && !user && (
              <div className="pt-2 border-t border-vw-border">
                <label className="block text-[11px] font-semibold text-vw-text mb-1">
                  Your Name / Pseudonym
                </label>
                <input
                  type="text"
                  maxLength={30}
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Curious Owl"
                  className="w-full rounded-xl border border-vw-border bg-vw-surface px-3 py-1.5 text-xs text-vw-text focus:border-violet-500 focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* Submit & Cancel */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl border border-vw-border px-4 py-2 text-xs font-semibold text-vw-textMuted transition hover:bg-vw-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !content.trim()}
              className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-2 text-xs font-bold text-white shadow-sm shadow-violet-500/25 transition hover:opacity-95 disabled:opacity-50"
            >
              {submitting ? 'Sending…' : 'Send Question'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
