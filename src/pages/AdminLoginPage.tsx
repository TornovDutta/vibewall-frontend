import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminLoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Already logged in as admin → go straight to dashboard
  if (user?.role === 'ADMIN') {
    navigate('/admin', { replace: true });
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await login({ name, password });
      // login updates the user in context; check role after
      // We read from the JWT decoded inside AuthContext — re-check via navigation guard
      navigate('/admin', { replace: true });
    } catch (e: unknown) {
      const err = e as { response?: { data?: { msg?: string; message?: string } } };
      setError(err?.response?.data?.msg ?? err?.response?.data?.message ?? 'Invalid credentials');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-vw-bg px-4">
      {/* Ambient glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-red-900/20 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-orange-900/15 blur-3xl" />
        <div className="absolute bottom-20 left-0 h-48 w-48 rounded-full bg-violet-900/20 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm animate-slide-up">
        {/* Logo + badge */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10">
              <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
          </div>
          <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-2xl font-extrabold text-transparent">
            VibeWall
          </span>
          <div className="mt-2 flex justify-center">
            <span className="rounded-full border border-red-500/40 bg-red-500/10 px-3 py-0.5 text-xs font-semibold uppercase tracking-widest text-red-400">
              Admin Portal
            </span>
          </div>
          <p className="mt-3 text-sm text-gray-500">Restricted access. Authorised personnel only.</p>
        </div>

        <div className="rounded-2xl border border-vw-border bg-vw-card p-8 shadow-xl shadow-black/20">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-400">Admin Username</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="username"
                className="w-full rounded-lg border border-vw-border bg-vw-surface px-3 py-2.5 text-sm text-white placeholder-gray-600 transition focus:border-red-500/70 focus:outline-none focus:ring-1 focus:ring-red-500/20"
                placeholder="admin_username"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-400">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full rounded-lg border border-vw-border bg-vw-surface px-3 py-2.5 text-sm text-white placeholder-gray-600 transition focus:border-red-500/70 focus:outline-none focus:ring-1 focus:ring-red-500/20"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-xs text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-gradient-to-r from-red-700 to-rose-600 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? 'Authenticating…' : 'Access Admin Panel'}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-gray-600">
          Not an admin?{' '}
          <Link to="/login" className="text-violet-400 transition hover:text-violet-300">
            User login
          </Link>
        </p>
      </div>
    </div>
  );
}
