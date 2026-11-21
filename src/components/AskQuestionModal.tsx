import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { qaApi } from '../api/qa';
import { aiApi } from '../api/ai';
import { vibesApi, type VibeCheckResult } from '../api/vibes';
import { triggerNotificationRefresh } from '../utils/events';
import { generateAnonName } from '../utils/generateAnonName';
import type { QuestionResponse, EnhanceResponse } from '../types';

interface Props {
  isOpen: boolean;
  targetUserId: string;
  targetAlias?: string;
  onClose: () => void;
  onAsked?: (q: QuestionResponse) => void;
}

export default function AskQuestionModal({
  isOpen,
  targetUserId,
  targetAlias,
  onClose,
  onAsked,
}: Props) {
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [polishing, setPolishing] = useState(false);
  const [checkingVibe, setCheckingVibe] = useState(false);
  const [vibeResult, setVibeResult] = useState<VibeCheckResult | null>(null);
  const [enhancedResult, setEnhancedResult] = useState<EnhanceResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const isCommunity = !targetUserId || targetUserId === 'community';
  const wallName = targetAlias || (isCommunity ? 'the Community' : (targetUserId ? generateAnonName(targetUserId) : 'the Community'));

  const handlePolish = async () => {
    if (!content.trim()) {
      setError('Please type your question first to get AI enhancements.');
      return;
    }
    if (polishing) return;
    setPolishing(true);
    setError('');
    try {
      const res = await aiApi.enhance({ text: content.trim(), type: 'QUESTION' });
      setEnhancedResult(res);
    } catch {
      setError('AI enhancement unavailable right now.');
    } finally {
      setPolishing(false);
    }
  };

  const handleCheckVibe = async () => {
    if (!content.trim()) {
      setError('Please type your question first to analyze its vibe.');
      return;
    }
    if (checkingVibe) return;
    setCheckingVibe(true);
    setError('');
    try {
      const res = await vibesApi.checkVibe(content.trim());
      setVibeResult(res);
    } catch {
      setError('Could not check vibe. Please try again.');
    } finally {
      setCheckingVibe(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      setError('Please type your question.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const payload = {
        content: content.trim(),
        anonymous: true,
      };

      const created = await qaApi.askQuestion(targetUserId, payload);
      triggerNotificationRefresh();

      if (onAsked) onAsked(created);
      setContent('');
      setEnhancedResult(null);
      setVibeResult(null);
      onClose();
    } catch (err: unknown) {
      const e = err as { response?: { status?: number; data?: { details?: string; msg?: string; message?: string } } };
      const status = e?.response?.status;
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.msg ||
        e?.response?.data?.details ||
        'Failed to send question. Please check content safety.';

      const isSafetyViolation =
        status === 422 ||
        /unsafe|guideline|hateful|harassment|violation|prohibited|rules|harmful/i.test(msg);

      if (isSafetyViolation) {
        onClose();
        navigate(`/rules?violation=true&reason=${encodeURIComponent(msg)}`);
        return;
      }

      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-vw-border bg-vw-surface shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-vw-border p-5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-violet-100 text-lg dark:bg-violet-950/50">
              ❓
            </span>
            <div>
              <h3 className="text-sm font-bold text-vw-text">Ask {wallName}</h3>
              <p className="text-[11px] text-vw-textMuted">100% Anonymous Q&A</p>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-600 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
              {error}
            </div>
          )}

          {/* Question Textarea */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-vw-text">
                Your Question
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handlePolish}
                  disabled={polishing || !content.trim()}
                  className="flex items-center gap-1 rounded-lg bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-700 transition hover:bg-violet-100 disabled:opacity-40 dark:bg-violet-950/40 dark:text-violet-300"
                >
                  <span>{polishing ? 'Polishing…' : '✨ AI Polish'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleCheckVibe}
                  disabled={checkingVibe || !content.trim()}
                  className="flex items-center gap-1 rounded-lg border border-vw-border px-2.5 py-1 text-xs font-semibold text-gray-600 transition hover:bg-vw-muted disabled:opacity-40 dark:text-gray-300"
                >
                  <span>{checkingVibe ? 'Analyzing…' : '🎯 Vibe Check'}</span>
                </button>
              </div>
            </div>
            <textarea
              rows={4}
              maxLength={500}
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                if (enhancedResult) setEnhancedResult(null);
                if (vibeResult) setVibeResult(null);
              }}
              placeholder={`Ask ${wallName} anything... Your question is completely anonymous.`}
              className="w-full resize-none rounded-xl border border-vw-border bg-vw-card p-3 text-xs text-vw-text leading-relaxed placeholder:text-vw-textMuted/60 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
              autoFocus
            />
            <div className="mt-1 flex items-center justify-between text-[11px] text-vw-textMuted">
              <span>AI moderated for community safety</span>
              <span>{content.length}/500</span>
            </div>

            {/* AI Enhancement / Safety Advisory Box */}
            {enhancedResult && (
              <div
                className={`mt-2.5 rounded-xl border p-3.5 text-xs animate-fade-in space-y-2.5 ${
                  enhancedResult.unsafeInput
                    ? 'border-amber-300 bg-amber-50/90 dark:border-amber-900/60 dark:bg-amber-950/40'
                    : 'border-violet-200 bg-violet-50/80 dark:border-violet-900/50 dark:bg-violet-950/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`font-bold flex items-center gap-1.5 ${
                      enhancedResult.unsafeInput
                        ? 'text-amber-800 dark:text-amber-300'
                        : 'text-violet-900 dark:text-violet-200'
                    }`}
                  >
                    {enhancedResult.unsafeInput ? '🛡️ Safe Alternative Question' : '✨ AI Polished Question'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setContent(enhancedResult.polishedText);
                      setEnhancedResult(null);
                    }}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-bold text-white shadow-xs transition active:scale-95 ${
                      enhancedResult.unsafeInput
                        ? 'bg-emerald-600 hover:bg-emerald-700'
                        : 'bg-violet-600 hover:bg-violet-700'
                    }`}
                  >
                    {enhancedResult.unsafeInput ? 'Use Safe Question ✓' : 'Apply Question ✓'}
                  </button>
                </div>

                {enhancedResult.unsafeInput && (
                  <div className="space-y-1">
                    <p className="text-[11px] text-amber-900/90 dark:text-amber-200/90 font-medium leading-relaxed">
                      {enhancedResult.safetyNotice ||
                        'Your question contained words that violate community rules. AI generated respectful, non-insulting alternatives:'}
                    </p>
                    <Link
                      to="/rules"
                      target="_blank"
                      className="inline-block text-[10px] font-bold text-amber-800 dark:text-amber-300 underline underline-offset-2 hover:opacity-80"
                    >
                      Review Community Safety Rules &rarr;
                    </Link>
                  </div>
                )}

                <p className="text-gray-800 dark:text-gray-200 italic bg-white/80 dark:bg-zinc-900/60 p-2.5 rounded-lg border border-vw-border/70">
                  "{enhancedResult.polishedText}"
                </p>

                {enhancedResult.suggestions && enhancedResult.suggestions.length > 0 && (
                  <div className="space-y-1.5 pt-1">
                    <p className="text-[11px] font-bold text-vw-text">
                      {enhancedResult.unsafeInput
                        ? 'Or choose another safe question option:'
                        : 'Alternative question ideas:'}
                    </p>
                    <div className="space-y-1">
                      {enhancedResult.suggestions.map((s, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setContent(s);
                            setEnhancedResult(null);
                          }}
                          className="w-full text-left rounded-lg border border-vw-border/70 bg-white/80 dark:bg-zinc-900/60 p-2 text-[11px] text-gray-700 dark:text-gray-300 hover:border-violet-400 hover:bg-violet-50/50 dark:hover:bg-zinc-800 transition"
                        >
                          ✨ "{s}"
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Vibe Check Result Card */}
            {vibeResult && (
              <div className="mt-2.5 rounded-xl border border-violet-100 bg-violet-50/70 p-3 text-xs dark:border-zinc-800 dark:bg-zinc-800/60 animate-fade-in relative">
                <button
                  type="button"
                  onClick={() => setVibeResult(null)}
                  className="absolute top-2.5 right-2.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-xs"
                  title="Dismiss vibe check"
                >
                  ✕
                </button>
                <div className="flex items-center justify-between gap-2 pr-6">
                  <div className="flex items-center gap-1.5 font-semibold text-violet-900 dark:text-violet-200">
                    <span className="text-base">{vibeResult.emoji}</span>
                    <span>{vibeResult.vibe}</span>
                  </div>
                  <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-gray-600 shadow-xs dark:bg-zinc-900 dark:text-zinc-400">
                    {vibeResult.sentiment}
                  </span>
                </div>
                <p className="mt-1.5 text-gray-600 dark:text-zinc-300 pr-4">
                  💡 <span className="italic">{vibeResult.comfortingTip}</span>
                </p>
              </div>
            )}
          </div>

          {/* Anonymity Notice */}
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/20 p-3.5 flex items-center gap-3">
            <span className="text-xl">🕵️</span>
            <div>
              <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300">100% Anonymous Guarantee</p>
              <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80">
                Your real name, profile, and website identity are never shown to anyone. Only you can delete questions you ask.
              </p>
            </div>
          </div>

          {/* Submit & Cancel */}
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
              disabled={submitting || !content.trim()}
              className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-2 text-xs font-bold text-white shadow-sm shadow-violet-500/25 transition hover:opacity-95 disabled:opacity-50"
            >
              {submitting ? 'Sending…' : 'Send Anonymously'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
