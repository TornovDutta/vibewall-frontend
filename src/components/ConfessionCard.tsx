import { useState } from 'react';
import { confessionsApi } from '../api/confessions';
import { useAuth } from '../context/AuthContext';
import type { ConfessionResponse } from '../types';
import FeedbackSection from './FeedbackSection';
import ReportModal from './ReportModal';

interface Props {
  confession: ConfessionResponse;
  isOwned?: boolean;
  onUpdate: (updated: ConfessionResponse) => void;
  onDelete: (id: string) => void;
}

function hashColor(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (Math.imul(31, h) + id.charCodeAt(i)) | 0;
  const palette = [
    'from-violet-500 to-fuchsia-500',
    'from-blue-500 to-violet-500',
    'from-fuchsia-500 to-pink-500',
    'from-cyan-500 to-blue-500',
    'from-indigo-500 to-violet-500',
    'from-purple-500 to-pink-500',
  ];
  return palette[Math.abs(h) % palette.length];
}

export default function ConfessionCard({ confession, isOwned, onUpdate, onDelete }: Props) {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(confession.content);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showReport, setShowReport] = useState(false);

  const accentGradient = hashColor(confession.id);
  const responseCount = confession.feedbacks.length;

  async function handleUpdate() {
    if (!editText.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const updated = await confessionsApi.update(confession.id, { content: editText.trim() });
      onUpdate(updated);
      setEditing(false);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { msg?: string } } };
      setError(err?.response?.data?.msg ?? 'Failed to update');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this confession?')) return;
    setSubmitting(true);
    try {
      await confessionsApi.delete(confession.id);
      onDelete(confession.id);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { msg?: string } } };
      setError(err?.response?.data?.msg ?? 'Failed to delete');
      setSubmitting(false);
    }
  }

  return (
    <article className="animate-slide-up group relative overflow-hidden rounded-2xl border border-vw-border bg-vw-card transition-all duration-300 hover:border-violet-200 hover:shadow-xl hover:shadow-violet-500/10">
      {/* Gradient top accent bar */}
      <div className={`h-1 w-full bg-gradient-to-r ${accentGradient} opacity-60 group-hover:opacity-100 transition-opacity duration-300`} />

      {/* Subtle background glow for owned */}
      {isOwned && (
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-violet-50 via-transparent to-fuchsia-50" />
      )}

      <div className="relative p-5">
        {/* Header */}
        <div className="mb-4 flex items-center gap-3">
          {/* Avatar */}
          <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${accentGradient} text-xs font-extrabold text-white shadow-md`}>
            {isOwned ? 'Y' : '?'}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-800">
                {isOwned ? 'You' : 'Anonymous'}
              </span>
              {isOwned && (
                <span className="rounded-full border border-violet-200 bg-violet-100 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-violet-700">
                  Yours
                </span>
              )}
            </div>
            <p className="text-[10px] text-gray-700">shared anonymously</p>
          </div>

          {/* Response count badge */}
          {responseCount > 0 && (
            <div className="flex items-center gap-1 rounded-full border border-vw-border bg-vw-surface px-2.5 py-1">
              <svg className="h-3 w-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-3 3-3-3z" />
              </svg>
              <span className="text-[10px] font-semibold text-gray-500">{responseCount}</span>
            </div>
          )}
        </div>

        {/* Content */}
        {editing ? (
          <div className="space-y-3">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full resize-none rounded-xl border border-vw-border bg-vw-surface px-4 py-3 text-sm leading-relaxed text-gray-900 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500/30"
              rows={4}
              autoFocus
            />
            {error && <p className="text-xs text-red-400">{error}</p>}
            <div className="flex gap-2">
              <button
                onClick={handleUpdate}
                disabled={submitting}
                className="rounded-lg bg-violet-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-violet-700 disabled:opacity-50"
              >
                {submitting ? 'Saving…' : 'Save'}
              </button>
              <button
                onClick={() => { setEditing(false); setEditText(confession.content); }}
                className="rounded-lg border border-vw-border px-4 py-1.5 text-xs text-gray-700 transition hover:text-gray-900"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          /* Confession text with decorative quote */
          <div className="relative">
            <svg
              className="absolute -left-1 -top-2 h-8 w-8 text-violet-600/20 select-none"
              fill="currentColor"
              viewBox="0 0 32 32"
            >
              <path d="M10 8C6.686 8 4 10.686 4 14v10h10V14H7c0-1.654 1.346-3 3-3V8zm18 0c-3.314 0-6 2.686-6 6v10h10V14h-7c0-1.654 1.346-3 3-3V8z" />
            </svg>
            <p className="pl-6 text-[15px] leading-[1.75] text-gray-900 tracking-[-0.01em]">
              {confession.content}
            </p>
          </div>
        )}

        {/* Action bar */}
        {!editing && (
          <div className="mt-5 flex items-center gap-2 border-t border-vw-border/60 pt-3.5">
            {/* Respond button */}
            <button
              onClick={() => setExpanded(!expanded)}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-150 ${
                expanded
                  ? 'bg-violet-100 text-violet-700 border border-violet-200'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-violet-600'
              }`}
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-3 3-3-3z" />
              </svg>
              {responseCount === 0 ? 'Respond' : `${responseCount} ${responseCount === 1 ? 'response' : 'responses'}`}
            </button>

            <div className="ml-auto flex items-center gap-1">
              {user && !isOwned && (
                <button
                  onClick={() => setShowReport(true)}
                  className="rounded-lg px-2.5 py-1.5 text-xs text-gray-500 transition hover:bg-amber-50 hover:text-amber-600"
                >
                  Report
                </button>
              )}
              {isOwned && (
                <>
                  <button
                    onClick={() => setEditing(true)}
                    className="rounded-lg px-2.5 py-1.5 text-xs text-gray-500 transition hover:bg-violet-50 hover:text-violet-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={submitting}
                    className="rounded-lg px-2.5 py-1.5 text-xs text-gray-500 transition hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                  >
                    Delete
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Feedback panel */}
        {expanded && (
          <div className="mt-4 rounded-xl border border-vw-border bg-gray-50 p-4 shadow-inner">
            <FeedbackSection confession={confession} onUpdate={onUpdate} />
          </div>
        )}
      </div>

      {showReport && (
        <ReportModal
          context={`Confession ID: ${confession.id}\nContent: ${confession.content}`}
          onClose={() => setShowReport(false)}
        />
      )}
    </article>
  );
}
