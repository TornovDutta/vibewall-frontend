import { useState } from 'react';
import { feedbackApi } from '../api/feedback';
import { useAuth } from '../context/AuthContext';
import { triggerNotificationRefresh } from '../utils/events';
import type { ConfessionResponse, FeedbackItem, OwnedFeedback } from '../types';

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

interface Props {
  confession: ConfessionResponse;
  onUpdate: (updated: ConfessionResponse) => void;
}

export default function FeedbackSection({ confession, onUpdate }: Props) {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [likingId, setLikingId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const ownedFeedbacks = getOwnedFeedbacks();
  const isOwned = (fb: FeedbackItem) =>
    ownedFeedbacks.some(
      (o) => o.confessionId === confession.id && o.feedbackId === fb.id
    );

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

  async function handleAdd() {
    if (!text.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const updated = await feedbackApi.add(confession.id, { content: text.trim() });
      // Find newly added feedback (highest id not in old list)
      const oldIds = new Set(confession.feedbacks.map((f) => f.id));
      const newFb = updated.feedbacks.find((f) => !oldIds.has(f.id));
      if (newFb) saveOwnedFeedback({ confessionId: confession.id, feedbackId: newFb.id });
      onUpdate(updated);
      setText('');
      triggerNotificationRefresh();
    } catch (e: unknown) {
      const err = e as { response?: { data?: { msg?: string; message?: string; details?: string } } };
      setError(
        err?.response?.data?.message ??
        err?.response?.data?.details ??
        err?.response?.data?.msg ??
        'Failed to post feedback'
      );
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
      const err = e as { response?: { data?: { msg?: string } } };
      setError(err?.response?.data?.msg ?? 'Failed to update feedback');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(fb: FeedbackItem) {
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
      setError(err?.response?.data?.msg ?? 'Failed to delete feedback');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-3">
      {confession.feedbacks.length > 0 && (
        <div className="space-y-2">
          {confession.feedbacks.map((fb) => (
            <div
              key={fb.id}
              className="rounded-lg border border-vw-border bg-vw-bg/60 px-3 py-2"
            >
              {editingId === fb.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="w-full resize-none rounded-md border border-vw-border bg-vw-surface px-3 py-2 text-sm text-gray-900 focus:border-violet-500 focus:outline-none"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdate(fb)}
                      disabled={submitting}
                      className="rounded px-3 py-1 text-xs font-medium text-violet-400 transition hover:text-violet-300 disabled:opacity-50"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="rounded px-3 py-1 text-xs text-gray-500 transition hover:text-gray-800"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-gray-900">{fb.content}</p>
                  <div className="mt-2 flex items-center justify-between pt-1 border-t border-vw-border/40">
                    <button
                      onClick={() => handleLike(fb)}
                      disabled={likingId === fb.id || !user}
                      className={`flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs transition ${
                        user && fb.likedUserIds?.includes(user.id)
                          ? 'bg-rose-500/10 font-semibold text-rose-500'
                          : 'text-gray-500 hover:bg-rose-500/10 hover:text-rose-500'
                      }`}
                      title={user ? 'Like comment (+5 vibe points to author)' : 'Log in to like'}
                    >
                      <svg
                        className={`h-3.5 w-3.5 transition-transform ${
                          user && fb.likedUserIds?.includes(user.id) ? 'scale-110' : ''
                        }`}
                        fill={user && fb.likedUserIds?.includes(user.id) ? 'currentColor' : 'none'}
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
                      <span>{fb.likes ?? (fb.likedUserIds?.length ?? 0)}</span>
                    </button>

                    {user && isOwned(fb) && (
                      <div className="flex shrink-0 gap-2">
                        <button
                          onClick={() => {
                            setEditingId(fb.id);
                            setEditText(fb.content);
                          }}
                          className="text-xs text-gray-500 transition hover:text-violet-400"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(fb)}
                          disabled={submitting}
                          className="text-xs text-gray-500 transition hover:text-red-400"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {user && (
        <div className="space-y-2">
          {error && <p className="text-xs text-red-400">{error}</p>}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add a response…"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              className="min-w-0 flex-1 rounded-lg border border-vw-border bg-vw-surface px-3 py-1.5 text-sm text-gray-900 placeholder-gray-400 focus:border-violet-500 focus:outline-none"
            />
            <button
              onClick={handleAdd}
              disabled={submitting || !text.trim()}
              className="rounded-lg bg-violet-600/80 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-violet-600 disabled:opacity-40"
            >
              Post
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
