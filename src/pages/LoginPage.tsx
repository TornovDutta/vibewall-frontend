import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import GoogleSignInButton from '../components/GoogleSignInButton';
import ThemeToggle from '../components/ThemeToggle';

export default function LoginPage() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await login({ name, password });
      navigate('/');
    } catch (e: unknown) {
      const err = e as { response?: { data?: { msg?: string; message?: string } } };
      setError(err?.response?.data?.msg ?? err?.response?.data?.message ?? 'Invalid credentials');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogleLogin() {
    setError('');
    setSubmitting(true);
    try {
      await loginWithGoogle();
      navigate('/');
    } catch (e: unknown) {
      const err = e as { message?: string; response?: { data?: { msg?: string; message?: string } } };
      setError(
        err?.response?.data?.msg ??
        err?.response?.data?.message ??
        err?.message ??
        'Google sign-in failed'
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-vw-bg px-4">
      {/* Top right theme toggle */}
      <div className="absolute top-4 right-4 z-10">
        <ThemeToggle />
      </div>
      {/* Ambient glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-violet-100 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full bg-fuchsia-100 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm animate-slide-up">
        <div className="mb-8 text-center">
          <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-3xl font-extrabold text-transparent">
            VibeWall
          </span>
          <p className="mt-2 text-sm text-gray-500">Welcome back. Enter your account.</p>
        </div>

        <div className="rounded-2xl border border-vw-border bg-vw-card p-8 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-700">Username</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="username"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                placeholder="your_username"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 py-2.5 text-sm font-semibold text-white shadow-md transition hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? 'Signing in…' : 'Sign In'}
            </button>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-vw-border"></div>
              <span className="text-xs text-gray-400">OR</span>
              <div className="h-px flex-1 bg-vw-border"></div>
            </div>

            <GoogleSignInButton
              onClick={handleGoogleLogin}
              disabled={submitting}
              text="Sign in with Google"
            />
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-gray-600">
          No account?{' '}
          <Link to="/register" className="font-medium text-violet-600 transition hover:text-violet-700">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}
