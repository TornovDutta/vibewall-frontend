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

export default function ConfessionCard({ confession, isOwned, onUpdate, onDelete }: Props) {
  const { user } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(confession.content);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [showReport, setShowReport] = useState(false);

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
    <article className="animate-slide-up rounded-xl border border-vw-border bg-vw-card p-5 transition hover:border-white/10">
      {/* Content */}
      {editing ? (
        <div className="space-y-3">
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="w-full resize-none rounded-lg border border-vw-border bg-vw-surface px-3 py-2 text-sm text-white focus:border-violet-500 focus:outline-none"
            rows={4}
          />
          {error && <p className="text-xs text-red-400">{error}</p>}
          <div className="flex gap-2">
            <button
              onClick={handleUpdate}
              disabled={submitting}
              className="rounded-lg bg-violet-600 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-violet-700 disabled:opacity-50"
            >
              {submitting ? 'Saving…' : 'Save'}
            </button>
            <button
              onClick={() => { setEditing(false); setEditText(confession.content); }}
              className="rounded-lg border border-vw-border px-4 py-1.5 text-sm text-gray-400 transition hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="text-base leading-relaxed text-gray-100">{confession.content}</p>
      )}

      {/* Actions bar */}
      {!editing && (
        <div className="mt-4 flex items-center gap-3 border-t border-vw-border pt-3">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 text-xs text-gray-500 transition hover:text-violet-400"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-3 3-3-3z" />
            </svg>
            {confession.feedbacks.length} {confession.feedbacks.length === 1 ? 'response' : 'responses'}
          </button>

          <div className="ml-auto flex items-center gap-2">
            {user && !isOwned && (
              <button
                onClick={() => setShowReport(true)}
                className="text-xs text-gray-600 transition hover:text-amber-400"
              >
                Report
              </button>
            )}
            {isOwned && (
              <>
                <button
                  onClick={() => setEditing(true)}
                  className="text-xs text-gray-500 transition hover:text-violet-400"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  disabled={submitting}
                  className="text-xs text-gray-500 transition hover:text-red-400 disabled:opacity-40"
                >
                  Delete
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Expandable feedback section */}
      {expanded && (
        <div className="mt-4 border-t border-vw-border pt-4">
          <FeedbackSection
            confession={confession}
            onUpdate={onUpdate}
          />
        </div>
      )}

      {showReport && (
        <ReportModal
          context={`Confession ID: ${confession.id}\nContent: ${confession.content}`}
          onClose={() => setShowReport(false)}
        />
      )}
    </article>
  );
}
