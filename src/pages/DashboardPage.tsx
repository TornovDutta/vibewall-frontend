import type { AxiosError } from 'axios';
import { useCallback, useEffect, useState } from 'react';
import { feedApi } from '../api/feed';
import { reportsApi } from '../api/reports';
import { usersApi } from '../api/users';
import ConfessionCard from '../components/ConfessionCard';
import CreateConfessionModal, {
  getOwnedConfessionIds,
  removeOwnedConfession,
} from '../components/CreateConfessionModal';
import LoadingSpinner from '../components/LoadingSpinner';
import ReportModal from '../components/ReportModal';
import { useAuth } from '../context/AuthContext';
import type { ConfessionResponse, OwnedReport } from '../types';
import { useNavigate } from 'react-router-dom';

const OWNED_REPORTS_KEY = 'vw_owned_reports';

function getOwnedReports(): OwnedReport[] {
  try {
    return JSON.parse(localStorage.getItem(OWNED_REPORTS_KEY) ?? '[]');
  } catch { return []; }
}

function removeOwnedReport(id: string) {
  const existing = getOwnedReports().filter((r) => r.id !== id);
  localStorage.setItem(OWNED_REPORTS_KEY, JSON.stringify(existing));
}

type Tab = 'my' | 'feed' | 'reports' | 'profile';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('my');
  const [confessions, setConfessions] = useState<ConfessionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [ownedIds, setOwnedIds] = useState<string[]>([]);
  const [ownedReports, setOwnedReports] = useState<OwnedReport[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [feedError, setFeedError] = useState('');
  const [reportActionError, setReportActionError] = useState('');
  const [accountError, setAccountError] = useState('');

  // Profile edit state
  const [profileName, setProfileName] = useState(user?.username ?? '');
  const [profilePassword, setProfilePassword] = useState('');
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');

  const loadFeed = useCallback(async () => {
    setLoading(true);
    setFeedError('');
    try {
      const data = await feedApi.getFeed();
      setConfessions(data ?? []);
      setOwnedIds(getOwnedConfessionIds());
    } catch {
      setFeedError('Failed to load feed. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  }, []);

  const loadReports = useCallback(async () => {
    setReportsLoading(true);
    try {
      const data = await reportsApi.list();
      const mapped: OwnedReport[] = data.map((r) => ({
        id: r.id,
        content: r.reportContent,
        createdAt: r.dateTime ?? new Date().toISOString(),
      }));
      setOwnedReports(mapped);
    } catch {
      setOwnedReports(getOwnedReports());
    } finally {
      setReportsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeed();
  }, [loadFeed]);

  useEffect(() => {
    if (tab === 'reports') loadReports();
  }, [tab, loadReports]);

  function handleUpdate(updated: ConfessionResponse) {
    setConfessions((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  }

  function handleDelete(id: string) {
    setConfessions((prev) => prev.filter((c) => c.id !== id));
    removeOwnedConfession(id);
    setOwnedIds((prev) => prev.filter((i) => i !== id));
  }

  function handleCreated(c: ConfessionResponse) {
    setConfessions((prev) => [c, ...prev]);
    setOwnedIds((prev) => [c.id, ...prev]);
  }

  async function handleDeleteReport(id: string) {
    setReportActionError('');
    try {
      await reportsApi.delete(id);
      removeOwnedReport(id);
      await loadReports();
    } catch (e: unknown) {
      const err = e as AxiosError<{ message?: string }>;
      setReportActionError(err?.response?.data?.message ?? 'Failed to withdraw report.');
    }
  }

  async function handleSaveProfile() {
    if (!profileName.trim()) return;
    setProfileSaving(true);
    setProfileMsg('');
    try {
      await usersApi.updateProfile({ name: profileName.trim(), password: profilePassword });
      setProfileMsg('Profile updated successfully.');
      setProfilePassword('');
    } catch (e: unknown) {
      const err = e as AxiosError<{ msg?: string }>;
      setProfileMsg(err?.response?.data?.msg ?? 'Update failed.');
    } finally {
      setProfileSaving(false);
    }
  }

  async function handleDeleteAccount() {
    if (!confirm('Permanently delete your account? This cannot be undone.')) return;
    setAccountError('');
    try {
      await usersApi.deleteAccount();
      await logout();
      navigate('/login');
    } catch {
      setAccountError('Failed to delete account. Please try again.');
    }
  }

  const myConfessions = confessions.filter((c) => ownedIds.includes(c.id));
  const allFeed = confessions;

  const tabs: { key: Tab; label: string }[] = [
    { key: 'my', label: 'My Confessions' },
    { key: 'feed', label: 'All Feed' },
    { key: 'reports', label: 'My Reports' },
    { key: 'profile', label: 'Profile' },
  ];

  return (
    <div className="min-h-screen bg-vw-bg">
      <div className="mx-auto max-w-3xl px-4 py-10">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">Welcome back, @{user?.username}</p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Confess
          </button>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-1 rounded-xl border border-vw-border bg-vw-surface p-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex-1 rounded-lg py-2 text-xs font-medium transition ${
                tab === t.key
                  ? 'bg-violet-600 text-white'
                  : 'text-gray-500 hover:text-gray-300'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {feedError && (
          <div className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {feedError}
          </div>
        )}
        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            {tab === 'my' && (
              <div className="space-y-4">
                {myConfessions.length === 0 ? (
                  <div className="rounded-xl border border-vw-border bg-vw-card p-10 text-center">
                    <p className="mb-4 text-gray-500">You haven't posted anything yet.</p>
                    <button
                      onClick={() => setShowCreate(true)}
                      className="rounded-lg bg-violet-600/80 px-4 py-2 text-sm text-white transition hover:bg-violet-600"
                    >
                      Post your first confession
                    </button>
                  </div>
                ) : (
                  myConfessions.map((c) => (
                    <ConfessionCard
                      key={c.id}
                      confession={c}
                      isOwned
                      onUpdate={handleUpdate}
                      onDelete={handleDelete}
                    />
                  ))
                )}
              </div>
            )}

            {tab === 'feed' && (
              <div className="space-y-4">
                {allFeed.length === 0 ? (
                  <div className="rounded-xl border border-vw-border bg-vw-card p-10 text-center text-gray-500">
                    No confessions in the feed yet.
                  </div>
                ) : (
                  allFeed.map((c) => (
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
            )}

            {tab === 'reports' && (
              <div className="space-y-4">
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowReport(true)}
                    className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-400 transition hover:border-amber-400/60"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    New Report
                  </button>
                </div>

                {reportActionError && (
                  <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                    {reportActionError}
                  </div>
                )}
                {reportsLoading ? (
                  <LoadingSpinner />
                ) : ownedReports.length === 0 ? (
                  <div className="rounded-xl border border-vw-border bg-vw-card p-10 text-center text-gray-500">
                    You haven't submitted any reports.
                  </div>
                ) : (
                  ownedReports.map((r) => (
                    <div key={r.id} className="rounded-xl border border-vw-border bg-vw-card p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <p className="text-sm text-gray-300 line-clamp-3">{r.content}</p>
                          <p className="mt-2 text-xs text-gray-600">
                            {new Date(r.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteReport(r.id)}
                          className="text-xs text-gray-600 transition hover:text-red-400"
                        >
                          Withdraw
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {tab === 'profile' && (
              <div className="space-y-6">
                <div className="rounded-xl border border-vw-border bg-vw-card p-6">
                  <h3 className="mb-5 text-sm font-semibold text-gray-300">Update Profile</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-400">Username</label>
                      <input
                        type="text"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        className="w-full rounded-lg border border-vw-border bg-vw-surface px-3 py-2.5 text-sm text-white focus:border-violet-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-xs font-medium text-gray-400">New Password</label>
                      <input
                        type="password"
                        value={profilePassword}
                        onChange={(e) => setProfilePassword(e.target.value)}
                        placeholder="Leave blank to keep current"
                        className="w-full rounded-lg border border-vw-border bg-vw-surface px-3 py-2.5 text-sm text-white placeholder-gray-600 focus:border-violet-500 focus:outline-none"
                      />
                    </div>
                    {profileMsg && (
                      <p className={`text-xs ${profileMsg.includes('success') ? 'text-green-400' : 'text-red-400'}`}>
                        {profileMsg}
                      </p>
                    )}
                    <button
                      onClick={handleSaveProfile}
                      disabled={profileSaving}
                      className="rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-violet-700 disabled:opacity-50"
                    >
                      {profileSaving ? 'Saving…' : 'Save Changes'}
                    </button>
                  </div>
                </div>

                <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6">
                  <h3 className="mb-2 text-sm font-semibold text-red-400">Danger Zone</h3>
                  <p className="mb-4 text-xs text-gray-500">
                    Permanently delete your account. All confessions will be removed.
                  </p>
                  {accountError && (
                    <p className="mb-3 text-xs text-red-400">{accountError}</p>
                  )}
                  <button
                    onClick={handleDeleteAccount}
                    className="rounded-lg border border-red-500/40 px-4 py-2 text-sm text-red-400 transition hover:bg-red-500/10"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {showCreate && (
        <CreateConfessionModal
          onClose={() => setShowCreate(false)}
          onCreated={handleCreated}
        />
      )}

      {showReport && (
        <ReportModal onClose={() => {
          setShowReport(false);
          loadReports();
        }} />
      )}
    </div>
  );
}
