import { useState } from 'react';
import { qaApi } from '../api/qa';
import { useAuth } from '../context/AuthContext';
import type { QuestionResponse } from '../types';
import { triggerNotificationRefresh } from '../utils/events';
import { getAvatarGradient } from '../utils/generateAnonName';

interface Props {
  question: QuestionResponse;
  isOwner?: boolean;
  onReplyClick?: (q: QuestionResponse) => void;
  onDelete?: (id: string) => void;
}

function formatTimeAgo(dateString?: string) {
  if (!dateString) return 'recently';
  const now = new Date().getTime();
  const past = new Date(dateString).getTime();
  if (isNaN(past)) return 'recently';
  const diffSec = Math.max(0, Math.floor((now - past) / 1000));

  if (diffSec < 60) return 'just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export default function QuestionCard({
  question,
  isOwner,
  onReplyClick,
  onDelete,
}: Props) {
  const { user } = useAuth();
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState(false);

  const isTargetOwner = !!user && user.id === question.targetUserId;
  const isCommunity = !question.targetUserId || question.targetUserId === 'community';
  const canReply = isOwner || isTargetOwner || (isCommunity && !!user);
  const canManage = isOwner || isTargetOwner || user?.role === 'ADMIN';

  const askerSeed = question.askerAlias || question.id;
  const askerGradient = getAvatarGradient(askerSeed);

  const targetSeed = question.targetAlias || question.targetUserId || 'wall';
  const targetGradient = getAvatarGradient(targetSeed);

  const isAnswered = question.status === 'ANSWERED' && !!question.answer;

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this Q&A thread?')) return;
    setDeleting(true);
    try {
      await qaApi.deleteQuestion(question.id);
      triggerNotificationRefresh();
      if (onDelete) onDelete(question.id);
    } catch {
      alert('Failed to delete question.');
    } finally {
      setDeleting(false);
    }
  };

  const handleCopy = () => {
    const textToCopy = isAnswered
      ? `Q: "${question.content}"\nA: "${question.answer}" — via VibeWall`
      : `Q: "${question.content}" — via VibeWall`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <article className="overflow-hidden rounded-2xl border border-vw-border bg-vw-card shadow-xs transition-all duration-300 hover:border-violet-500/40 hover:shadow-md">
      {/* Top Question Section */}
      <div className="p-5">
        <div className="flex items-center justify-between gap-3 mb-3">
          {/* Asker identity */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr ${askerGradient} text-xs font-bold text-white shadow-2xs`}
            >
              {question.isAnonymous ? '🕵️' : question.askerAlias?.charAt(0) || '👤'}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-bold text-vw-text truncate">
                  {question.askerAlias || 'Anonymous'}
                </span>
                {question.isAnonymous ? (
                  <span className="rounded-full bg-vw-muted px-2 py-0.2 text-[9px] font-semibold text-vw-textMuted">
                    Anonymous
                  </span>
                ) : (
                  <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-2 py-0.2 text-[9px] font-bold text-violet-600 dark:text-violet-400">
                    Named Alias
                  </span>
                )}
              </div>
              <p className="text-[10px] text-vw-textMuted">
                Asked {formatTimeAgo(question.createdAt)}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handleCopy}
              title="Copy Q&A thread"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-vw-textMuted transition hover:bg-vw-muted hover:text-vw-text"
            >
              {copied ? (
                <span className="text-xs text-emerald-500">✓</span>
              ) : (
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              )}
            </button>

            {canManage && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                title="Delete question"
                className="flex h-7 w-7 items-center justify-center rounded-lg text-vw-textMuted transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30"
              >
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Question Bubble */}
        <div className="relative rounded-2xl border border-vw-border/80 bg-vw-surface/80 p-4 shadow-2xs">
          <span className="absolute -top-2 left-4 rounded-full bg-violet-600 px-2 py-0.2 text-[9px] font-extrabold uppercase tracking-wider text-white shadow-2xs">
            Question
          </span>
          <p className="mt-1 text-xs sm:text-sm font-semibold text-vw-text leading-relaxed pl-1">
            "{question.content}"
          </p>
        </div>
      </div>

      {/* Answer / Reply Section with Connected Thread */}
      {isAnswered ? (
        <div className="relative border-t border-vw-border/70 bg-vw-muted/30 p-5">
          {/* Curved Thread Connector Line */}
          <div className="absolute -top-3 left-9 h-6 w-4 rounded-bl-xl border-b-2 border-l-2 border-violet-500/30 pointer-events-none" />

          {/* Responder Header */}
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-2.5">
              <div
                className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr ${targetGradient} text-[11px] font-bold text-white shadow-2xs`}
              >
                {question.targetAlias ? question.targetAlias.charAt(0) : 'W'}
              </div>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-bold text-vw-text">
                    {question.targetAlias || 'Wall Owner'}
                  </span>
                  <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.2 text-[9px] font-bold text-emerald-600 dark:text-emerald-400">
                    Replied
                  </span>
                </div>
                <span className="text-[10px] text-vw-textMuted">
                  {formatTimeAgo(question.answeredAt)}
                </span>
              </div>
            </div>

            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                question.isPublic
                  ? 'border border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400'
                  : 'border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400'
              }`}
            >
              {question.isPublic ? '🌐 Public Answer' : '🔒 Private Answer'}
            </span>
          </div>

          {/* Answer Bubble */}
          <div className="rounded-2xl border border-violet-500/20 bg-vw-surface/90 p-4 shadow-2xs">
            <p className="text-xs sm:text-sm text-vw-text leading-relaxed whitespace-pre-wrap">
              {question.answer}
            </p>
          </div>
        </div>
      ) : (
        /* Pending unanswered state */
        <div className="flex items-center justify-between border-t border-vw-border/70 bg-vw-muted/20 px-5 py-3.5">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
            </span>
            <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
              Awaiting response from {question.targetAlias || 'wall owner'}
            </span>
          </div>

          {canReply && onReplyClick && (
            <button
              type="button"
              onClick={() => onReplyClick(question)}
              className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition hover:brightness-110 active:scale-95"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                />
              </svg>
              <span>Reply to Question</span>
            </button>
          )}
        </div>
      )}
    </article>
  );
}
