import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { feedApi } from '../api/feed';
import ConfessionCard from '../components/ConfessionCard';
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

  return (
    <div className="min-h-screen bg-vw-bg">
      {/* ── Top bar ── */}
      {user ? (
        <div className="sticky top-0 z-20 border-b border-vw-border bg-vw-surface/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
            <h1 className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-base font-extrabold text-transparent">
              VibeWall
            </h1>
            <span className="hidden text-vw-muted sm:block">·</span>
            <span className="hidden text-xs text-gray-600 sm:block">{anonName}</span>
            <div className="ml-auto flex items-center gap-3">
              <span className="flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-900/20 px-3 py-1 text-xs text-violet-400">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-400" />
                Live · 12h
              </span>
              <button
                onClick={() => setShowCreate(true)}
                className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-1.5 text-xs font-semibold text-white transition hover:opacity-90"
              >
                + Confess
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* ── Guest hero ── */
        <div className="relative overflow-hidden border-b border-vw-border bg-vw-surface py-16 text-center">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-900/30 blur-3xl" />
          </div>
          <div className="relative mx-auto max-w-2xl px-4">
            <h1 className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-4xl font-extrabold text-transparent">
              VibeWall
            </h1>
            <p className="mt-3 text-gray-400">Anonymous confessions. AI-moderated. Gone in 12 hours.</p>
            <div className="mt-6 flex justify-center gap-3">
              <Link
                to="/register"
                className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Get Started
              </Link>
              <Link
                to="/login"
                className="rounded-xl border border-vw-border px-6 py-2.5 text-sm text-gray-400 transition hover:text-white"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── 3-column body ── */}
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex gap-6">

          {/* ── LEFT SIDEBAR ── */}
          <aside className="hidden w-56 flex-shrink-0 flex-col gap-4 lg:flex">
            {user ? (
              <>
                {/* Profile card */}
                <div className="rounded-2xl border border-vw-border bg-vw-card p-4">
                  <div className="flex flex-col items-center text-center">
                    <div className="relative mb-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 text-lg font-extrabold text-white shadow-lg shadow-violet-900/40">
                        {anonName[0]}
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-vw-card bg-green-500" />
                    </div>
                    <p className="text-sm font-bold text-white">{anonName}</p>
                    <p className="mt-0.5 text-[10px] font-medium uppercase tracking-widest text-gray-600">
                      Anonymous
                    </p>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-2">
                    <div className="rounded-xl bg-vw-bg/60 px-2 py-2.5 text-center">
                      <p className="text-xl font-bold text-violet-400">{myConfessionCount}</p>
                      <p className="text-[9px] font-semibold uppercase tracking-widest text-gray-600">Posts</p>
                    </div>
                    <div className="rounded-xl bg-vw-bg/60 px-2 py-2.5 text-center">
                      <p className="text-xl font-bold text-fuchsia-400">{myResponseCount}</p>
                      <p className="text-[9px] font-semibold uppercase tracking-widest text-gray-600">Replies</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowCreate(true)}
                    className="mt-4 w-full rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-2 text-xs font-semibold text-white transition hover:opacity-90"
                  >
                    Share a Confession
                  </button>
                </div>

                {/* Navigation */}
                <div className="rounded-2xl border border-vw-border bg-vw-card p-4">
                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-gray-600">Navigate</p>
                  <nav className="space-y-1">
                    <Link
                      to="/"
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-violet-400 bg-violet-900/20"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                      </svg>
                      Live Feed
                    </Link>
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-gray-400 transition hover:bg-vw-surface hover:text-white"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                      Dashboard
                    </Link>
                  </nav>
                </div>

                {/* Alias info */}
                <div className="rounded-2xl border border-violet-500/20 bg-violet-900/10 p-4">
                  <p className="mb-1 text-[10px] font-semibold uppercase tracking-widest text-violet-500">Your Alias</p>
                  <p className="text-sm font-bold text-violet-300">{anonName}</p>
                  <p className="mt-1.5 text-[10px] leading-relaxed text-gray-600">
                    This identity is auto-generated and changes with your account. No one knows it's you.
                  </p>
                </div>
              </>
            ) : (
              /* Guest left sidebar */
              <>
                <div className="rounded-2xl border border-vw-border bg-vw-card p-5 text-center">
                  <div className="mb-3 flex justify-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-violet-600/30 to-fuchsia-600/30">
                      <svg className="h-6 w-6 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-white">Join VibeWall</p>
                  <p className="mt-1 text-xs text-gray-600">Post anonymously, respond to others.</p>
                  <div className="mt-4 space-y-2">
                    <Link
                      to="/register"
                      className="block w-full rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 py-2 text-xs font-semibold text-white transition hover:opacity-90"
                    >
                      Create Account
                    </Link>
                    <Link
                      to="/login"
                      className="block w-full rounded-xl border border-vw-border py-2 text-xs text-gray-400 transition hover:text-white"
                    >
                      Sign In
                    </Link>
                  </div>
                </div>
              </>
            )}
          </aside>

          {/* ── CENTER FEED ── */}
          <div className="min-w-0 flex-1">
            {/* Tagline banner */}
            <div className="mb-5 flex items-center gap-2 rounded-2xl border border-vw-border bg-vw-card px-4 py-3">
              <span className="flex h-1.5 w-1.5 flex-shrink-0 rounded-full bg-violet-400 animate-pulse" />
              <p className="text-xs text-gray-500">
                <span className="font-semibold text-gray-300">Anonymous confessions.</span>
                {' '}AI-moderated.{' '}
                <span className="font-semibold text-violet-400">Gone in 12 hours.</span>
              </p>
            </div>

            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-gray-500">Live Feed</h2>
                {!loading && (
                  <span className="rounded-full bg-vw-surface px-2 py-0.5 text-[10px] font-semibold text-gray-600">
                    {confessions.length}
                  </span>
                )}
              </div>
              <button
                onClick={load}
                disabled={loading}
                className="flex items-center gap-1.5 text-xs text-gray-500 transition hover:text-violet-400 disabled:opacity-40"
              >
                <svg className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
            </div>

            {loading ? (
              <LoadingSpinner />
            ) : error ? (
              <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center text-sm text-red-400">
                {error}
                <button onClick={load} className="ml-2 underline">Retry</button>
              </div>
            ) : confessions.length === 0 ? (
              <div className="rounded-2xl border border-vw-border bg-vw-card p-12 text-center">
                <div className="mb-4 flex justify-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-violet-900/30">
                    <svg className="h-7 w-7 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-3 3-3-3z" />
                    </svg>
                  </div>
                </div>
                <p className="text-base font-medium text-gray-300">No live confessions right now</p>
                <p className="mt-1 text-sm text-gray-500">Be the first to share something anonymously.</p>
                {user ? (
                  <button
                    onClick={() => setShowCreate(true)}
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Post a Confession
                  </button>
                ) : (
                  <div className="mt-6 flex justify-center gap-3">
                    <Link
                      to="/register"
                      className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                    >
                      Post a Confession
                    </Link>
                    <Link
                      to="/login"
                      className="rounded-xl border border-vw-border px-6 py-2.5 text-sm text-gray-400 transition hover:text-white"
                    >
                      Sign In
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
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

          {/* ── RIGHT SIDEBAR ── */}
          <aside className="hidden w-56 flex-shrink-0 flex-col gap-4 lg:flex">
            {/* Live stats */}
            <div className="rounded-2xl border border-vw-border bg-vw-card p-4">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-gray-600">Live Stats</p>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-900/40">
                      <svg className="h-3.5 w-3.5 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-3 3-3-3z" />
                      </svg>
                    </div>
                    <span className="text-xs text-gray-400">Confessions</span>
                  </div>
                  <span className="text-sm font-bold text-white">{confessions.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-fuchsia-900/40">
                      <svg className="h-3.5 w-3.5 text-fuchsia-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                      </svg>
                    </div>
                    <span className="text-xs text-gray-400">Responses</span>
                  </div>
                  <span className="text-sm font-bold text-white">{totalResponses}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-900/30">
                      <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
                    </div>
                    <span className="text-xs text-gray-400">Window</span>
                  </div>
                  <span className="text-sm font-bold text-green-400">12h</span>
                </div>
              </div>
            </div>

            {/* How it works */}
            <div className="rounded-2xl border border-vw-border bg-vw-card p-4">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-gray-600">How it works</p>
              <ol className="space-y-2.5">
                {[
                  { n: '1', text: 'Post a confession anonymously' },
                  { n: '2', text: 'Others can respond to your post' },
                  { n: '3', text: 'Everything disappears after 12h' },
                ].map(({ n, text }) => (
                  <li key={n} className="flex items-start gap-2.5">
                    <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-violet-900/50 text-[9px] font-bold text-violet-400">
                      {n}
                    </span>
                    <span className="text-xs leading-relaxed text-gray-500">{text}</span>
                  </li>
                ))}
              </ol>
            </div>

            {/* Community rules */}
            <div className="rounded-2xl border border-vw-border bg-vw-card p-4">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-gray-600">Community Rules</p>
              <ul className="space-y-2">
                {[
                  'Be respectful to others',
                  'No hate speech or harassment',
                  'No personal information',
                  'Report harmful content',
                ].map((rule) => (
                  <li key={rule} className="flex items-start gap-2">
                    <svg className="mt-0.5 h-3 w-3 flex-shrink-0 text-violet-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd" />
                    </svg>
                    <span className="text-xs leading-relaxed text-gray-500">{rule}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* AI moderation badge */}
            <div className="rounded-2xl border border-violet-500/20 bg-violet-900/10 p-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-violet-900/50">
                  <svg className="h-4 w-4 text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-semibold text-violet-300">AI Moderated</p>
                  <p className="text-[10px] text-gray-600">Content is reviewed automatically</p>
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
