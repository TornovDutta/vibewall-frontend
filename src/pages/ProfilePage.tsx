import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usersApi } from '../api/users';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import type { UsersResponse } from '../types';
import { generateAnonName } from '../utils/generateAnonName';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState<UsersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form state
  const [name, setName] = useState(user?.username ?? '');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Deletion state
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  const anonName = user ? generateAnonName(user.id) : 'Anonymous User';
  const firstLetter = anonName ? anonName.charAt(0).toUpperCase() : 'U';

  const loadProfile = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    try {
      const data = await usersApi.getProfile();
      setProfile(data);
      setName(data.name);
    } catch (e: unknown) {
      const err = e as { response?: { data?: { msg?: string; message?: string } } };
      setError(
        err?.response?.data?.message ??
        err?.response?.data?.msg ??
        'Failed to load profile details.'
      );
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setSaveMsg(null);
    try {
      const updated = await usersApi.updateProfile({
        name: name.trim(),
        password: password.trim() ? password.trim() : '',
      });
      setProfile(updated);
      setPassword('');
      setSaveMsg({ type: 'ok', text: 'Profile updated successfully!' });
    } catch (e: unknown) {
      const err = e as { response?: { data?: { msg?: string; message?: string } } };
      setSaveMsg({
        type: 'err',
        text: err?.response?.data?.message ?? err?.response?.data?.msg ?? 'Failed to update profile.',
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteAccount() {
    if (!window.confirm('Are you sure you want to permanently delete your account? All your confessions and responses will be removed.')) {
      return;
    }
    setDeleting(true);
    setDeleteError('');
    try {
      await usersApi.deleteAccount();
      await logout();
      navigate('/login');
    } catch (e: unknown) {
      const err = e as { response?: { data?: { msg?: string } } };
      setDeleteError(err?.response?.data?.msg ?? 'Failed to delete account.');
      setDeleting(false);
    }
  }

  if (!user) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <p className="text-sm text-vw-textMuted mb-4">Please log in to view your profile and reputation score.</p>
        <Link
          to="/login"
          className="rounded-xl bg-violet-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-violet-700 transition"
        >
          Go to Login
        </Link>
      </div>
    );
  }

  const currentPoints = profile?.points ?? 100;
  const isBanned = profile?.banned ?? false;

  // Determine reputation tier
  let tier = {
    title: 'Trusted Vibester',
    color: 'emerald',
    badgeClass: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    description: 'You are an exemplary member of the VibeWall community.',
  };

  if (isBanned) {
    tier = {
      title: 'Account Suspended',
      color: 'red',
      badgeClass: 'border-red-500/40 bg-red-500/15 text-red-600 dark:text-red-400',
      description: 'Your account is banned due to negative points or safety violations.',
    };
  } else if (currentPoints >= 100) {
    tier = {
      title: 'Trusted Vibester',
      color: 'emerald',
      badgeClass: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      description: 'High reputation standing. Free expression with zero tolerance for hate.',
    };
  } else if (currentPoints >= 50) {
    tier = {
      title: 'Good Standing',
      color: 'blue',
      badgeClass: 'border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400',
      description: 'Healthy standing. Keep sharing positive or authentic vibes.',
    };
  } else {
    tier = {
      title: 'Warning: Points Low',
      color: 'amber',
      badgeClass: 'border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400',
      description: 'Caution: Dropping below 0 points results in an automatic immediate ban.',
    };
  }

  // Calculate percentage on 0 - 200 scale (with 0 as minimum clamp)
  const normalizedPoints = Math.max(0, Math.min(200, currentPoints));
  const progressPercent = Math.round((normalizedPoints / 200) * 100);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      {/* ── Breadcrumb & Top Header ── */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-vw-text sm:text-3xl">
            User Profile & Reputation
          </h1>
          <p className="mt-1 text-xs text-vw-textMuted sm:text-sm">
            Manage your credentials and monitor your community reputation points.
          </p>
        </div>
        <Link
          to="/dashboard"
          className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-vw-border bg-vw-surface/80 px-3.5 py-2 text-xs font-semibold text-vw-text shadow-2xs transition hover:border-violet-400 hover:bg-vw-muted/40"
        >
          <span>Dashboard</span>
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {loading ? (
        <div className="py-20">
          <LoadingSpinner />
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-center text-sm text-red-500">
          {error}
        </div>
      ) : (
        <div className="space-y-6">

          {/* ── Banned Alert Banner (If applicable) ── */}
          {isBanned && (
            <div className="rounded-2xl border-2 border-red-500/40 bg-red-500/10 p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <span className="text-2xl">🚫</span>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-red-600 dark:text-red-400">
                    Account Suspended
                  </h3>
                  <p className="mt-1 text-xs text-red-700 dark:text-red-300">
                    <strong>Reason:</strong> {profile?.banReason || 'Points dropped below 0 due to safety violations.'}
                  </p>
                  <p className="mt-2 text-xs text-red-700/80 dark:text-red-300/80 leading-relaxed">
                    Posting confessions, comments, and voting in polls are restricted. In accordance with community rules, only platform administrators can review and unban accounts from the Admin Panel.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── Vibe Reputation & Standing Card ── */}
          <div className="relative overflow-hidden rounded-2xl border border-vw-border bg-vw-card p-6 shadow-sm">
            {/* Background ambient gradient glow */}
            <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br from-violet-500/15 via-fuchsia-500/10 to-transparent blur-3xl" />

            <div className="relative">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                {/* Identity & Alias */}
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600 to-fuchsia-600 text-xl font-extrabold text-white shadow-md">
                    {firstLetter}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold text-vw-text">{anonName}</h2>
                      <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${tier.badgeClass}`}>
                        {tier.title}
                      </span>
                    </div>
                    <p className="text-xs text-vw-textMuted font-mono">
                      User ID: {user.id} • Registered as @{profile?.name}
                    </p>
                  </div>
                </div>

                {/* Score Pill */}
                <div className="flex flex-col sm:items-end">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-vw-textMuted">
                    Community Vibe Points
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-3xl font-extrabold tracking-tight text-violet-600 dark:text-violet-400">
                      {currentPoints}
                    </span>
                    <span className="text-sm font-semibold text-vw-textMuted">pts</span>
                  </div>
                </div>
              </div>

              {/* Reputation Gauge / Bar */}
              <div className="mt-6 pt-5 border-t border-vw-border">
                <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                  <span className="text-vw-textMuted">Reputation Health</span>
                  <span className="font-semibold text-vw-text">
                    {currentPoints < 0 ? 'Negative (Suspended)' : `${progressPercent}% of baseline goal`}
                  </span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-vw-muted/60">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isBanned || currentPoints < 0
                        ? 'bg-red-500'
                        : currentPoints < 50
                        ? 'bg-amber-500'
                        : 'bg-gradient-to-r from-violet-500 to-emerald-500'
                    }`}
                    style={{ width: `${Math.max(5, Math.min(100, progressPercent))}%` }}
                  />
                </div>
                <div className="mt-2 flex justify-between text-[10px] text-vw-textMuted font-mono">
                  <span className="text-red-500 font-semibold">&lt; 0 (Ban Threshold)</span>
                  <span>50 (Caution)</span>
                  <span className="text-emerald-500 font-semibold">100 (Default)</span>
                  <span className="text-violet-500 font-semibold">200+ (Elite)</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Reputation Rules & Point System Guide ── */}
          <div className="rounded-2xl border border-vw-border bg-vw-card p-6 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-vw-text mb-1">
              How the Vibe Reputation System Works
            </h3>
            <p className="text-xs text-vw-textMuted mb-4">
              VibeWall is a supportive space. We encourage vulnerability, sadness, venting, and real confessions, but strictly prohibit hateful harassment and bullying.
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-base text-emerald-500">
                  💖
                </span>
                <div>
                  <h4 className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                    +5 Points: Received Likes & Reactions
                  </h4>
                  <p className="mt-0.5 text-[11px] text-vw-textMuted leading-relaxed">
                    Earn 5 points every time a community member likes or leaves a heart reaction on your confessions or comments.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-red-500/20 bg-red-500/5 p-3.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-base text-red-500">
                  🛡️
                </span>
                <div>
                  <h4 className="text-xs font-bold text-red-700 dark:text-red-400">
                    -25 Points: Hate Speech & Malice
                  </h4>
                  <p className="mt-0.5 text-[11px] text-vw-textMuted leading-relaxed">
                    The AI Intent Layer flags hateful, insulting, or abusive submissions before they post and penalizes 25 points.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-3.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 text-base text-amber-500">
                  🚫
                </span>
                <div>
                  <h4 className="text-xs font-bold text-amber-700 dark:text-amber-400">
                    Auto-Ban at Negative Points
                  </h4>
                  <p className="mt-0.5 text-[11px] text-vw-textMuted leading-relaxed">
                    If your points drop below 0, your account is immediately banned across all posting, replying, and polling features.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-xl border border-violet-500/20 bg-violet-500/5 p-3.5">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-base text-violet-500">
                  👑
                </span>
                <div>
                  <h4 className="text-xs font-bold text-violet-700 dark:text-violet-400">
                    Admin Unban Review
                  </h4>
                  <p className="mt-0.5 text-[11px] text-vw-textMuted leading-relaxed">
                    Once suspended, only platform administrators can review account history and unban accounts via the Admin Panel.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Edit Profile Credentials Form ── */}
          <div className="rounded-2xl border border-vw-border bg-vw-card p-6 shadow-sm">
            <h3 className="text-sm font-bold text-vw-text mb-1">
              Account Credentials
            </h3>
            <p className="text-xs text-vw-textMuted mb-4">
              Update your username or reset your password.
            </p>

            <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md">
              <div>
                <label className="block text-xs font-semibold text-vw-text mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-vw-border bg-vw-surface px-3.5 py-2.5 text-xs text-vw-text focus:border-violet-500 focus:outline-none"
                  placeholder="Your username"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-vw-text mb-1">
                  New Password <span className="font-normal text-vw-textMuted">(Optional)</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Leave blank to keep current"
                  className="w-full rounded-xl border border-vw-border bg-vw-surface px-3.5 py-2.5 text-xs text-vw-text placeholder-vw-textMuted focus:border-violet-500 focus:outline-none"
                />
              </div>

              {saveMsg && (
                <div
                  className={`rounded-xl p-3 text-xs font-medium ${
                    saveMsg.type === 'ok'
                      ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'border border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400'
                  }`}
                >
                  {saveMsg.text}
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-violet-600 px-5 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-violet-700 disabled:opacity-50"
              >
                {saving ? 'Saving changes…' : 'Save Changes'}
              </button>
            </form>
          </div>

          {/* ── Danger Zone ── */}
          <div className="rounded-2xl border border-red-500/20 bg-vw-card p-6 shadow-sm">
            <h3 className="text-sm font-bold text-red-600 dark:text-red-400 mb-1">
              Danger Zone
            </h3>
            <p className="text-xs text-vw-textMuted mb-4">
              Permanently delete your account. This action cannot be reversed and all associated confessions will be purged.
            </p>

            {deleteError && (
              <p className="mb-3 text-xs text-red-500">{deleteError}</p>
            )}

            <button
              type="button"
              onClick={handleDeleteAccount}
              disabled={deleting}
              className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-xs font-bold text-red-600 transition hover:bg-red-500/20 disabled:opacity-50"
            >
              {deleting ? 'Deleting account…' : 'Delete Account Permanently'}
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
