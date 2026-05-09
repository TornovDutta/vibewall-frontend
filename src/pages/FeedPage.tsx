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
  }

  function handleCreated(c: ConfessionResponse) {
    setConfessions((prev) => [c, ...prev]);
    setOwnedIds((prev) => [c.id, ...prev]);
  }

  return (
    <div className="min-h-screen bg-vw-bg">
      {user ? (
        /* ── Logged-in: compact compose bar ── */
        <div className="border-b border-vw-border bg-vw-surface/60 backdrop-blur-sm">
          <div className="mx-auto max-w-2xl px-4 py-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h1 className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-lg font-bold text-transparent">
                  VibeWall
                </h1>
                <p className="mt-0.5 text-xs text-gray-600">{anonName} · anonymous feed</p>
              </div>
              <span className="flex items-center gap-1.5 rounded-full border border-violet-500/30 bg-violet-900/20 px-3 py-1 text-xs text-violet-400">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-400" />
                Live · 12h
              </span>
            </div>

            {/* Compose bar */}
            <button
              onClick={() => setShowCreate(true)}
              className="group w-full rounded-2xl border border-vw-border bg-vw-bg p-4 text-left transition hover:border-violet-500/50"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-600 text-xs font-bold text-white">
                  {anonName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-violet-400">{anonName}</p>
                  <p className="text-sm text-gray-600 group-hover:text-gray-500">What's on your mind? Share anonymously…</p>
                </div>
                <span className="flex-shrink-0 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-1.5 text-xs font-semibold text-white">
                  Confess
                </span>
              </div>
            </button>
          </div>
        </div>
      ) : (
        /* ── Guest: marketing hero ── */
        <div className="relative overflow-hidden border-b border-vw-border bg-vw-surface py-16 text-center">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-900/30 blur-3xl" />
          </div>
          <div className="relative mx-auto max-w-2xl px-4">
            <h1 className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-4xl font-extrabold text-transparent">
              VibeWall
            </h1>
            <p className="mt-3 text-gray-400">
              Anonymous confessions. AI-moderated. Gone in 12 hours.
            </p>
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

      {/* Feed */}
      <div className="mx-auto max-w-2xl space-y-4 px-4 py-10">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium uppercase tracking-wider text-gray-500">
            Live Feed
          </h2>
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
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-center text-sm text-red-400">
            {error}
            <button onClick={load} className="ml-2 underline">Retry</button>
          </div>
        ) : confessions.length === 0 ? (
          <div className="rounded-xl border border-vw-border bg-vw-card p-12 text-center">
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
          confessions.map((c) => (
            <ConfessionCard
              key={c.id}
              confession={c}
              isOwned={ownedIds.includes(c.id)}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))
        )}
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
