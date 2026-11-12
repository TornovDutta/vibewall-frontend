import { useState } from 'react';
import { qaApi } from '../api/qa';
import { triggerNotificationRefresh } from '../utils/events';
import type { QuestionResponse } from '../types';

interface Props {
  isOpen: boolean;
  question: QuestionResponse | null;
  onClose: () => void;
  onReplied: (updated: QuestionResponse) => void;
}

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answer.trim()) {
      setError('Please provide an answer.');
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
        'Failed to submit reply. Please check content safety.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl border border-vw-border bg-vw-surface shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-vw-border p-5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-100 text-lg dark:bg-violet-950/50">
              💬
            </span>
            <div>
              <h3 className="text-sm font-bold text-vw-text">Reply to Question</h3>
              <p className="text-[11px] text-vw-textMuted">
                Asked by <span className="font-semibold text-vw-text">{question.askerAlias}</span>
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

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-600 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
              {error}
            </div>
          )}

          {/* Original Question Card */}
          <div className="rounded-2xl border border-vw-border bg-vw-muted/40 p-4">
            <div className="flex items-center gap-2 mb-1.5 text-[11px] font-semibold text-violet-600 dark:text-violet-400">
              <span>{question.isAnonymous ? '🕵️‍♂️' : '👤'}</span>
              <span>{question.askerAlias} asks:</span>
            </div>
            <p className="text-xs text-vw-text leading-relaxed font-medium">
              "{question.content}"
            </p>
          </div>

          {/* Answer Input */}
          <div>
            <label className="block text-xs font-semibold text-vw-text mb-1.5">
              Your Answer
            </label>
            <textarea
              rows={4}
              maxLength={1000}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Write your response here..."
              className="w-full resize-none rounded-xl border border-vw-border bg-vw-card p-3 text-xs text-vw-text leading-relaxed placeholder:text-vw-textMuted/60 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
              autoFocus
            />
            <div className="mt-1 flex items-center justify-between text-[11px] text-vw-textMuted">
              <span>AI moderated for community safety</span>
              <span>{answer.length}/1000</span>
            </div>
          </div>

          {/* Visibility Toggle */}
          <div className="rounded-2xl border border-vw-border bg-vw-card p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-vw-text">
                  {isPublic ? '🌐 Public Reply' : '🔒 Private Reply'}
                </p>
                <p className="text-[11px] text-vw-textMuted">
                  {isPublic
                    ? 'Publish this Q&A on your public wall for all visitors to read.'
                    : 'Keep this reply private. Only the asker will receive it.'}
                </p>
              </div>

              {/* Toggle Switch */}
              <button
                type="button"
                onClick={() => setIsPublic(!isPublic)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isPublic ? 'bg-violet-600' : 'bg-gray-300 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                    isPublic ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Buttons */}
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
              disabled={submitting || !answer.trim()}
              className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-2 text-xs font-bold text-white shadow-sm shadow-violet-500/25 transition hover:opacity-95 disabled:opacity-50"
            >
              {submitting ? 'Replying…' : isPublic ? 'Publish Public Reply' : 'Send Private Reply'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
