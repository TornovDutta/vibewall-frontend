import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';

export default function RegisterPage() {
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError('Passwords do not match'); return; }
    setSubmitting(true);
    setError('');
    try {
      await register({ name, password });
      navigate('/login', { state: { registered: true } });
    } catch (e: unknown) {
      const err = e as { response?: { data?: { msg?: string; details?: string } } };
      setError(err?.response?.data?.msg ?? err?.response?.data?.details ?? 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-vw-bg px-4">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-fuchsia-100 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-violet-100 blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm animate-slide-up">
        <div className="mb-8 text-center">
          <span className="bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-3xl font-extrabold text-transparent">
            VibeWall
          </span>
          <p className="mt-2 text-sm text-gray-500">Create an anonymous account.</p>
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
                autoComplete="new-password"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium text-gray-700">Confirm Password</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                autoComplete="new-password"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
                {error}
              </div>
            )}

            <p className="text-xs text-gray-500">
              Passwords must meet strength requirements (min 8 chars, mixed case, number & special character).
            </p>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 py-2.5 text-sm font-semibold text-white shadow-md transition hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? 'Creating account…' : 'Create Account'}
            </button>

            <div className="flex items-center gap-3">
              <div className="h-px flex-1 bg-vw-border"></div>
              <span className="text-xs text-gray-400">OR</span>
              <div className="h-px flex-1 bg-vw-border"></div>
            </div>

            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={async (credentialResponse) => {
                  if (credentialResponse.credential) {
                    try {
                      setSubmitting(true);
                      await loginWithGoogle(credentialResponse.credential);
                      navigate('/');
                    } catch (e: unknown) {
                      const err = e as { response?: { data?: { msg?: string; details?: string } } };
                      setError(err?.response?.data?.msg ?? err?.response?.data?.details ?? 'Google registration failed');
                      setSubmitting(false);
                    }
                  }
                }}
                onError={() => {
                  setError('Google registration failed');
                }}
                theme="outline"
                shape="rectangular"
                text="signup_with"
                size="large"
              />
            </div>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-violet-600 transition hover:text-violet-700">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
