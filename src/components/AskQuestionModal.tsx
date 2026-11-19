import { useState } from 'react';
import { qaApi } from '../api/qa';
import { aiApi } from '../api/ai';
import { triggerNotificationRefresh } from '../utils/events';
import { generateAnonName } from '../utils/generateAnonName';
import type { QuestionResponse, EnhanceResponse } from '../types';

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
  const [content, setContent] = useState('');
  const [polishing, setPolishing] = useState(false);
  const [enhancedResult, setEnhancedResult] = useState<EnhanceResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const isCommunity = !targetUserId || targetUserId === 'community';
  const wallName = targetAlias || (isCommunity ? 'the Community' : (targetUserId ? generateAnonName(targetUserId) : 'the Community'));

  const handlePolish = async () => {
    if (!content.trim() || polishing) return;
    setPolishing(true);
    setError('');
    try {
      const res = await aiApi.enhance({ text: content.trim(), type: 'QUESTION' });
      setEnhancedResult(res);
    } catch {
      setError('AI enhancement unavailable right now.');
    } finally {
      setPolishing(false);
    }
  };

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
        anonymous: true,
      };

      const created = await qaApi.askQuestion(targetUserId, payload);
      triggerNotificationRefresh();

      if (onAsked) onAsked(created);
      setContent('');
      setEnhancedResult(null);
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
              <p className="text-[11px] text-vw-textMuted">100% Anonymous Q&A</p>
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
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-vw-text">
                Your Question
              </label>
              <button
                type="button"
                onClick={handlePolish}
                disabled={polishing || !content.trim()}
                className="flex items-center gap-1.5 rounded-lg bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700 transition hover:bg-violet-100 disabled:opacity-40 dark:bg-violet-950/40 dark:text-violet-300"
              >
                <span>{polishing ? 'Polishing…' : '✨ AI Polish Question'}</span>
              </button>
            </div>
            <textarea
              rows={4}
              maxLength={500}
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                if (enhancedResult) setEnhancedResult(null);
              }}
              placeholder={`Ask ${wallName} anything... Your question is completely anonymous.`}
              className="w-full resize-none rounded-xl border border-vw-border bg-vw-card p-3 text-xs text-vw-text leading-relaxed placeholder:text-vw-textMuted/60 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
              autoFocus
            />
            <div className="mt-1 flex items-center justify-between text-[11px] text-vw-textMuted">
              <span>AI moderated for community safety</span>
              <span>{content.length}/500</span>
            </div>

            {/* AI Enhancement Box */}
            {enhancedResult && (
              <div className="mt-2.5 rounded-xl border border-violet-200 bg-violet-50/80 p-3.5 text-xs animate-fade-in dark:border-violet-900/50 dark:bg-violet-950/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-violet-900 dark:text-violet-200 flex items-center gap-1">
                    ✨ AI Polished Question
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setContent(enhancedResult.polishedText);
                      setEnhancedResult(null);
                    }}
                    className="rounded-lg bg-violet-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-xs transition hover:bg-violet-700 active:scale-95"
                  >
                    Apply Question ✓
                  </button>
                </div>

                <p className="text-gray-800 dark:text-gray-200 italic bg-white/80 dark:bg-zinc-900/60 p-2.5 rounded-lg border border-violet-100 dark:border-violet-900/40">
                  "{enhancedResult.polishedText}"
                </p>

                {enhancedResult.suggestions && enhancedResult.suggestions.length > 0 && (
                  <div className="space-y-1">
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
          </div>

          {/* Anonymity Notice */}
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/20 p-3.5 flex items-center gap-3">
            <span className="text-xl">🕵️</span>
            <div>
              <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">100% Anonymous Guarantee</p>
              <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80">
                Your real name, profile, and website identity are never shown to anyone. Only you can delete questions you ask.
              </p>
            </div>
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
              {submitting ? 'Sending…' : 'Send Anonymously'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
