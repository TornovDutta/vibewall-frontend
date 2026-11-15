import { useState } from 'react';
import { qaApi } from '../api/qa';
import type { QuestionResponse } from '../types';
import { triggerNotificationRefresh } from '../utils/events';
import { getAvatarGradient } from '../utils/generateAnonName';

interface Props {
  isOpen: boolean;
  question: QuestionResponse | null;
  onClose: () => void;
  onReplied: (updated: QuestionResponse) => void;
}

const STARTER_PROMPTS = [
  'Thank you for asking! ',
  'To be honest, ',
  'From my experience, ',
  'I appreciate this question. ',
];

export default function ReplyQuestionModal({
  isOpen,
  question,
  onClose,
  onReplied,
}: Props) {
  const [answer, setAnswer] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !question) return null;

  const askerSeed = question.askerAlias || question.id;
  const askerGradient = getAvatarGradient(askerSeed);

  const handleAddStarter = (starter: string) => {
    setAnswer((prev) => (prev ? `${prev} ${starter}` : starter));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim()) {
      setError('Please provide an answer before submitting.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const updated = await qaApi.replyQuestion(question.id, {
        answer: answer.trim(),
        isPublic,
      });

      triggerNotificationRefresh();
      onReplied(updated);
      setAnswer('');
      onClose();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { msg?: string; message?: string } } })?.response?.data?.msg ??
        (err as { response?: { data?: { msg?: string; message?: string } } })?.response?.data?.message ??
        'Failed to submit reply. Please ensure respectful language.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-vw-border bg-vw-surface shadow-2xl animate-slide-up">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-vw-border px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 text-sm text-white shadow-xs">
              💬
            </span>
            <div>
              <h3 className="text-sm font-bold text-vw-text">Reply to Question</h3>
              <p className="text-[11px] text-vw-textMuted">
                Direct answer to <span className="font-semibold text-vw-text">{question.askerAlias || 'Anonymous'}</span>
              </p>
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

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs font-medium text-rose-600 dark:text-rose-400">
              ⚠️ {error}
            </div>
          )}

          {/* Original Question Card with quote styling */}
          <div className="rounded-2xl border border-vw-border bg-vw-muted/40 p-4 relative">
            <div className="flex items-center gap-2 mb-2">
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-tr ${askerGradient} text-[10px] font-bold text-white shadow-2xs`}
              >
                {question.isAnonymous ? '🕵️' : question.askerAlias?.charAt(0) || '👤'}
              </div>
              <span className="text-xs font-bold text-violet-600 dark:text-violet-400">
                {question.askerAlias || 'Anonymous'} asks:
              </span>
            </div>
            <p className="text-xs text-vw-text leading-relaxed font-semibold pl-1 italic">
              "{question.content}"
            </p>
          </div>

          {/* Quick starter chips */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold text-vw-textMuted uppercase tracking-wider">
              Quick Starters:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {STARTER_PROMPTS.map((starter, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAddStarter(starter)}
                  className="rounded-full border border-vw-border bg-vw-surface px-2.5 py-1 text-[11px] font-medium text-vw-text transition hover:border-violet-500 hover:text-violet-600"
                >
                  + "{starter.trim()}"
                </button>
              ))}
            </div>
          </div>

          {/* Answer Input */}
          <div>
            <label className="block text-xs font-bold text-vw-text mb-1.5">
              Your Response
            </label>
            <textarea
              rows={4}
              maxLength={1000}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Write a thoughtful, authentic reply…"
              className="w-full resize-none rounded-2xl border border-vw-border bg-vw-card p-3.5 text-xs text-vw-text leading-relaxed placeholder:text-vw-textMuted/60 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
              autoFocus
            />
            <div className="mt-1.5 flex items-center justify-between text-[11px] text-vw-textMuted">
              <span className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                <span>🛡️</span> AI intent verified
              </span>
              <span className="font-mono text-[10px]">{answer.length}/1000</span>
            </div>
          </div>

          {/* Visibility Selector: Public vs Private Cards */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-vw-text">
              Reply Visibility
            </label>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setIsPublic(true)}
                className={`flex flex-col items-start rounded-2xl border p-3 text-left transition-all ${
                  isPublic
                    ? 'border-violet-500 bg-violet-500/10 shadow-xs'
                    : 'border-vw-border bg-vw-surface hover:border-violet-300'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-vw-text">
                  <span>🌐</span>
                  <span>Public Wall</span>
                </div>
                <p className="mt-1 text-[10px] text-vw-textMuted leading-relaxed">
                  Visible on your public Q&A wall and community feed.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setIsPublic(false)}
                className={`flex flex-col items-start rounded-2xl border p-3 text-left transition-all ${
                  !isPublic
                    ? 'border-violet-500 bg-violet-500/10 shadow-xs'
                    : 'border-vw-border bg-vw-surface hover:border-violet-300'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-vw-text">
                  <span>🔒</span>
                  <span>Private Asker</span>
                </div>
                <p className="mt-1 text-[10px] text-vw-textMuted leading-relaxed">
                  Confidential response delivered only to the asker's inbox.
                </p>
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-vw-border/70">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl border border-vw-border px-4 py-2 text-xs font-semibold text-vw-textMuted transition hover:bg-vw-muted hover:text-vw-text"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !answer.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-2 text-xs font-bold text-white shadow-sm shadow-violet-500/25 transition hover:brightness-110 active:scale-95 disabled:opacity-50"
            >
              {submitting ? (
                <span>Publishing…</span>
              ) : (
                <>
                  <span>{isPublic ? 'Publish Public Reply' : 'Send Private Reply'}</span>
                  <span>→</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
