import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { feedApi } from '../api/feed';
import ConfessionCard from '../components/ConfessionCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import type { ConfessionResponse } from '../types';
import { getOwnedConfessionIds } from '../components/CreateConfessionModal';

export default function FeedPage() {
  const { user } = useAuth();
  const [confessions, setConfessions] = useState<ConfessionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await feedApi.getFeed();
      setConfessions(data ?? []);
    } catch {
      setError('Failed to load feed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const ownedIds = getOwnedConfessionIds();

  function handleUpdate(updated: ConfessionResponse) {
    setConfessions((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  }

  function handleDelete(id: string) {
    setConfessions((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div className="min-h-screen bg-vw-bg">
      {/* Hero */}
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

          {user ? (
            <Link
              to="/dashboard"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Post a Confession
            </Link>
          ) : (
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
          )}
        </div>
      </div>

      {/* Feed */}
      <div className="mx-auto max-w-2xl space-y-4 px-4 py-10">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
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
              <Link
                to="/dashboard"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Post a Confession
              </Link>
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
    </div>
  );
}
