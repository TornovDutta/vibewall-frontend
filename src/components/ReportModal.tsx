import { useState } from 'react';
import { reportsApi } from '../api/reports';
import type { OwnedReport } from '../types';

const OWNED_REPORTS_KEY = 'vw_owned_reports';

function saveOwnedReport(item: OwnedReport) {
  try {
    const existing: OwnedReport[] = JSON.parse(localStorage.getItem(OWNED_REPORTS_KEY) ?? '[]');
    localStorage.setItem(OWNED_REPORTS_KEY, JSON.stringify([...existing, item]));
  } catch {
    // ignore
  }
}

interface Props {
  context?: string;
  onClose: () => void;
}

export default function ReportModal({ context = '', onClose }: Props) {
  const [text, setText] = useState(context ? `I'm reporting this content:\n\n${context}\n\nReason: ` : '');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit() {
    if (!text.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const report = await reportsApi.submit({ content: text.trim() });
      saveOwnedReport({ id: report.id, content: text.trim(), createdAt: new Date().toISOString() });
      setSuccess(true);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { msg?: string } } };
      setError(err?.response?.data?.msg ?? 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md animate-fade-in rounded-2xl border border-vw-border bg-vw-card p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Submit Report</h2>
          <button onClick={onClose} className="text-gray-500 transition hover:text-white">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {success ? (
          <div className="text-center py-6">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20">
              <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm text-gray-300">Report submitted. Our team will review it.</p>
            <button
              onClick={onClose}
              className="mt-4 rounded-lg bg-violet-600 px-4 py-2 text-sm text-white transition hover:bg-violet-700"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-400">
              Describe what violates our community guidelines.
            </p>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Describe the issue…"
              className="w-full resize-none rounded-lg border border-vw-border bg-vw-surface px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-violet-500 focus:outline-none"
              rows={5}
            />
            {error && <p className="text-xs text-red-400">{error}</p>}
            <div className="flex gap-2">
              <button
                onClick={handleSubmit}
                disabled={submitting || !text.trim()}
                className="flex-1 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-40"
              >
                {submitting ? 'Submitting…' : 'Submit Report'}
              </button>
              <button
                onClick={onClose}
                className="rounded-lg border border-vw-border px-4 text-sm text-gray-400 transition hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
