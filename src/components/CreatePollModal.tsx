import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { pollsApi } from '../api/polls';
import { aiApi } from '../api/ai';
import { vibesApi, type VibeCheckResult } from '../api/vibes';
import { useAuth } from '../context/AuthContext';
import { triggerNotificationRefresh } from '../utils/events';
import type { PollResponse, EnhanceResponse } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (poll: PollResponse) => void;
}

const CATEGORIES = ['General', 'Relationships', 'Hot Takes', 'Life', 'Career', 'Mental Health'];

export default function CreatePollModal({ isOpen, onClose, onCreated }: Props) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [question, setQuestion] = useState('');
  const [category, setCategory] = useState('General');
  const [options, setOptions] = useState<string[]>(['', '']);
  const [submitting, setSubmitting] = useState(false);
  const [polishing, setPolishing] = useState(false);
  const [checkingVibe, setCheckingVibe] = useState(false);
  const [vibeResult, setVibeResult] = useState<VibeCheckResult | null>(null);
  const [enhancedResult, setEnhancedResult] = useState<EnhanceResponse | null>(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handlePolish = async () => {
    if (!question.trim()) {
      setError('Please type your poll question or topic first.');
      return;
    }
    if (polishing) return;
    setPolishing(true);
    setError('');
    try {
      const res = await aiApi.enhance({ text: question.trim(), type: 'POLL' });
      setEnhancedResult(res);
    } catch {
      setError('AI enhancement unavailable right now.');
    } finally {
      setPolishing(false);
    }
  };

  const handleCheckVibe = async () => {
    if (!question.trim()) {
      setError('Please type your poll question first to check its vibe.');
      return;
    }
    if (checkingVibe) return;
    setCheckingVibe(true);
    setError('');
    try {
      const res = await vibesApi.checkVibe(question.trim());
      setVibeResult(res);
    } catch {
      setError('Could not check vibe. Please try again.');
    } finally {
      setCheckingVibe(false);
    }
  };

  const handleApplyFullEnhancement = () => {
    if (!enhancedResult) return;
    setQuestion(enhancedResult.polishedText);
    if (enhancedResult.suggestedOptions && enhancedResult.suggestedOptions.length >= 2) {
      setOptions(enhancedResult.suggestedOptions.slice(0, 6));
    }
    setEnhancedResult(null);
  };

  const handleAddOption = () => {
    if (options.length < 6) {
      setOptions([...options, '']);
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }

    if (question.trim().length < 5) {
      setError('Poll question must be at least 5 characters long.');
      return;
    }

    const filteredOptions = options.map((o) => o.trim()).filter(Boolean);
    if (filteredOptions.length < 2) {
      setError('Please provide at least two valid options.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const created = await pollsApi.createPoll({
        question: question.trim(),
        options: filteredOptions,
        category,
      });
      onCreated(created);
      triggerNotificationRefresh();
      onClose();
    } catch (err: unknown) {
      const e = err as { response?: { status?: number; data?: { details?: string; msg?: string; message?: string } } };
      const status = e?.response?.status;
      const msg =
        e?.response?.data?.details ||
        e?.response?.data?.msg ||
        e?.response?.data?.message ||
        'Failed to create poll. Please try again.';

      if (
        status === 422 ||
        msg.toLowerCase().includes('safety guidelines') ||
        msg.toLowerCase().includes('violat') ||
        msg.toLowerCase().includes('flagged by ai')
      ) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-lg rounded-2xl border border-vw-border bg-vw-card shadow-2xl overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-vw-border px-6 py-4 bg-gradient-to-r from-violet-600/10 via-fuchsia-600/10 to-transparent">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/20 text-violet-500 font-bold text-lg">
              🗳️
            </span>
            <div>
              <h2 className="text-base font-bold text-vw-text">Create an Anonymous Poll</h2>
              <p className="text-xs text-vw-textMuted">Ask the community and get live opinion results.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-vw-textMuted hover:bg-vw-muted hover:text-vw-text transition"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {!user && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300 flex items-center justify-between">
              <span>You must be logged in to create a poll.</span>
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="font-bold underline ml-2 hover:opacity-80"
              >
                Log In →
              </button>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-600 dark:border-rose-900/50 dark:bg-rose-950/40 dark:text-rose-300">
              {error}
            </div>
          )}

          {/* Question Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-vw-text">
                Poll Question
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handlePolish}
                  disabled={polishing || !question.trim()}
                  className="flex items-center gap-1 rounded-lg bg-violet-50 px-2 py-1 text-xs font-semibold text-violet-700 transition hover:bg-violet-100 disabled:opacity-40 dark:bg-violet-950/40 dark:text-violet-300"
                >
                  <span>{polishing ? 'Generating…' : '✨ AI Polish'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleCheckVibe}
                  disabled={checkingVibe || !question.trim()}
                  className="flex items-center gap-1 rounded-lg border border-vw-border px-2 py-1 text-xs font-semibold text-gray-600 transition hover:bg-vw-muted disabled:opacity-40 dark:text-gray-300"
                >
                  <span>{checkingVibe ? 'Analyzing…' : '🎯 Vibe Check'}</span>
                </button>
              </div>
            </div>
            <textarea
              rows={2}
              value={question}
              onChange={(e) => {
                setQuestion(e.target.value);
                if (enhancedResult) setEnhancedResult(null);
                if (vibeResult) setVibeResult(null);
              }}
              placeholder="e.g. Is it healthy to stay friends with an ex?"
              maxLength={250}
              className="w-full rounded-xl border border-vw-border bg-vw-surface px-3.5 py-2.5 text-sm text-vw-text placeholder-vw-textMuted/60 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            />
            <span className="mt-1 block text-right text-[11px] text-vw-textMuted">
              {question.length}/250
            </span>

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

            {/* AI Enhancement Box */}
            {enhancedResult && (
              <div
                className={`mt-2.5 rounded-2xl border p-4 text-xs animate-fade-in shadow-xs space-y-2.5 ${
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
                    {enhancedResult.unsafeInput ? '🛡️ Safe Alternative Poll' : '✨ AI Suggested Poll'}
                  </span>
                  <button
                    type="button"
                    onClick={handleApplyFullEnhancement}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-bold text-white shadow-xs transition active:scale-95 ${
                      enhancedResult.unsafeInput
                        ? 'bg-emerald-600 hover:bg-emerald-700'
                        : 'bg-violet-600 hover:bg-violet-700'
                    }`}
                  >
                    {enhancedResult.unsafeInput ? 'Use Safe Poll ✓' : 'Apply Question & Options ✓'}
                  </button>
                </div>

                {enhancedResult.unsafeInput && (
                  <div className="space-y-1">
                    <p className="text-[11px] text-amber-900/90 dark:text-amber-200/90 font-medium leading-relaxed">
                      {enhancedResult.safetyNotice ||
                        'Your draft contained aggressive language that violates community rules. Here is a constructive alternative poll:'}
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

                <p className="text-gray-800 dark:text-gray-200 italic bg-white/90 dark:bg-zinc-900/80 p-2.5 rounded-xl border border-vw-border/80">
                  "{enhancedResult.polishedText}"
                </p>

                {enhancedResult.suggestedOptions && enhancedResult.suggestedOptions.length > 0 && (
                  <div>
                    <p className="text-[11px] font-semibold text-vw-text mb-1">
                      Suggested Options:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {enhancedResult.suggestedOptions.map((opt, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            if (!options.includes(opt) && options.length < 6) {
                              setOptions([...options.filter(Boolean), opt]);
                            }
                          }}
                          className="rounded-lg border border-vw-border bg-white px-2 py-0.5 text-[11px] text-violet-700 hover:bg-violet-50 dark:bg-zinc-900 dark:text-violet-300"
                        >
                          + {opt}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {enhancedResult.suggestions && enhancedResult.suggestions.length > 0 && (
                  <p className="text-[11px] text-vw-textMuted pt-1">
                    💡 {enhancedResult.suggestions[0]}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-semibold text-vw-text mb-1.5">
              Category
            </label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                    category === cat
                      ? 'bg-violet-600 text-white shadow-xs'
                      : 'border border-vw-border bg-vw-surface text-vw-textMuted hover:border-violet-300 hover:text-vw-text'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Options Management */}
          <div>
            <label className="block text-xs font-semibold text-vw-text mb-1.5">
              Options (2 to 6)
            </label>
            <div className="space-y-2">
              {options.map((opt, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-vw-muted text-[11px] font-bold text-vw-textMuted">
                    {i + 1}
                  </span>
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => handleOptionChange(i, e.target.value)}
                    placeholder={`Option ${i + 1}`}
                    maxLength={100}
                    className="flex-1 rounded-xl border border-vw-border bg-vw-surface px-3 py-2 text-xs sm:text-sm text-vw-text placeholder-vw-textMuted/60 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(i)}
                      title="Remove option"
                      className="p-1.5 text-vw-textMuted hover:text-rose-500 transition"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>

            {options.length < 6 && (
              <button
                type="button"
                onClick={handleAddOption}
                className="mt-2.5 flex items-center gap-1.5 text-xs font-semibold text-violet-600 hover:text-violet-700 dark:text-violet-400"
              >
                <span>+</span>
                <span>Add Option</span>
              </button>
            )}
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-vw-border">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-xl px-4 py-2 text-xs font-semibold text-vw-textMuted hover:bg-vw-muted hover:text-vw-text transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 px-5 py-2 text-xs font-bold text-white shadow-md shadow-violet-500/20 transition hover:opacity-95 disabled:opacity-50"
            >
              {submitting ? 'Launching...' : 'Launch Poll 🗳️'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
