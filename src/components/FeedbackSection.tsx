import { useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { feedbackApi } from '../api/feedback';
import { aiApi } from '../api/ai';
import { useAuth } from '../context/AuthContext';
import type { ConfessionResponse, FeedbackItem, OwnedFeedback, EnhanceResponse } from '../types';
import { triggerNotificationRefresh } from '../utils/events';
import { generateAnonName, getAvatarGradient } from '../utils/generateAnonName';

const OWNED_FB_KEY = 'vw_owned_feedbacks';

function getOwnedFeedbacks(): OwnedFeedback[] {
  try {
    return JSON.parse(localStorage.getItem(OWNED_FB_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function saveOwnedFeedback(item: OwnedFeedback) {
  const existing = getOwnedFeedbacks();
  localStorage.setItem(OWNED_FB_KEY, JSON.stringify([...existing, item]));
}

function removeOwnedFeedback(confessionId: string, feedbackId: number) {
  const existing = getOwnedFeedbacks().filter(
    (f) => !(f.confessionId === confessionId && f.feedbackId === feedbackId)
  );
  localStorage.setItem(OWNED_FB_KEY, JSON.stringify(existing));
}

function formatCommentDate(dateString?: string): string {
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
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(dateString).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

interface Props {
  confession: ConfessionResponse;
  onUpdate: (updated: ConfessionResponse) => void;
}

const QUICK_SENTIMENTS = [
  { label: "You're not alone", emoji: '💜' },
  { label: 'Sending hugs', emoji: '🫂' },
  { label: 'Proud of you', emoji: '✨' },
  { label: 'Stay strong', emoji: '🙏' },
  { label: 'Relatable', emoji: '🙌' },
];

export default function FeedbackSection({ confession, onUpdate }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [text, setText] = useState('');
  const [replyingTo, setReplyingTo] = useState<{ id: number; author: string } | null>(null);
  const [sortBy, setSortBy] = useState<'NEWEST' | 'TOP_LIKED'>('NEWEST');

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [polishingComment, setPolishingComment] = useState(false);
  const [enhancedComment, setEnhancedComment] = useState<EnhanceResponse | null>(null);
  const [likingId, setLikingId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const ownedFeedbacks = getOwnedFeedbacks();
  const isOwned = (fb: FeedbackItem) =>
    ownedFeedbacks.some((o) => o.confessionId === confession.id && o.feedbackId === fb.id);

  // Current logged in user alias
  const currentUserAlias = user ? generateAnonName(user.id) : 'Anonymous';
  const currentUserGradient = user ? getAvatarGradient(user.id) : 'from-gray-500 to-gray-600';

  // Sorted feedbacks
  const sortedFeedbacks = useMemo(() => {
    const list = [...confession.feedbacks];
    if (sortBy === 'TOP_LIKED') {
      return list.sort((a, b) => {
        const likesA = a.likes ?? (a.likedUserIds?.length ?? 0);
        const likesB = b.likes ?? (b.likedUserIds?.length ?? 0);
        return likesB - likesA;
      });
    }
    // Default newest first (by id descending or date)
    return list.sort((a, b) => b.id - a.id);
  }, [confession.feedbacks, sortBy]);

  async function handleLike(fb: FeedbackItem) {
    if (!user) return;
    setLikingId(fb.id);
    try {
      const updated = await feedbackApi.like(confession.id, fb.id);
      onUpdate(updated);
    } catch {
      // ignore
    } finally {
      setLikingId(null);
    }
  }

  function handleStartReply(fb: FeedbackItem) {
    const author = fb.userId ? generateAnonName(fb.userId) : `Vibester-${fb.id}`;
    setReplyingTo({ id: fb.id, author });
    setError('');

    // Pre-insert mention if not already there
    const mention = `@${author} `;
    if (!text.startsWith(mention)) {
      setText((prev) => `${mention}${prev}`);
    }

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(textareaRef.current.value.length, textareaRef.current.value.length);
      }
    }, 50);
  }

  function handleCancelReply() {
    if (replyingTo) {
      const mention = `@${replyingTo.author} `;
      if (text.startsWith(mention)) {
        setText(text.replace(mention, ''));
      }
    }
    setReplyingTo(null);
  }

  function handleAddChip(chip: { label: string; emoji: string }) {
    const chipText = `${chip.emoji} ${chip.label}`;
    setText((prev) => (prev ? `${prev} ${chipText}` : chipText));
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }

  async function handlePolishComment() {
    if (!text.trim() || polishingComment) return;
    setPolishingComment(true);
    setError('');
    try {
      const res = await aiApi.enhance({ text: text.trim(), type: 'CONFESSION' });
      setEnhancedComment(res);
    } catch {
      setError('AI comment polish is unavailable right now.');
    } finally {
      setPolishingComment(false);
    }
  }

  async function handleAdd() {
    if (!text.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const updated = await feedbackApi.add(confession.id, { content: text.trim() });
      const oldIds = new Set(confession.feedbacks.map((f) => f.id));
      const newFb = updated.feedbacks.find((f) => !oldIds.has(f.id));
      if (newFb) saveOwnedFeedback({ confessionId: confession.id, feedbackId: newFb.id });
      onUpdate(updated);
      setText('');
      setReplyingTo(null);
      setEnhancedComment(null);
      triggerNotificationRefresh();
    } catch (e: unknown) {
      const err = e as { response?: { status?: number; data?: { msg?: string; message?: string; details?: string } } };
      const status = err?.response?.status;
      const msg =
        err?.response?.data?.message ??
        err?.response?.data?.msg ??
        err?.response?.data?.details ??
        'Failed to post comment. Please ensure respectful language.';

      const isSafetyViolation =
        status === 422 ||
        /unsafe|guideline|hateful|harassment|violation|prohibited|rules|harmful/i.test(msg);

      if (isSafetyViolation) {
        navigate(`/rules?violation=true&reason=${encodeURIComponent(msg)}`);
        return;
      }

      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdate(fb: FeedbackItem) {
    if (!editText.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const updated = await feedbackApi.update(confession.id, fb.id, { content: editText.trim() });
      onUpdate(updated);
      setEditingId(null);
    } catch (e: unknown) {
      const err = e as { response?: { status?: number; data?: { msg?: string; message?: string; details?: string } } };
      const status = err?.response?.status;
      const msg =
        err?.response?.data?.message ??
        err?.response?.data?.msg ??
        err?.response?.data?.details ??
        'Failed to update comment.';

      const isSafetyViolation =
        status === 422 ||
        /unsafe|guideline|hateful|harassment|violation|prohibited|rules|harmful/i.test(msg);

      if (isSafetyViolation) {
        navigate(`/rules?violation=true&reason=${encodeURIComponent(msg)}`);
        return;
      }

      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(fb: FeedbackItem) {
    if (!window.confirm('Delete this comment?')) return;
    setSubmitting(true);
    setError('');
    try {
      await feedbackApi.delete(confession.id, fb.id);
      removeOwnedFeedback(confession.id, fb.id);
      onUpdate({
        ...confession,
        feedbacks: confession.feedbacks.filter((f) => f.id !== fb.id),
      });
    } catch (e: unknown) {
      const err = e as { response?: { data?: { msg?: string } } };
      setError(err?.response?.data?.msg ?? 'Failed to delete response.');
    } finally {
      setSubmitting(false);
    }
  }

  // Parse and render mentions in text
  const renderCommentContent = (content: string) => {
    const parts = content.split(/(@[A-Za-z0-9_-]+(?:\s[A-Za-z0-9_-]+)?)/g);
    return parts.map((part, i) => {
      if (part.startsWith('@')) {
        return (
          <span
            key={i}
            className="inline-flex items-center rounded-md bg-violet-500/10 px-1.5 py-0.5 text-xs font-bold text-violet-600 dark:text-violet-400"
          >
            {part}
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="space-y-4 pt-1">
      {/* ── Section Header: Count and Sorting ── */}
      <div className="flex items-center justify-between border-b border-vw-border/70 pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-violet-500/10 text-xs text-violet-600 dark:text-violet-400">
            💬
          </span>
          <h4 className="text-xs font-bold uppercase tracking-wider text-vw-text">
            Responses & Support
          </h4>
          <span className="rounded-full bg-vw-muted px-2 py-0.5 text-[10px] font-bold text-vw-textMuted">
            {confession.feedbacks.length}
          </span>
        </div>

        {confession.feedbacks.length > 1 && (
          <div className="flex items-center gap-1 rounded-lg border border-vw-border/80 bg-vw-surface/80 p-0.5 text-[11px]">
            <button
              type="button"
              onClick={() => setSortBy('NEWEST')}
              className={`rounded-md px-2 py-0.5 font-medium transition ${
                sortBy === 'NEWEST'
                  ? 'bg-violet-600 text-white shadow-2xs'
                  : 'text-vw-textMuted hover:text-vw-text'
              }`}
            >
              Newest
            </button>
            <button
              type="button"
              onClick={() => setSortBy('TOP_LIKED')}
              className={`rounded-md px-2 py-0.5 font-medium transition ${
                sortBy === 'TOP_LIKED'
                  ? 'bg-violet-600 text-white shadow-2xs'
                  : 'text-vw-textMuted hover:text-vw-text'
              }`}
            >
              Top Liked
            </button>
          </div>
        )}
      </div>

      {/* ── Comments List ── */}
      {sortedFeedbacks.length > 0 ? (
        <div className="space-y-3">
          {sortedFeedbacks.map((fb) => {
            const authorSeed = fb.userId || `fb-${fb.id}`;
            const authorAlias = fb.userId ? generateAnonName(fb.userId) : `Vibester-${fb.id.toString().slice(-3)}`;
            const avatarGradient = getAvatarGradient(authorSeed);
            const isUserLiked = !!user && !!fb.likedUserIds?.includes(user.id);
            const likeCount = fb.likes ?? (fb.likedUserIds?.length ?? 0);
            const isReplying = replyingTo?.id === fb.id;
            const isCommentOwned = isOwned(fb);
            const isEditing = editingId === fb.id;
            const isReplyThread = fb.content.trim().startsWith('@');

            return (
              <div
                key={fb.id}
                className={`group relative rounded-2xl border transition-all duration-200 ${
                  isReplyThread
                    ? 'border-vw-border/60 bg-vw-surface/40 ml-4 pl-3 sm:ml-6'
                    : 'border-vw-border bg-vw-surface/70 hover:border-violet-500/30'
                } p-3.5 shadow-2xs backdrop-blur-sm`}
              >
                {/* Curved Thread Indicator Line for replies */}
                {isReplyThread && (
                  <div className="absolute -left-3 top-4 h-5 w-3 rounded-bl-xl border-b-2 border-l-2 border-violet-500/30 pointer-events-none" />
                )}

                {/* Comment Header */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    {/* Unique Anonymous Gradient Avatar */}
                    <div
                      className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr ${avatarGradient} text-[11px] font-extrabold text-white shadow-2xs`}
                    >
                      {authorAlias.charAt(0)}
                    </div>

                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-vw-text">
                        {authorAlias}
                      </span>

                      {isCommentOwned && (
                        <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-1.5 py-0.2 text-[9px] font-bold text-violet-600 dark:text-violet-400">
                          You
                        </span>
                      )}

                      <span className="text-[10px] text-vw-textMuted">
                        • {formatCommentDate(fb.date)}
                      </span>
                    </div>
                  </div>

                  {/* Owner Controls */}
                  {user && isCommentOwned && !isEditing && (
                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(fb.id);
                          setEditText(fb.content);
                        }}
                        className="rounded-lg p-1 text-[11px] text-vw-textMuted transition hover:bg-vw-muted hover:text-violet-600"
                        title="Edit response"
                      >
                        ✎
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(fb)}
                        disabled={submitting}
                        className="rounded-lg p-1 text-[11px] text-vw-textMuted transition hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30"
                        title="Delete response"
                      >
                        🗑️
                      </button>
                    </div>
                  )}
                </div>

                {/* Comment Content / Edit Mode */}
                {isEditing ? (
                  <div className="space-y-2 mt-1">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      rows={2}
                      maxLength={500}
                      className="w-full resize-none rounded-xl border border-vw-border bg-vw-surface px-3 py-2 text-xs text-vw-text focus:border-violet-500 focus:outline-none"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="rounded-lg px-2.5 py-1 text-xs text-vw-textMuted transition hover:text-vw-text"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleUpdate(fb)}
                        disabled={submitting || !editText.trim()}
                        className="rounded-lg bg-violet-600 px-3 py-1 text-xs font-bold text-white shadow-2xs transition hover:bg-violet-700 disabled:opacity-50"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-vw-text leading-relaxed pl-9 whitespace-pre-wrap font-normal">
                    {renderCommentContent(fb.content)}
                  </p>
                )}

                {/* Comment Footer & Interactive Actions */}
                {!isEditing && (
                  <div className="mt-2.5 flex items-center justify-between pl-9 pt-1.5 border-t border-vw-border/40">
                    <div className="flex items-center gap-2">
                      {/* Like Heart Button */}
                      <button
                        type="button"
                        onClick={() => handleLike(fb)}
                        disabled={likingId === fb.id || !user}
                        className={`group/like flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition active:scale-95 ${
                          isUserLiked
                            ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                            : 'text-vw-textMuted hover:bg-rose-500/10 hover:text-rose-500 border border-transparent'
                        }`}
                        title={
                          user
                            ? isUserLiked
                              ? 'Unlike comment'
                              : 'Like comment (+5 vibe points to author)'
                            : 'Log in to like'
                        }
                      >
                        <svg
                          className={`h-3.5 w-3.5 transition-transform duration-200 group-hover/like:scale-125 ${
                            isUserLiked ? 'scale-110 text-rose-500 fill-current' : 'fill-none'
                          }`}
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                          />
                        </svg>
                        <span>{likeCount}</span>
                      </button>

                      {/* Reply Button */}
                      {user && (
                        <button
                          type="button"
                          onClick={() => handleStartReply(fb)}
                          className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition ${
                            isReplying
                              ? 'bg-violet-500/15 text-violet-600 border border-violet-500/30'
                              : 'text-vw-textMuted hover:bg-violet-500/10 hover:text-violet-600 border border-transparent'
                          }`}
                          title={`Reply to ${authorAlias}`}
                        >
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2.5}
                              d="M3 10h10a5 5 0 015 5v2m0 0l-4-4m4 4l4-4"
                            />
                          </svg>
                          <span>Reply</span>
                        </button>
                      )}
                    </div>

                    <span className="text-[10px] text-vw-textMuted/70 font-mono">
                      #{fb.id}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="rounded-2xl border border-dashed border-vw-border/80 bg-vw-surface/40 p-6 text-center">
          <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-500/10 text-lg text-violet-500">
            💬
          </div>
          <p className="text-xs font-semibold text-vw-text">No responses yet</p>
          <p className="mt-0.5 text-[11px] text-vw-textMuted">
            Be the first to share positive, supportive words or helpful advice.
          </p>
        </div>
      )}

      {/* ── Comment & Reply Composer ── */}
      {user ? (
        <div className="space-y-2 pt-2">
          {error && (
            <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-2.5 text-xs text-rose-600 dark:text-rose-400">
              ⚠️ {error}
            </div>
          )}

          {/* Quick Supportive Sentiments Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            <span className="text-[10px] font-bold text-vw-textMuted shrink-0">
              Support:
            </span>
            {QUICK_SENTIMENTS.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleAddChip(chip)}
                className="inline-flex shrink-0 items-center gap-1 rounded-full border border-vw-border/70 bg-vw-surface/80 px-2.5 py-0.5 text-[11px] font-semibold text-vw-text transition hover:border-violet-400 hover:bg-violet-500/10 hover:text-violet-600"
              >
                <span>{chip.emoji}</span>
                <span>{chip.label}</span>
              </button>
            ))}
          </div>

          {/* Composer Card */}
          <div className="rounded-2xl border border-vw-border bg-vw-surface/90 p-3 shadow-xs transition-all focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-500/20">
            {/* Replying Banner */}
            {replyingTo && (
              <div className="mb-2 flex items-center justify-between rounded-xl bg-violet-500/10 px-2.5 py-1 text-xs text-violet-600 dark:text-violet-400">
                <div className="flex items-center gap-1.5 font-medium">
                  <span>Replying to</span>
                  <span className="font-bold">@{replyingTo.author}</span>
                </div>
                <button
                  type="button"
                  onClick={handleCancelReply}
                  className="rounded-lg p-0.5 text-violet-500 hover:bg-violet-500/20 hover:text-violet-700"
                  title="Cancel reply"
                >
                  ✕
                </button>
              </div>
            )}

            <div className="flex gap-2.5">
              {/* Current User Avatar */}
              <div
                className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr ${currentUserGradient} text-[11px] font-extrabold text-white shadow-2xs`}
                title={`Commenting as ${currentUserAlias}`}
              >
                {currentUserAlias.charAt(0)}
              </div>

              {/* Textarea */}
              <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => {
                  setText(e.target.value);
                  if (enhancedComment) setEnhancedComment(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                    handleAdd();
                  }
                }}
                maxLength={500}
                placeholder={
                  replyingTo
                    ? `Reply to @${replyingTo.author}…`
                    : 'Share supportive thoughts or genuine advice… (Ctrl+Enter to post)'
                }
                className="w-full resize-none bg-transparent text-xs text-vw-text placeholder-vw-textMuted focus:outline-none"
                rows={2}
              />
            </div>

            {/* AI Enhancement / Safety Advisory for Comment */}
            {enhancedComment && (
              <div
                className={`mt-2 rounded-xl border p-2.5 text-xs animate-fade-in space-y-1.5 ${
                  enhancedComment.unsafeInput
                    ? 'border-amber-300 bg-amber-50/90 dark:border-amber-900/60 dark:bg-amber-950/40'
                    : 'border-violet-200 bg-violet-50/80 dark:border-violet-900/50 dark:bg-violet-950/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`font-bold text-[11px] flex items-center gap-1 ${
                      enhancedComment.unsafeInput
                        ? 'text-amber-800 dark:text-amber-300'
                        : 'text-violet-900 dark:text-violet-200'
                    }`}
                  >
                    {enhancedComment.unsafeInput ? '🛡️ Safe Alternative' : '✨ AI Polished'}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setText(enhancedComment.polishedText);
                        setEnhancedComment(null);
                      }}
                      className="rounded-md bg-violet-600 px-2 py-0.5 text-[10px] font-bold text-white transition hover:bg-violet-700"
                    >
                      Apply ✓
                    </button>
                    <button
                      type="button"
                      onClick={() => setEnhancedComment(null)}
                      className="text-gray-400 hover:text-gray-600 text-xs px-1"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {enhancedComment.unsafeInput && (
                  <p className="text-[10px] text-amber-900 dark:text-amber-200 font-medium">
                    {enhancedComment.safetyNotice ||
                      'Comment contained harsh language. Use safe phrasing to avoid penalties.'}
                  </p>
                )}

                <p className="text-gray-800 dark:text-gray-200 italic bg-white/80 dark:bg-zinc-900/60 p-2 rounded-lg border border-vw-border/70 text-[11px]">
                  "{enhancedComment.polishedText}"
                </p>
              </div>
            )}

            {/* Composer Bottom Toolbar */}
            <div className="mt-2.5 flex items-center justify-between border-t border-vw-border/50 pt-2 text-[11px]">
              <div className="flex items-center gap-2 text-vw-textMuted">
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  <span>🛡️</span> AI Moderated
                </span>
                <span className="text-[10px] font-mono">
                  {text.length}/500
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePolishComment}
                  disabled={polishingComment || !text.trim()}
                  className="flex items-center gap-1 rounded-lg bg-violet-50 px-2 py-1 text-[11px] font-semibold text-violet-700 transition hover:bg-violet-100 disabled:opacity-40 dark:bg-violet-950/40 dark:text-violet-300"
                  title="AI polish comment for constructive tone"
                >
                  <span>{polishingComment ? 'Polishing…' : '✨ AI Polish'}</span>
                </button>

                {replyingTo && (
                  <button
                    type="button"
                    onClick={handleCancelReply}
                    className="rounded-xl px-2.5 py-1 font-semibold text-vw-textMuted hover:text-vw-text transition"
                  >
                    Cancel
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={submitting || !text.trim()}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-3.5 py-1.5 font-bold text-white shadow-xs transition hover:brightness-110 active:scale-95 disabled:opacity-40"
                >
                  {submitting ? (
                    <span>Posting…</span>
                  ) : (
                    <>
                      <span>{replyingTo ? 'Reply' : 'Respond'}</span>
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Guest Banner */
        <div className="rounded-2xl border border-vw-border bg-vw-surface/60 p-4 text-center">
          <p className="text-xs text-vw-textMuted mb-2">
            Log in anonymously to post responses and support your peers.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 rounded-xl bg-violet-600 px-4 py-1.5 text-xs font-bold text-white shadow-2xs transition hover:bg-violet-700"
          >
            Log In to Respond
          </Link>
        </div>
      )}
    </div>
  );
}
