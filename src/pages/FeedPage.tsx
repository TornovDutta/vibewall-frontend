import { useCallback, useEffect, useState } from 'react';
import { feedApi } from '../api/feed';
import ConfessionCard from '../components/ConfessionCard';
import LandingPage from './LandingPage';
import CreateConfessionModal, { getOwnedConfessionIds } from '../components/CreateConfessionModal';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import type { ConfessionResponse } from '../types';
import { generateAnonName } from '../utils/generateAnonName';

export default function FeedPage() {
  const { user } = useAuth();
  const anonName = user ? generateAnonName(user.id) : '';
  const [confessions, setConfessions] = useState<ConfessionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [ownedIds, setOwnedIds] = useState<string[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await feedApi.getFeed();
      setConfessions(data ?? []);
      setOwnedIds(getOwnedConfessionIds());
    } catch {
      setError('Failed to load feed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

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

  const myConfessionCount = ownedIds.length;
  const myResponseCount = confessions
    .filter((c) => ownedIds.includes(c.id))
    .reduce((sum, c) => sum + c.feedbacks.length, 0);
  const totalResponses = confessions.reduce((sum, c) => sum + c.feedbacks.length, 0);

  if (!user) {
    if (loading) return <LoadingSpinner />;
    return <LandingPage confessions={confessions} />;
  }

  return (
    <div className="min-h-screen bg-vw-bg">
      {/* ── Top bar ── */}
      <div className="sticky top-0 z-20 border-b border-vw-border bg-vw-surface/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <h1 className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 bg-clip-text text-base font-extrabold text-transparent">
            VibeWall
          </h1>
          <span className="hidden text-vw-muted sm:block">·</span>
          <span className="hidden text-xs text-gray-500 sm:block">{anonName}</span>
          <div className="ml-auto flex items-center gap-3">
            <span className="flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-100 px-3 py-1 text-xs text-violet-700">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-500" />
              Live · 12h
            </span>
            <button
              onClick={() => setShowCreate(true)}
              className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-1.5 text-xs font-semibold text-white shadow-md transition hover:opacity-90"
            >
              + Confess
            </button>
          </div>
        </div>
      </div>

      {/* ── 2-column body ── */}
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">

          {/* ── CENTER FEED (Spans 2 cols) ── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tagline banner */}
            <div className="flex items-center gap-2 rounded-2xl border border-vw-border bg-vw-card px-4 py-4 shadow-sm">
              <span className="flex h-1.5 w-1.5 flex-shrink-0 rounded-full bg-violet-400 animate-pulse" />
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-gray-900">Anonymous confessions.</span>
                {' '}AI-moderated.{' '}
                <span className="font-semibold text-violet-500">Gone in 12 hours.</span>
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold uppercase tracking-wider text-gray-500">Live Feed</h2>
                {!loading && (
                  <span className="rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-semibold text-violet-700">
                    {confessions.length}
                  </span>
                )}
              </div>
              <button
                onClick={load}
                disabled={loading}
                className="flex items-center gap-1.5 text-xs font-medium text-gray-500 transition hover:text-violet-600 disabled:opacity-40"
              >
                <svg className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>

            {loading ? (
              <LoadingSpinner />
            ) : error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-600">
                {error}
                <button onClick={load} className="ml-2 font-semibold underline">Retry</button>
              </div>
            ) : confessions.length === 0 ? (
              <div className="rounded-3xl border border-vw-border bg-vw-card p-12 text-center shadow-sm">
                <div className="mb-4 flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-violet-100">
                    <svg className="h-8 w-8 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-3 3-3-3z" />
                    </svg>
                  </div>
                </div>
                <p className="text-lg font-semibold text-gray-900">No live confessions right now</p>
                <p className="mt-2 text-sm text-gray-500">Be the first to share something anonymously.</p>
                <button
                  onClick={() => setShowCreate(true)}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:opacity-90"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Post a Confession
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {confessions.map((c) => (
                  <ConfessionCard
                    key={c.id}
                    confession={c}
                    isOwned={ownedIds.includes(c.id)}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>

          {/* ── UNIFIED RIGHT SIDEBAR ── */}
          <aside className="space-y-6 lg:block">
            {/* Profile card */}
            <div className="rounded-2xl border border-vw-border bg-vw-card p-5 shadow-sm">
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-3">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 text-xl font-extrabold text-white shadow-md">
                    {anonName[0]}
                  </div>
                  <span className="absolute bottom-0 right-0 flex h-4 w-4 items-center justify-center rounded-full border-2 border-white bg-green-500" />
                </div>
                <p className="text-base font-bold text-gray-900">{anonName}</p>
                <p className="mt-0.5 text-[11px] font-bold uppercase tracking-wider text-violet-500">
                  Active Alias
                </p>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-violet-50 px-3 py-3 text-center border border-violet-100">
                  <p className="text-2xl font-black text-violet-600">{myConfessionCount}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-violet-400">Posts</p>
                </div>
                <div className="rounded-xl bg-fuchsia-50 px-3 py-3 text-center border border-fuchsia-100">
                  <p className="text-2xl font-black text-fuchsia-600">{myResponseCount}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-fuchsia-400">Replies</p>
                </div>
              </div>

              <button
                onClick={() => setShowCreate(true)}
                className="mt-5 w-full rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-3 text-sm font-semibold text-white shadow-md transition hover:opacity-90"
              >
                + Share a Confession
              </button>
            </div>

            {/* Live stats */}
            <div className="rounded-2xl border border-vw-border bg-vw-card p-5 shadow-sm">
              <p className="mb-4 text-xs font-bold uppercase tracking-wider text-gray-400">Live Stats</p>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100">
                      <svg className="h-4 w-4 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-3 3-3-3z" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-700">Confessions</span>
                  </div>
                  <span className="text-base font-bold text-gray-900">{confessions.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-fuchsia-100">
                      <svg className="h-4 w-4 text-fuchsia-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-gray-700">Responses</span>
                  </div>
                  <span className="text-base font-bold text-gray-900">{totalResponses}</span>
                </div>
              </div>
            </div>

            {/* How it works */}
            <div className="rounded-2xl border border-vw-border bg-vw-card p-5 shadow-sm">
              <p className="mb-4 text-xs font-bold uppercase tracking-wider text-gray-400">How it works</p>
              <ol className="space-y-3">
                {[
                  { n: '1', text: 'Post a confession anonymously' },
                  { n: '2', text: 'Others can respond to your post' },
                  { n: '3', text: 'Everything disappears after 12h' },
                ].map(({ n, text }) => (
                  <li key={n} className="flex items-center gap-3">
                    <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-600">
                      {n}
                    </span>
                    <span className="text-sm text-gray-600">{text}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* AI moderation badge */}
            <div className="rounded-2xl border border-violet-200 bg-violet-50 p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-violet-200">
                  <svg className="h-5 w-5 text-violet-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-bold text-violet-900">AI Moderated</p>
                  <p className="mt-1 text-xs text-violet-700">Content is automatically reviewed for safety.</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {showCreate && (
        <CreateConfessionModal
          onClose={() => setShowCreate(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
}
