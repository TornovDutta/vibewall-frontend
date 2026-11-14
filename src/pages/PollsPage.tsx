import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { pollsApi } from '../api/polls';
import { useAuth } from '../context/AuthContext';
import CreatePollModal from '../components/CreatePollModal';
import LoadingSpinner from '../components/LoadingSpinner';
import PollCard from '../components/PollCard';
import type { PollResponse } from '../types';

const CATEGORIES = ['All', 'General', 'Relationships', 'Hot Takes', 'Life', 'Career', 'Mental Health'];

export default function PollsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [polls, setPolls] = useState<PollResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  const loadPolls = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await pollsApi.getPolls();
      setPolls(data ?? []);
    } catch {
      setError('Failed to load polls. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPolls();
  }, [loadPolls]);

  const handleUpdate = (updated: PollResponse) => {
    setPolls((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handleDelete = (id: string) => {
    setPolls((prev) => prev.filter((p) => p.id !== id));
  };

  const handleCreated = (newPoll: PollResponse) => {
    setPolls((prev) => [newPoll, ...prev]);
  };

  // Filter logic
  const filteredPolls = polls.filter((p) => {
    const matchesCategory =
      selectedCategory === 'All' ||
      (p.category && p.category.toLowerCase() === selectedCategory.toLowerCase());
    const matchesSearch =
      !searchQuery.trim() ||
      p.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.options.some((o) => o.text.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const totalVotesAcrossAll = polls.reduce((acc, p) => acc + p.totalVotes, 0);

  return (
    <div className="min-h-screen bg-vw-bg pb-16">
      {/* ── Top Header Banner ── */}
      <div className="border-b border-vw-border bg-vw-surface/60 backdrop-blur-md">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:py-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700 dark:border-violet-900/50 dark:bg-violet-950/40 dark:text-violet-300 mb-2">
                <span className="h-2 w-2 rounded-full bg-violet-600 animate-pulse" />
                Live Community Voting
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-vw-text tracking-tight">
                Public Polls & Opinions
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-vw-textMuted max-w-xl">
                Vote anonymously on questions that matter, see real-time statistics, and launch your own polls.
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={loadPolls}
                disabled={loading}
                title="Refresh polls"
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-vw-border bg-vw-surface text-vw-textMuted transition hover:bg-vw-muted hover:text-vw-text"
              >
                <svg className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!user) {
                    navigate('/login');
                    return;
                  }
                  setShowCreate(true);
                }}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-violet-500/20 transition hover:opacity-95 active:scale-95"
              >
                <span>+</span>
                <span>Create Poll</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-vw-border/60 pt-4 text-xs text-vw-textMuted">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-vw-text">{polls.length}</span>
              <span>Active Polls</span>
            </div>
            <span className="text-vw-border">•</span>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-vw-text">{totalVotesAcrossAll}</span>
              <span>Total Votes Cast</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Filters & Search ── */}
      <div className="mx-auto max-w-5xl px-4 pt-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                  selectedCategory === cat
                    ? 'bg-violet-600 text-white shadow-xs'
                    : 'border border-vw-border bg-vw-surface text-vw-textMuted hover:border-violet-300 hover:text-vw-text'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search polls..."
              className="w-full rounded-xl border border-vw-border bg-vw-surface pl-8 pr-3 py-1.5 text-xs text-vw-text placeholder-vw-textMuted/60 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
            />
            <svg
              className="absolute left-2.5 top-2 h-3.5 w-3.5 text-vw-textMuted"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* ── Polls List / Feed ── */}
      <div className="mx-auto max-w-5xl px-4 pt-6">
        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center text-sm text-rose-600">
            {error}
            <button onClick={loadPolls} className="ml-2 font-semibold underline">
              Retry
            </button>
          </div>
        ) : filteredPolls.length === 0 ? (
          <div className="rounded-3xl border border-vw-border bg-vw-card p-12 text-center shadow-xs">
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-100 dark:bg-violet-950/40 text-3xl">
                🗳️
              </div>
            </div>
            <h3 className="text-base font-bold text-vw-text">No polls found</h3>
            <p className="mt-1 text-xs text-vw-textMuted max-w-sm mx-auto">
              {searchQuery || selectedCategory !== 'All'
                ? 'No polls match your current filters. Try selecting "All".'
                : 'Be the first to launch an anonymous opinion poll and see what the community thinks!'}
            </p>
            <button
              type="button"
              onClick={() => setShowCreate(true)}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:opacity-95"
            >
              <span>+</span>
              <span>Launch First Poll</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredPolls.map((poll) => (
              <PollCard
                key={poll.id}
                poll={poll}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <CreatePollModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onCreated={handleCreated}
      />
    </div>
  );
}
