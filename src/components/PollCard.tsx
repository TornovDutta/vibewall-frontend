import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pollsApi } from '../api/polls';
import { useAuth } from '../context/AuthContext';
import { triggerNotificationRefresh } from '../utils/events';
import type { PollResponse } from '../types';

interface Props {
  poll: PollResponse;
  onUpdate?: (updated: PollResponse) => void;
  onDelete?: (id: string) => void;
}

export default function PollCard({ poll, onUpdate, onDelete }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [voting, setVoting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');

  const hasVoted = poll.userVotedOptionId !== undefined && poll.userVotedOptionId !== null;
  const isOwner = user?.id === poll.userId || user?.role === 'ADMIN';

  // Find the winning option id (highest vote count)
  const maxVotes = Math.max(...poll.options.map((o) => o.voteCount), 0);

  const handleVote = async (optionId: number) => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (voting) return;

    setVoting(true);
    setError('');
    try {
      const updated = await pollsApi.vote(poll.id, optionId);
      if (onUpdate) onUpdate(updated);
      triggerNotificationRefresh();
    } catch {
      setError('Could not cast vote. Please try again.');
    } finally {
      setVoting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this poll?')) return;
    try {
      await pollsApi.deletePoll(poll.id);
      if (onDelete) onDelete(poll.id);
    } catch {
      alert('Failed to delete poll.');
    }
  };

  const handleShare = () => {
    const url = `${window.location.origin}/polls`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Category badge styling
  const getCategoryClass = (cat: string) => {
    switch (cat?.toLowerCase()) {
      case 'relationships':
        return 'bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/20';
      case 'hot takes':
      case 'hot take':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
      case 'career':
      case 'work':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'deep thoughts':
      case 'life':
        return 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20';
      default:
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-vw-border bg-vw-card p-5 sm:p-6 shadow-sm transition-all duration-200 hover:shadow-md">
      {/* ── Top Meta Bar ── */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          {poll.category && (
            <span
              className={`rounded-full border px-2.5 py-0.5 text-[11px] font-bold tracking-wide uppercase ${getCategoryClass(
                poll.category
              )}`}
            >
              {poll.category}
            </span>
          )}
          <span className="flex items-center gap-1 text-[11px] font-medium text-vw-textMuted">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-pulse" />
            Live Vote
          </span>
        </div>

        {/* Actions (Share & Delete) */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleShare}
            title="Share poll"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-vw-textMuted hover:bg-vw-muted hover:text-vw-text transition"
          >
            {copied ? (
              <span className="text-[10px] font-bold text-emerald-500">✓</span>
            ) : (
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                />
              </svg>
            )}
          </button>

          {isOwner && (
            <button
              type="button"
              onClick={handleDelete}
              title="Delete poll"
              className="flex h-7 w-7 items-center justify-center rounded-lg text-vw-textMuted hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-950/30 transition"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* ── Poll Question ── */}
      <h3 className="text-base sm:text-lg font-bold text-vw-text leading-snug mb-4">
        {poll.question}
      </h3>

      {error && (
        <div className="mb-3 rounded-xl bg-rose-50 p-2 text-xs text-rose-600 dark:bg-rose-950/40 dark:text-rose-300">
          {error}
        </div>
      )}

      {/* ── Options List ── */}
      <div className="space-y-2.5">
        {poll.options.map((opt) => {
          const isUserPick = poll.userVotedOptionId === opt.id;
          const isWinning = maxVotes > 0 && opt.voteCount === maxVotes;

          return (
            <button
              key={opt.id}
              type="button"
              disabled={voting}
              onClick={() => handleVote(opt.id)}
              className={`group relative w-full overflow-hidden rounded-xl border text-left transition-all duration-300 ${
                isUserPick
                  ? 'border-violet-500 bg-violet-50/30 dark:border-violet-600 dark:bg-violet-950/30 ring-1 ring-violet-500/40'
                  : 'border-vw-border bg-vw-surface hover:border-violet-400/60 hover:bg-vw-muted/40'
              } ${voting ? 'opacity-70 cursor-wait' : 'cursor-pointer'}`}
            >
              {/* Live Animated Background Fill Bar (Only when voted or live) */}
              {hasVoted && (
                <div
                  className={`absolute inset-y-0 left-0 transition-all duration-700 ease-out ${
                    isUserPick
                      ? 'bg-gradient-to-r from-violet-500/20 to-fuchsia-500/20 dark:from-violet-500/30 dark:to-fuchsia-500/30'
                      : isWinning
                      ? 'bg-violet-100/60 dark:bg-violet-900/20'
                      : 'bg-vw-muted/70'
                  }`}
                  style={{ width: `${opt.percentage}%` }}
                />
              )}

              {/* Option Content Content */}
              <div className="relative z-10 flex items-center justify-between gap-3 px-4 py-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  {/* Selection Radio Dot / Check */}
                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[9px] font-bold transition-all ${
                      isUserPick
                        ? 'border-violet-600 bg-violet-600 text-white'
                        : 'border-vw-border group-hover:border-violet-400'
                    }`}
                  >
                    {isUserPick ? '✓' : ''}
                  </span>

                  <span
                    className={`truncate text-xs sm:text-sm font-semibold transition ${
                      isUserPick ? 'text-violet-700 dark:text-violet-300' : 'text-vw-text'
                    }`}
                  >
                    {opt.text}
                  </span>

                  {isUserPick && (
                    <span className="shrink-0 rounded-full bg-violet-500/15 px-2 py-0.5 text-[10px] font-bold text-violet-600 dark:text-violet-400">
                      Your vote
                    </span>
                  )}
                </div>

                {/* Live Percentage & Vote Count */}
                {hasVoted && (
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-bold text-vw-text">
                      {opt.percentage.toFixed(1)}%
                    </span>
                    <span className="text-[11px] text-vw-textMuted">
                      ({opt.voteCount})
                    </span>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* ── Footer Info ── */}
      <div className="mt-4 flex items-center justify-between border-t border-vw-border/60 pt-3 text-xs text-vw-textMuted">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-vw-text">{poll.totalVotes}</span>
          <span>{poll.totalVotes === 1 ? 'vote cast' : 'total votes'}</span>
        </div>

        <div className="flex items-center gap-2">
          {!hasVoted && (
            <span className="text-[11px] text-violet-500 font-semibold">
              Tap an option to vote
            </span>
          )}
          {hasVoted && (
            <span className="text-[11px] text-vw-textMuted">
              Tap another option to switch
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
