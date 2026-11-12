import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { feedApi } from '../api/feed';
import { pollsApi } from '../api/polls';
import { statsApi, type PlatformStats } from '../api/vibes';
import ConfessionCard from '../components/ConfessionCard';
import PollCard from '../components/PollCard';
import DailyVibeCard from '../components/DailyVibeCard';
import LandingPage from './LandingPage';
import CreateConfessionModal, { getOwnedConfessionIds } from '../components/CreateConfessionModal';
import CreatePollModal from '../components/CreatePollModal';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import type { ConfessionResponse, PollResponse } from '../types';
import { generateAnonName } from '../utils/generateAnonName';

export default function FeedPage() {
  const { user } = useAuth();
  const anonName = user ? generateAnonName(user.id) : '';

  const [confessions, setConfessions] = useState<ConfessionResponse[]>([]);
  const [polls, setPolls] = useState<PollResponse[]>([]);
  const [stats, setStats] = useState<PlatformStats | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showCreate, setShowCreate] = useState(false);
  const [showCreatePoll, setShowCreatePoll] = useState(false);

  const [feedFilter, setFeedFilter] = useState<'all' | 'confessions' | 'polls'>('all');
  const [ownedIds, setOwnedIds] = useState<string[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [feedData, statsData, pollsData] = await Promise.allSettled([
        feedApi.getFeed(),
        statsApi.getSummary(),
        pollsApi.getPolls(),
      ]);

      if (feedData.status === 'fulfilled') {
        setConfessions(feedData.value ?? []);
      }
      if (statsData.status === 'fulfilled') {
        setStats(statsData.value);
      }
      if (pollsData.status === 'fulfilled') {
        setPolls(pollsData.value ?? []);
      }

      setOwnedIds(getOwnedConfessionIds());
    } catch {
      setError('Failed to load feed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  // Confession handlers
  function handleUpdate(updated: ConfessionResponse) {
    setConfessions((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  }

  function handleDelete(id: string) {
    setConfessions((prev) => prev.filter((c) => c.id !== id));
    setOwnedIds((prev) => prev.filter((i) => i !== id));
  }

  function handleCreated(c: ConfessionResponse) {
    setConfessions((prev) => [c, ...prev]);
    setOwnedIds((prev) => [c.id, ...prev]);
  }

  // Poll handlers
  function handlePollCreated(newPoll: PollResponse) {
    setPolls((prev) => [newPoll, ...prev]);
  }

  function handlePollUpdate(updated: PollResponse) {
    setPolls((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  }

  function handlePollDelete(id: string) {
    setPolls((prev) => prev.filter((p) => p.id !== id));
  }

  const myConfessionCount = ownedIds.length;
  const myResponseCount = confessions
    .filter((c) => ownedIds.includes(c.id))
    .reduce((sum, c) => sum + c.feedbacks.length, 0);
  const totalResponses = confessions.reduce((sum, c) => sum + c.feedbacks.length, 0);

  // Interleave confessions and polls for the unified feed stream
  const combinedFeedItems: Array<
    | { kind: 'confession'; id: string; data: ConfessionResponse }
    | { kind: 'poll'; id: string; data: PollResponse }
  > = [];

  if (feedFilter === 'confessions') {
    confessions.forEach((c) => combinedFeedItems.push({ kind: 'confession', id: c.id, data: c }));
  } else if (feedFilter === 'polls') {
    polls.forEach((p) => combinedFeedItems.push({ kind: 'poll', id: p.id, data: p }));
  } else {
    // Interleave: insert a poll every 2 confessions
    let cIdx = 0;
    let pIdx = 0;
    while (cIdx < confessions.length || pIdx < polls.length) {
      if (cIdx < confessions.length) {
        combinedFeedItems.push({ kind: 'confession', id: confessions[cIdx].id, data: confessions[cIdx++] });
      }
      if (cIdx < confessions.length) {
        combinedFeedItems.push({ kind: 'confession', id: confessions[cIdx].id, data: confessions[cIdx++] });
      }
      if (pIdx < polls.length) {
        combinedFeedItems.push({ kind: 'poll', id: polls[pIdx].id, data: polls[pIdx++] });
      }
      if (cIdx >= confessions.length && pIdx < polls.length) {
        combinedFeedItems.push({ kind: 'poll', id: polls[pIdx].id, data: polls[pIdx++] });
      }
    }
  }

  if (!user) {
    if (loading) return <LoadingSpinner />;
    return <LandingPage confessions={confessions} polls={polls} />;
  }

  return (
    <div className="min-h-screen bg-vw-bg">
      {/* ── Feed Action Sub-header ── */}
      <div className="border-b border-vw-border bg-vw-surface/60 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-2">
            <h1 className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 bg-clip-text text-sm font-extrabold text-transparent sm:text-base">
              Live Wall
            </h1>
            <span className="text-vw-muted hidden sm:inline">·</span>
            <span className="hidden text-xs text-vw-textMuted sm:inline">{anonName}</span>
          </div>

          {/* Quick Creation CTA Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCreatePoll(true)}
              className="flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50/70 px-3 py-1.5 text-xs font-semibold text-violet-700 transition hover:bg-violet-100 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-300"
            >
              <span>🗳️</span>
              <span className="hidden sm:inline">New</span> Poll
            </button>
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs shadow-violet-500/20 transition hover:opacity-95 active:scale-95"
            >
              <span>✍️</span>
              <span>Confess</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── 2-column body ── */}
      <div className="mx-auto max-w-5xl px-4 py-6 sm:py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

          {/* ── CENTER FEED STREAM (Spans 2 cols) ── */}
          <div className="lg:col-span-2 space-y-5">
            {/* Tagline banner */}
            <div className="flex items-center gap-2.5 rounded-2xl border border-vw-border bg-vw-card px-4 py-3.5 shadow-2xs">
              <span className="flex h-2 w-2 flex-shrink-0 rounded-full bg-violet-500 animate-pulse" />
              <p className="text-xs text-vw-text sm:text-sm">
                <span className="font-semibold text-vw-text">Anonymous thoughts & public polls.</span>
                {' '}AI-moderated.{' '}
                <span className="font-semibold text-violet-600 dark:text-violet-400">Ephemeral & safe.</span>
              </p>
            </div>

            {/* Filter Tabs & Refresh bar */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Segmented Filter Pills */}
              <div className="flex items-center gap-1 rounded-full border border-vw-border bg-vw-surface p-1 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setFeedFilter('all')}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition ${
                    feedFilter === 'all'
                      ? 'bg-violet-600 text-white shadow-xs'
                      : 'text-vw-textMuted hover:text-vw-text'
                  }`}
                >
                  <span>✨ All Vibes</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                      feedFilter === 'all' ? 'bg-white/20 text-white' : 'bg-vw-muted text-vw-textMuted'
                    }`}
                  >
                    {confessions.length + polls.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setFeedFilter('confessions')}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition ${
                    feedFilter === 'confessions'
                      ? 'bg-violet-600 text-white shadow-xs'
                      : 'text-vw-textMuted hover:text-vw-text'
                  }`}
                >
                  <span>💬 Confessions</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                      feedFilter === 'confessions' ? 'bg-white/20 text-white' : 'bg-vw-muted text-vw-textMuted'
                    }`}
                  >
                    {confessions.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setFeedFilter('polls')}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition ${
                    feedFilter === 'polls'
                      ? 'bg-violet-600 text-white shadow-xs'
                      : 'text-vw-textMuted hover:text-vw-text'
                  }`}
                >
                  <span>🗳️ Polls</span>
                  <span
                    className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                      feedFilter === 'polls' ? 'bg-white/20 text-white' : 'bg-vw-muted text-vw-textMuted'
                    }`}
                  >
                    {polls.length}
                  </span>
                </button>
              </div>

              {/* Refresh button */}
              <button
                type="button"
                onClick={load}
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

            {/* Stream Content */}
            {loading ? (
              <LoadingSpinner />
            ) : error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-600 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
                {error}
                <button onClick={load} className="ml-2 font-semibold underline">Retry</button>
              </div>
            ) : combinedFeedItems.length === 0 ? (
              /* Empty state */
              <div className="rounded-3xl border border-vw-border bg-vw-card p-10 text-center shadow-2xs">
                <div className="mb-4 flex justify-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-100 text-2xl dark:bg-violet-950/50">
                    {feedFilter === 'polls' ? '🗳️' : '💬'}
                  </div>
                </div>
                <p className="text-base font-bold text-vw-text">
                  {feedFilter === 'polls'
                    ? 'No live polls right now'
                    : feedFilter === 'confessions'
                    ? 'No live confessions right now'
                    : 'Nothing live on the wall right now'}
                </p>
                <p className="mt-1 text-xs text-vw-textMuted">
                  {feedFilter === 'polls'
                    ? 'Launch a community poll to gather anonymous votes and opinions.'
                    : 'Be the first to share an anonymous story or start a public vote.'}
                </p>
                <div className="mt-5 flex items-center justify-center gap-3">
                  <button
                    onClick={() => setShowCreatePoll(true)}
                    className="rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-xs font-semibold text-violet-700 transition hover:bg-violet-100 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-300"
                  >
                    + Create Poll
                  </button>
                  <button
                    onClick={() => setShowCreate(true)}
                    className="rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-5 py-2 text-xs font-bold text-white shadow-xs hover:opacity-90"
                  >
                    + Post Confession
                  </button>
                </div>
              </div>
            ) : (
              /* Feed Stream List */
              <div className="space-y-6">
                {combinedFeedItems.map((item) => {
                  if (item.kind === 'confession') {
                    return (
                      <ConfessionCard
                        key={`confession-${item.id}`}
                        confession={item.data}
                        isOwned={ownedIds.includes(item.id)}
                        onUpdate={handleUpdate}
                        onDelete={handleDelete}
                      />
                    );
                  }

                  // item.kind === 'poll'
                  return (
                    <div key={`poll-${item.id}`} className="space-y-1.5">
                      {feedFilter === 'all' && (
                        <div className="flex items-center gap-1.5 px-1 text-[11px] font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400">
                          <span>🗳️</span>
                          <span>Community Poll</span>
                        </div>
                      )}
                      <PollCard
                        poll={item.data}
                        onUpdate={handlePollUpdate}
                        onDelete={handlePollDelete}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── RIGHT SIDEBAR ── */}
          <aside className="space-y-5 lg:block">
            {/* Profile Summary Card */}
            <div className="rounded-2xl border border-vw-border bg-vw-card p-5 shadow-2xs">
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-xl font-black text-white shadow-xs">
                    {anonName[0]}
                  </div>
                  <span className="absolute bottom-0 right-0 flex h-3.5 w-3.5 items-center justify-center rounded-full border-2 border-vw-card bg-emerald-500" />
                </div>
                <p className="text-sm font-bold text-vw-text">{anonName}</p>
                <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wider text-violet-500">
                  Active Alias
                </p>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2.5">
                <div className="rounded-xl border border-violet-100 bg-violet-50/60 p-2.5 text-center dark:border-violet-900/30 dark:bg-violet-950/20">
                  <p className="text-xl font-black text-violet-600 dark:text-violet-400">{myConfessionCount}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-violet-500">Posts</p>
                </div>
                <div className="rounded-xl border border-fuchsia-100 bg-fuchsia-50/60 p-2.5 text-center dark:border-fuchsia-900/30 dark:bg-fuchsia-950/20">
                  <p className="text-xl font-black text-fuchsia-600 dark:text-fuchsia-400">{myResponseCount}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-fuchsia-500">Replies</p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(true)}
                  className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-2.5 text-xs font-bold text-white shadow-xs transition hover:opacity-95"
                >
                  + Share a Confession
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreatePoll(true)}
                  className="w-full rounded-xl border border-vw-border bg-vw-surface py-2 text-xs font-semibold text-vw-text transition hover:bg-vw-muted/60"
                >
                  🗳️ Create a Poll
                </button>
              </div>
            </div>

            {/* Daily Vibe Inspiration */}
            <DailyVibeCard />

            {/* Live Polls Highlights Banner */}
            <div className="rounded-2xl border border-violet-200/70 bg-gradient-to-br from-violet-500/10 via-fuchsia-500/10 to-transparent p-5 shadow-2xs dark:border-violet-900/40">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🗳️</span>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-vw-text">Live Polls</h4>
                </div>
                <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[10px] font-bold text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                  {polls.length} Active
                </span>
              </div>
              <p className="text-xs text-vw-textMuted mb-3">
                Vote anonymously or start your own public discussion and see live community sentiment.
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreatePoll(true)}
                  className="flex-1 rounded-xl bg-violet-600 px-3 py-1.5 text-center text-xs font-bold text-white shadow-2xs hover:bg-violet-700 transition"
                >
                  + Create
                </button>
                <Link
                  to="/polls"
                  className="flex-1 rounded-xl border border-vw-border bg-vw-surface px-3 py-1.5 text-center text-xs font-semibold text-vw-text transition hover:bg-vw-muted/60"
                >
                  Explore All →
                </Link>
              </div>
            </div>

            {/* Live Community Stats */}
            <div className="rounded-2xl border border-vw-border bg-vw-card p-5 shadow-2xs">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-vw-textMuted">Community Pulse</p>
                <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                  {stats?.safetyScore ?? 'Safe'}
                </span>
              </div>
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100 text-violet-600 dark:bg-violet-950/50 dark:text-violet-400">
                      💬
                    </div>
                    <span className="text-xs font-medium text-vw-text">Confessions</span>
                  </div>
                  <span className="text-xs font-bold text-vw-text">{stats?.activeConfessions ?? confessions.length}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-fuchsia-100 text-fuchsia-600 dark:bg-fuchsia-950/50 dark:text-fuchsia-400">
                      🗳️
                    </div>
                    <span className="text-xs font-medium text-vw-text">Active Polls</span>
                  </div>
                  <span className="text-xs font-bold text-vw-text">{polls.length}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-pink-100 text-pink-600 dark:bg-pink-950/50 dark:text-pink-400">
                      💬
                    </div>
                    <span className="text-xs font-medium text-vw-text">Responses</span>
                  </div>
                  <span className="text-xs font-bold text-vw-text">{stats?.totalFeedbacks ?? totalResponses}</span>
                </div>

                {stats?.communityVibe && (
                  <div className="rounded-xl border border-violet-100 bg-violet-50/50 p-2 text-center text-xs font-medium text-violet-700 dark:border-violet-900/30 dark:bg-violet-950/20 dark:text-violet-300">
                    Community Vibe: <span className="font-bold">{stats.communityVibe}</span>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>

      {/* Confession Creation Modal */}
      {showCreate && (
        <CreateConfessionModal
          onClose={() => setShowCreate(false)}
          onCreated={handleCreated}
        />
      )}

      {/* Poll Creation Modal */}
      <CreatePollModal
        isOpen={showCreatePoll}
        onClose={() => setShowCreatePoll(false)}
        onCreated={handlePollCreated}
      />
    </div>
  );
}
