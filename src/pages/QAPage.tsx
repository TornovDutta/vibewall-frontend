import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { qaApi } from '../api/qa';
import { useAuth } from '../context/AuthContext';
import { generateAnonName } from '../utils/generateAnonName';
import AskQuestionModal from '../components/AskQuestionModal';
import ReplyQuestionModal from '../components/ReplyQuestionModal';
import QuestionCard from '../components/QuestionCard';
import LoadingSpinner from '../components/LoadingSpinner';
import type { QuestionResponse } from '../types';

export default function QAPage() {
  const { user } = useAuth();
  const { userId: routeUserId } = useParams<{ userId?: string }>();

  // Determine wall target
  // If route has userId, view that user's wall; otherwise view current logged-in user's wall / community
  const targetUserId = routeUserId || user?.id || '';
  const isOwner = user?.id === targetUserId;
  const isDirectWall = !!routeUserId;

  const [activeTab, setActiveTab] = useState<'community' | 'public' | 'inbox' | 'private' | 'my-asked'>(
    isDirectWall ? 'public' : 'community'
  );

  const [questions, setQuestions] = useState<QuestionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Modals state
  const [showAskModal, setShowAskModal] = useState(false);
  const [replyingQuestion, setReplyingQuestion] = useState<QuestionResponse | null>(null);

  const wallAlias = targetUserId ? generateAnonName(targetUserId) : 'Wall Owner';

  // Load questions based on active tab
  const loadQuestions = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      if (activeTab === 'community') {
        const data = await qaApi.getFeedQuestions();
        setQuestions(data);
      } else if (activeTab === 'public') {
        if (!targetUserId) {
          setQuestions([]);
        } else {
          const data = await qaApi.getPublicWall(targetUserId);
          setQuestions(data);
        }
      } else if (activeTab === 'inbox') {
        const data = await qaApi.getInbox('PENDING');
        setQuestions(data);
      } else if (activeTab === 'private') {
        const data = await qaApi.getInbox();
        setQuestions(data.filter((q) => q.status === 'ANSWERED' && !q.isPublic));
      } else if (activeTab === 'my-asked') {
        const data = await qaApi.getMyAsked();
        setQuestions(data);
      }
    } catch {
      setError('Failed to load questions. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [targetUserId, activeTab]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  const handleCopyWallLink = () => {
    const url = `${window.location.origin}/wall/${targetUserId || user?.id}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleQuestionAsked = (newQ: QuestionResponse) => {
    setQuestions((prev) => [newQ, ...prev]);
  };

  const handleQuestionReplied = (updated: QuestionResponse) => {
    if (activeTab === 'inbox') {
      // Remove from pending inbox once replied
      setQuestions((prev) => prev.filter((q) => q.id !== updated.id));
    } else {
      setQuestions((prev) => prev.map((q) => (q.id === updated.id ? updated : q)));
    }
  };

  const handleQuestionDeleted = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  return (
    <div className="min-h-screen bg-vw-bg py-8 px-4 sm:px-6">
      <div className="mx-auto max-w-4xl space-y-6">

        {/* ── Wall Hero Header ── */}
        <div className="relative overflow-hidden rounded-3xl border border-vw-border bg-vw-surface p-6 sm:p-8 shadow-sm">
          {/* Subtle gradient background glow */}
          <div className="pointer-events-none absolute -top-12 -right-12 h-44 w-44 rounded-full bg-gradient-to-br from-violet-500/15 via-fuchsia-500/15 to-transparent blur-2xl" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative z-10">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 text-2xl font-black text-white shadow-md">
                {isDirectWall ? wallAlias.charAt(0) : '❓'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-vw-text">
                    {isDirectWall ? `${wallAlias}'s Q&A Wall` : 'Anonymous Q&A'}
                  </h1>
                  {isDirectWall && isOwner && (
                    <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold uppercase text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                      Your Wall
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-vw-textMuted flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Accepting Anonymous & Identified Questions · Public or Private Replies
                </p>
              </div>
            </div>

            {/* Quick Action CTAs */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleCopyWallLink}
                className="flex items-center gap-1.5 rounded-full border border-vw-border bg-vw-card px-3.5 py-2 text-xs font-semibold text-vw-text transition hover:bg-vw-muted/60"
              >
                <span>{copiedLink ? '✓' : '🔗'}</span>
                <span>{copiedLink ? 'Link Copied!' : 'Share Wall Link'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowAskModal(true)}
                className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:opacity-95 active:scale-95"
              >
                <span>❓</span>
                <span>{isDirectWall ? `Ask ${wallAlias}` : 'Ask Community'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── Navigation Tabs ── */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-vw-border pb-3">
          <div className="flex flex-wrap items-center gap-1.5 rounded-full border border-vw-border bg-vw-surface p-1 shadow-2xs">
            {/* Community Feed Tab */}
            <button
              type="button"
              onClick={() => setActiveTab('community')}
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                activeTab === 'community'
                  ? 'bg-violet-600 text-white shadow-xs'
                  : 'text-vw-textMuted hover:text-vw-text'
              }`}
            >
              <span>🌐 Community Q&A</span>
            </button>

            {/* Public Answered Questions Tab */}
            {isDirectWall && (
              <button
                type="button"
                onClick={() => setActiveTab('public')}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                  activeTab === 'public'
                    ? 'bg-violet-600 text-white shadow-xs'
                    : 'text-vw-textMuted hover:text-vw-text'
                }`}
              >
                <span>👤 Wall Answers</span>
              </button>
            )}

            {/* Owner Inbox Tab (Only if owner) */}
            {user && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveTab('inbox')}
                  className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                    activeTab === 'inbox'
                      ? 'bg-violet-600 text-white shadow-xs'
                      : 'text-vw-textMuted hover:text-vw-text'
                  }`}
                >
                  <span>📥 Pending Inbox</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('private')}
                  className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                    activeTab === 'private'
                      ? 'bg-violet-600 text-white shadow-xs'
                      : 'text-vw-textMuted hover:text-vw-text'
                  }`}
                >
                  <span>🔒 Private Replies</span>
                </button>
              </>
            )}

            {/* Questions Asked by Current User */}
            {user && (
              <button
                type="button"
                onClick={() => setActiveTab('my-asked')}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                  activeTab === 'my-asked'
                    ? 'bg-violet-600 text-white shadow-xs'
                    : 'text-vw-textMuted hover:text-vw-text'
                }`}
              >
                <span>📤 Asked by Me</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={loadQuestions}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs font-semibold text-vw-textMuted transition hover:text-violet-600 disabled:opacity-40"
          >
            <svg className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>Refresh</span>
          </button>
        </div>

        {/* ── Content Stream ── */}
        {loading ? (
          <LoadingSpinner />
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-xs text-red-600 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
            {error}
            <button onClick={loadQuestions} className="ml-2 font-semibold underline">Retry</button>
          </div>
        ) : questions.length === 0 ? (
          <div className="rounded-3xl border border-vw-border bg-vw-card p-12 text-center shadow-2xs">
            <div className="mb-4 flex justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-2xl dark:bg-violet-950/50">
                {activeTab === 'inbox' ? '📭' : activeTab === 'my-asked' ? '📤' : '❓'}
              </div>
            </div>
            <p className="text-base font-bold text-vw-text">
              {activeTab === 'inbox'
                ? 'Your inbox is empty'
                : activeTab === 'my-asked'
                ? "You haven't asked any questions yet"
                : activeTab === 'private'
                ? 'No private Q&As yet'
                : 'No questions here yet'}
            </p>
            <p className="mt-1 text-xs text-vw-textMuted max-w-sm mx-auto">
              {activeTab === 'inbox'
                ? 'Share your wall link to receive anonymous or named questions from anyone!'
                : activeTab === 'my-asked'
                ? 'Ask a question to any wall or post a question to the community.'
                : 'Be the first to ask a question anonymously or with your alias.'}
            </p>
            <div className="mt-5 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setShowAskModal(true)}
                className="rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:opacity-90"
              >
                + Ask Question
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((q) => (
              <QuestionCard
                key={q.id}
                question={q}
                isOwner={isOwner || user?.id === q.targetUserId}
                onReplyClick={(selected) => setReplyingQuestion(selected)}
                onDelete={handleQuestionDeleted}
              />
            ))}
          </div>
        )}

      </div>

      {/* Ask Question Modal */}
      <AskQuestionModal
        isOpen={showAskModal}
        targetUserId={isDirectWall ? targetUserId : 'community'}
        targetAlias={isDirectWall ? wallAlias : 'the Community'}
        onClose={() => setShowAskModal(false)}
        onAsked={handleQuestionAsked}
      />

      {/* Reply Question Modal */}
      <ReplyQuestionModal
        isOpen={!!replyingQuestion}
        question={replyingQuestion}
        onClose={() => setReplyingQuestion(null)}
        onReplied={handleQuestionReplied}
      />
    </div>
  );
}
