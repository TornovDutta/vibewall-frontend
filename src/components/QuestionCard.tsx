import { useState } from 'react';
import { qaApi } from '../api/qa';
import { useAuth } from '../context/AuthContext';
import { triggerNotificationRefresh } from '../utils/events';
import type { QuestionResponse } from '../types';

interface Props {
  question: QuestionResponse;
  isOwner?: boolean;
  onReplyClick?: (q: QuestionResponse) => void;
  onDelete?: (id: string) => void;
}

function formatTimeAgo(dateString?: string) {
  if (!dateString) return '';
  const now = new Date().getTime();
  const past = new Date(dateString).getTime();
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

  const isTargetOwner = !!user && user.id === question.targetUserId;
  const isCommunity = !question.targetUserId || question.targetUserId === 'community';
  const canReply = isOwner || isTargetOwner || (isCommunity && !!user);
  const canManage = isOwner || isTargetOwner || user?.role === 'ADMIN';

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this question?')) return;
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

  return (
    <article className="overflow-hidden rounded-2xl border border-vw-border bg-vw-card shadow-2xs transition-all duration-200 hover:border-violet-300 dark:hover:border-violet-800">
      {/* Question Header & Content */}
      <div className="p-5">
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-violet-100 text-xs font-bold text-violet-700 dark:bg-violet-950/50 dark:text-violet-300">
              {question.isAnonymous ? '🕵️‍♂️' : '👤'}
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-vw-text">
                  {question.askerAlias || 'Anonymous'}
                </span>
                {question.isAnonymous ? (
                  <span className="rounded-full bg-vw-muted px-1.5 py-0.2 text-[9px] font-semibold text-vw-textMuted">
                    Anon
                  </span>
                ) : (
                  <span className="rounded-full bg-violet-100 px-1.5 py-0.2 text-[9px] font-bold text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                    Alias
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] text-vw-textMuted">
              {formatTimeAgo(question.createdAt)}
            </span>
            {canManage && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                title="Delete question"
                className="flex h-6 w-6 items-center justify-center rounded-lg text-vw-textMuted transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30"
              >
                🗑️
              </button>
            )}
          </div>
        </div>

        {/* Question Text */}
        <p className="text-xs sm:text-sm font-semibold text-vw-text leading-relaxed pl-1">
          "{question.content}"
        </p>
      </div>

      {/* Answer Section */}
      {question.status === 'ANSWERED' && question.answer ? (
        <div className="border-t border-vw-border/70 bg-vw-muted/30 p-4 sm:p-5">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-gradient-to-tr from-violet-600 to-fuchsia-600 text-[10px] font-bold text-white shadow-2xs">
                {question.targetAlias ? question.targetAlias.charAt(0) : 'W'}
              </span>
              <span className="text-xs font-bold text-vw-text">
                {question.targetAlias || 'Wall Owner'}
              </span>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 border border-emerald-500/20 dark:text-emerald-400">
                Replied
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  question.isPublic
                    ? 'bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/50'
                    : 'bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/50'
                }`}
              >
                {question.isPublic ? '🌐 Public' : '🔒 Private'}
              </span>
              <span className="text-[10px] text-vw-textMuted">
                {formatTimeAgo(question.answeredAt)}
              </span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-vw-text leading-relaxed pl-8">
            {question.answer}
          </p>
        </div>
      ) : (
        /* Pending unanswered state */
        <div className="border-t border-vw-border/70 bg-vw-muted/20 px-5 py-3 flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
            Pending Reply
          </span>

          {canReply && onReplyClick && (
            <button
              type="button"
              onClick={() => onReplyClick(question)}
              className="flex items-center gap-1.5 rounded-xl bg-violet-600 px-3 py-1.5 text-xs font-bold text-white shadow-2xs transition hover:bg-violet-700 active:scale-95"
            >
              <span>💬</span>
              <span>Reply</span>
            </button>
          )}
        </div>
      )}
    </article>
  );
}
